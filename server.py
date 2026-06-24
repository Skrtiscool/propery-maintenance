import io, json, os, smtplib, ssl
import qrcode
from email.message import EmailMessage
from flask import Flask, request, jsonify, render_template, send_file, session
from storage import load, save, next_id, load_email_config, save_email_config, add_user, verify_user, get_user_by_email, get_all_user_emails
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev-inventory-secret-key-2026"


def login_required(f):
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper


def send_email(item_name, qty, is_out=True, to_emails=None):
    cfg = load_email_config()
    smtp_server = cfg.get("smtp_server", "smtp.gmail.com")
    smtp_port = cfg.get("smtp_port", 587)
    smtp_user = cfg.get("smtp_user", "")
    smtp_pass = cfg.get("smtp_pass", "")

    if not smtp_user or not smtp_pass:
        print("Email not configured - no SMTP credentials")
        return

    if to_emails is None:
        to_emails = get_all_user_emails()
    to_emails = [e for e in to_emails if e]
    if not to_emails:
        print("No users to notify")
        return

    if is_out:
        subject = f"OUT OF STOCK: {item_name}"
        body = f"Alert: {item_name} is out of stock (0 remaining).\n\nCheck your inventory: https://192.168.1.91:5001"
    else:
        subject = f"LOW STOCK: {item_name}"
        body = f"Alert: {item_name} has only {qty} remaining.\n\nCheck your inventory: https://192.168.1.91:5001"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_user or "inventory@localhost"
    msg["To"] = to_emails[0]
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as s:
            s.starttls(context=ssl.create_default_context())
            if smtp_user and smtp_pass:
                s.login(smtp_user, smtp_pass)
            s.send_message(msg, to_addrs=to_emails)
    except Exception as e:
        print(f"Email failed: {e}")
        raise


def check_stock_and_notify(items, updated_id=None):
    for item in items:
        qty = item["qty"] or 0
        min_qty = item.get("minQty") or 0
        if updated_id is not None and item["id"] != updated_id:
            continue
        if qty == 0:
            try: send_email(item["name"], qty, is_out=True)
            except: pass
        elif qty > 0 and qty <= min_qty:
            try: send_email(item["name"], qty, is_out=False)
            except: pass


@app.route("/")
def index():
    resp = render_template("index.html")
    return resp, 200, {"Cache-Control": "no-store, max-age=0"}


# ── Auth ──

@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password", "")
    if not email or "@" not in email:
        return jsonify({"error": "Valid email required"}), 400
    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400
    user = add_user(email, password)
    if user is None:
        return jsonify({"error": "Email already registered"}), 409
    session["user_id"] = user["id"]
    session["user_email"] = user["email"]
    return jsonify({"ok": True, "email": user["email"]})


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password", "")
    user = verify_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    session["user_id"] = user["id"]
    session["user_email"] = user["email"]
    return jsonify({"ok": True, "email": user["email"]})


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    if "user_id" in session:
        return jsonify({"email": session.get("user_email")})
    return jsonify({"error": "Unauthorized"}), 401


@app.route("/api/items", methods=["GET"])
@login_required
def get_items():
    items = load()
    q = (request.args.get("q") or "").lower()
    cat = request.args.get("category") or ""
    status = request.args.get("status") or ""
    if q:
        items = [i for i in items if q in i["name"].lower() or q in (i.get("notes") or "").lower()]
    if cat:
        items = [i for i in items if (i.get("category") or "") == cat]
    if status == "low":
        items = [i for i in items if 0 < (i["qty"] or 0) <= (i.get("minQty") or 0)]
    elif status == "out":
        items = [i for i in items if (i["qty"] or 0) == 0]
    elif status == "ok":
        items = [i for i in items if (i["qty"] or 0) > (i.get("minQty") or 0)]
    return jsonify(sorted(items, key=lambda x: x["name"].lower()))


@app.route("/api/items", methods=["POST"])
@login_required
def add_item():
    data = request.get_json()
    items = load()
    item = {
        "id": next_id(items),
        "name": (data.get("name") or "").strip(),
        "category": (data.get("category") or "").strip(),
        "location": (data.get("location") or "").strip(),
        "qty": max(0, int(data.get("qty", 0))),
        "minQty": max(0, int(data.get("minQty", 0))),
        "notes": (data.get("notes") or "").strip(),
    }
    if not item["name"]:
        return jsonify({"error": "Name is required"}), 400
    items.append(item)
    save(items)
    check_stock_and_notify([item])
    return jsonify(item), 201


@app.route("/api/items/<int:item_id>", methods=["PUT"])
@login_required
def update_item(item_id):
    data = request.get_json()
    items = load()
    for item in items:
        if item["id"] == item_id:
            item["name"] = (data.get("name") or "").strip()
            item["category"] = (data.get("category") or "").strip()
            item["location"] = (data.get("location") or "").strip()
            item["qty"] = max(0, int(data.get("qty", 0)))
            item["minQty"] = max(0, int(data.get("minQty", 0)))
            item["notes"] = (data.get("notes") or "").strip()
            if not item["name"]:
                return jsonify({"error": "Name is required"}), 400
            save(items)
            check_stock_and_notify(items, updated_id=item_id)
            return jsonify(item)
    return jsonify({"error": "Not found"}), 404


@app.route("/api/items/<int:item_id>", methods=["DELETE"])
@login_required
def delete_item(item_id):
    items = load()
    items = [i for i in items if i["id"] != item_id]
    save(items)
    return jsonify({"ok": True})


@app.route("/api/categories", methods=["GET"])
@login_required
def get_categories():
    items = load()
    cats = sorted({i.get("category") for i in items if i.get("category")})
    return jsonify(cats)


@app.route("/api/stats", methods=["GET"])
@login_required
def get_stats():
    items = load()
    total = len(items)
    total_qty = sum(i["qty"] or 0 for i in items)
    low = sum(1 for i in items if 0 < (i["qty"] or 0) <= (i.get("minQty") or 0))
    out = sum(1 for i in items if (i["qty"] or 0) == 0)
    return jsonify({"total": total, "totalQty": total_qty, "low": low, "out": out})


@app.route("/api/items/<int:item_id>/qrcode")
@login_required
def item_qrcode(item_id):
    items = load()
    item = next((i for i in items if i["id"] == item_id), None)
    if not item:
        return jsonify({"error": "Not found"}), 404
    qr_data = f"INV-{item_id}"
    qr_img = qrcode.make(qr_data, box_size=8).convert("RGB")

    qr_w, qr_h = qr_img.size
    pad = 20
    text_h = 36
    total_w = qr_w + pad * 2
    total_h = qr_h + text_h + pad * 2

    canvas = Image.new("RGB", (total_w, total_h), "white")
    canvas.paste(qr_img, (pad, pad))

    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()

    text = item["name"]
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((total_w - tw) // 2, qr_h + pad + 6), text, fill="black", font=font)

    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")


@app.route("/api/email/config", methods=["GET"])
@login_required
def get_email_config():
    cfg = load_email_config()
    return jsonify({k: v for k, v in cfg.items() if k != "smtp_pass"})


@app.route("/api/email/config", methods=["POST"])
@login_required
def set_email_config():
    data = request.get_json()
    cfg = load_email_config()
    for key in ("to_email", "smtp_server", "smtp_port", "smtp_user", "smtp_pass"):
        if key in data:
            cfg[key] = data[key]
    try:
        cfg["smtp_port"] = int(cfg.get("smtp_port", 587))
    except:
        cfg["smtp_port"] = 587
    save_email_config(cfg)
    return jsonify({"ok": True})


@app.route("/api/email/test", methods=["POST"])
@login_required
def test_email():
    cfg = load_email_config()
    if not cfg.get("smtp_user") or not cfg.get("smtp_pass"):
        return jsonify({"error": "SMTP not configured. Enter credentials in the bell menu."}), 400
    users = get_all_user_emails()
    if not users:
        return jsonify({"error": "No registered users to notify"}), 400
    try:
        send_email("Test from Basement Inventory", 0, is_out=True, to_emails=users)
        return jsonify({"ok": True, "message": f"Test sent to {len(users)} user(s)"})
    except Exception as e:
        err = str(e)
        if "535" in err or "Authentication" in err:
            return jsonify({"error": "SMTP authentication failed. Check your username and app password."}), 500
        return jsonify({"error": err}), 500


@app.route("/ca.pem")
def ca_cert():
    ca_path = os.path.expanduser("~\\AppData\\Local\\mkcert\\rootCA.pem")
    if os.path.exists(ca_path):
        return send_file(ca_path, mimetype="application/x-pem-file", as_attachment=True, download_name="rootCA.pem")
    return jsonify({"error": "CA not found"}), 404


if __name__ == "__main__":
    import ssl as ssl_mod
    ctx = ssl_mod.SSLContext(ssl_mod.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain("server.crt", "server.key")
    print("  Basement Inventory is running!")
    print("  Open https://localhost:5001 in your browser")
    print("  On your network: https://192.168.1.91:5001")
    app.run(debug=True, host="0.0.0.0", port=5001, ssl_context=ctx)
