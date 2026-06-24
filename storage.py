import json
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash

DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = DATA_DIR / "inventory.json"
EMAIL_FILE = DATA_DIR / "email_config.json"
USERS_FILE = DATA_DIR / "users.json"

def _ensure():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text(json.dumps(_seed_data(), indent=2, ensure_ascii=False), encoding="utf-8")

def _seed_data():
    return [
        {"id": 1, "name": "Grip Rite Exterior Screws (tub)", "category": "Fasteners", "location": "Tub 1", "qty": 3, "minQty": 1, "notes": "Large clear plastic tub"},
        {"id": 2, "name": "Fas-n-Tite Drywall Screws (tub)", "category": "Fasteners", "location": "Tub 2", "qty": 3, "minQty": 1, "notes": "Large clear plastic tub"},
        {"id": 3, "name": "Assorted Screws (tub)", "category": "Fasteners", "location": "Tub 3", "qty": 3, "minQty": 1, "notes": "Large clear plastic tub"},
        {"id": 4, "name": "Loose Screws (bin)", "category": "Fasteners", "location": "Bin 1", "qty": 3, "minQty": 1, "notes": "Medium clear organizer"},
        {"id": 5, "name": "Collated Nails (bin)", "category": "Fasteners", "location": "Bin 2", "qty": 3, "minQty": 1, "notes": "Medium clear organizer"},
        {"id": 6, "name": "Assorted Fasteners (bin)", "category": "Fasteners", "location": "Bin 3", "qty": 3, "minQty": 1, "notes": "Medium clear organizer"},
        {"id": 7, "name": "Roofing Nails (box)", "category": "Fasteners", "location": "Box 1", "qty": 2, "minQty": 1, "notes": "Large cardboard box"},
        {"id": 8, "name": "Grip Rite Exterior Screws (box)", "category": "Fasteners", "location": "Box 2", "qty": 2, "minQty": 1, "notes": "Large cardboard box"},
        {"id": 9, "name": "Fas-n-Tite Framing Nails", "category": "Fasteners", "location": "Box 3", "qty": 2, "minQty": 1, "notes": "Small cardboard box"},
        {"id": 10, "name": "Clendenin Brothers Fasteners", "category": "Fasteners", "location": "Box 4", "qty": 2, "minQty": 1, "notes": "White CBI box"},
        {"id": 11, "name": "Panel/Trim Nails (tub)", "category": "Fasteners", "location": "Tub 4", "qty": 1, "minQty": 1, "notes": "Small clear plastic tub"},
        {"id": 12, "name": "Specialty Anchors (bag)", "category": "Fasteners", "location": "Bag 1", "qty": 2, "minQty": 1, "notes": "Large plastic bag of toggle bolts"},
        {"id": 13, "name": "Toggle Bolts (bag)", "category": "Fasteners", "location": "Bag 2", "qty": 2, "minQty": 1, "notes": "Large plastic bag"},
        {"id": 14, "name": "Simpson Strong-Tie Connectors", "category": "Fasteners", "location": "Shelf C", "qty": 2, "minQty": 1, "notes": "Orange label pack"},
        {"id": 15, "name": "Simpson Strong-Tie Fasteners", "category": "Fasteners", "location": "Shelf C", "qty": 2, "minQty": 1, "notes": "Orange label pack"},
        {"id": 16, "name": "Tapcon Concrete Anchors", "category": "Fasteners", "location": "Shelf C", "qty": 1, "minQty": 1, "notes": "Blister pack"},
        {"id": 17, "name": "Hillman Washer Slotted Screws", "category": "Fasteners", "location": "Shelf C", "qty": 1, "minQty": 1, "notes": "Blue label blister pack"},
        {"id": 18, "name": "Plastic Anchors with Screws", "category": "Fasteners", "location": "Shelf C", "qty": 1, "minQty": 1, "notes": "Red label blister pack"},
        {"id": 19, "name": "Scott Living Hardware Pack", "category": "Fasteners", "location": "Shelf C", "qty": 1, "minQty": 1, "notes": ""},
        {"id": 20, "name": "Structural Bolts (loose)", "category": "Fasteners", "location": "Shelf C", "qty": 2, "minQty": 1, "notes": "Long individual bolts"},
        {"id": 21, "name": "Muriatic Acid - Crown", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Large jug"},
        {"id": 22, "name": "Muriatic Acid - Sunnyside", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Smaller bottle"},
        {"id": 23, "name": "Thompson's WaterSeal Advanced", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Large jug"},
        {"id": 24, "name": "Eagle Clear Satin Concrete Sealer", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Large jug"},
        {"id": 25, "name": "1-K Heater Fuel Kerosene", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 26, "name": "Klean Strip Paint Stripper After Wash", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Metal can"},
        {"id": 27, "name": "Roundup Weed & Grass Killer", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Large jug"},
        {"id": 28, "name": "Root Stimulator - Forti-lome", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 29, "name": "Root Stimulator - Green Light", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 30, "name": "Krud Kutter House & Siding Cleaner", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 31, "name": "Krud Kutter Concentrated Degreaser", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 32, "name": "Zep Neutral pH Floor Cleaner", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 33, "name": "Clorox Outdoor Bleach", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 34, "name": "HDX Germicidal Bleach", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 35, "name": "30 SECONDS Outdoor Cleaner", "category": "Chemicals", "location": "Shelf D1", "qty": 1, "minQty": 1, "notes": "Jug"},
        {"id": 36, "name": "RMR-141 Disinfectant Cleaner", "category": "Cleaners", "location": "Shelf E1", "qty": 4, "minQty": 1, "notes": "Jugs"},
        {"id": 37, "name": "RMR-86 Mold Stain Remover", "category": "Cleaners", "location": "Shelf E1", "qty": 2, "minQty": 1, "notes": "Jugs"},
        {"id": 38, "name": "Lysol Disinfectant Clean & Fresh", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Purple liquid jug"},
        {"id": 39, "name": "Clorox Clean-Up + Bleach", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Large spray jug"},
        {"id": 40, "name": "Resolve Carpet Cleaner", "category": "Cleaners", "location": "Shelf E1", "qty": 2, "minQty": 1, "notes": "Spray bottles"},
        {"id": 41, "name": "LA's Totally Awesome Cleaner", "category": "Cleaners", "location": "Shelf E1", "qty": 2, "minQty": 1, "notes": "Spray bottles"},
        {"id": 42, "name": "Goo Gone Adhesive Remover", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Spray bottle"},
        {"id": 43, "name": "Zep Stainless Steel Cleaner", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Spray bottle"},
        {"id": 44, "name": "Lassie Indoor/Outdoor Repellent", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Spray bottle"},
        {"id": 45, "name": "Tarni-Shield Silver Polish", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Bottle"},
        {"id": 46, "name": "Liquid Drain Opener", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Bottle"},
        {"id": 47, "name": "Old English Scratch Cover", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "For dark woods"},
        {"id": 48, "name": "Weiman Quartz Clean & Shine", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Bottle"},
        {"id": 49, "name": "Brite Bowl Toilet Cleaner", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Bottle"},
        {"id": 50, "name": "Pledge Enhancing Polish", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Aerosol can"},
        {"id": 51, "name": "Zep Foaming Wall Cleaner", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Aerosol can"},
        {"id": 52, "name": "Lysol Disinfectant Spray", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Aerosol can"},
        {"id": 53, "name": "Glade Room Spray", "category": "Cleaners", "location": "Shelf E1", "qty": 1, "minQty": 1, "notes": "Aerosol can"},
        {"id": 54, "name": "SW Scuff Tuff Paint (gal)", "category": "Paint", "location": "Paint Rack 1", "qty": 32, "minQty": 5, "notes": "Sherwin-Williams and Benjamin Moore"},
        {"id": 55, "name": "Minwax Wood Finish (qt)", "category": "Paint", "location": "Paint Rack 2", "qty": 8, "minQty": 2, "notes": "Wood stain quarts"},
        {"id": 56, "name": "Zinsser Bulls Eye Primer (qt)", "category": "Paint", "location": "Paint Rack 2", "qty": 3, "minQty": 1, "notes": "Primer quarts"},
        {"id": 57, "name": "Benjamin Moore Paint (qt)", "category": "Paint", "location": "Paint Rack 2", "qty": 3, "minQty": 1, "notes": "Ceiling paint, Satin Impervo, Aura"},
        {"id": 58, "name": "Sample Paint & Stain Cans", "category": "Paint", "location": "Paint Rack 2", "qty": 23, "minQty": 5, "notes": "Half-pint/mini sample cans"},
        {"id": 59, "name": "Varathane Wood Putty", "category": "Paint", "location": "Paint Rack 2", "qty": 3, "minQty": 1, "notes": "Small jars"},
        {"id": 60, "name": "Touch-Up Paint Bottles", "category": "Paint", "location": "Paint Rack 2", "qty": 2, "minQty": 1, "notes": "Tiny vials"},
        {"id": 61, "name": "Rust-Oleum Stops Rust Primer", "category": "Paint", "location": "Paint Rack 3", "qty": 6, "minQty": 2, "notes": "Aerosol cans"},
        {"id": 62, "name": "Krylon Fusion/ColorMaxx", "category": "Paint", "location": "Paint Rack 3", "qty": 2, "minQty": 1, "notes": "Aerosol cans"},
        {"id": 63, "name": "Kilz UpShot/ProBlock Primer", "category": "Paint", "location": "Paint Rack 3", "qty": 2, "minQty": 1, "notes": "Aerosol cans"},
        {"id": 64, "name": "Rust-Oleum Inverted Marking Paint", "category": "Paint", "location": "Paint Rack 3", "qty": 2, "minQty": 1, "notes": "Neon orange caps"},
        {"id": 65, "name": "Varathane Wood Stain Spray", "category": "Paint", "location": "Paint Rack 3", "qty": 2, "minQty": 1, "notes": "Aerosol"},
        {"id": 66, "name": "Great Stuff Insulating Foam", "category": "Paint", "location": "Paint Rack 3", "qty": 2, "minQty": 1, "notes": "Cans"},
        {"id": 67, "name": "Coil Cleaner", "category": "Paint", "location": "Paint Rack 3", "qty": 1, "minQty": 1, "notes": "Can"},
        {"id": 68, "name": "Valspar Bonding Primer", "category": "Paint", "location": "Paint Rack 3", "qty": 1, "minQty": 1, "notes": "Can"},
        {"id": 69, "name": "Rust-Oleum 2X Ultra Cover", "category": "Paint", "location": "Paint Rack 3", "qty": 1, "minQty": 1, "notes": "Spray paint"},
        {"id": 70, "name": "Rust-Oleum Professional Spray", "category": "Paint", "location": "Paint Rack 3", "qty": 1, "minQty": 1, "notes": "Can"},
        {"id": 71, "name": "Brass/Gold Spray Paint", "category": "Paint", "location": "Paint Rack 3", "qty": 3, "minQty": 1, "notes": "Aerosol cans"},
        {"id": 72, "name": "Dark Blue Aerosol Cans", "category": "Paint", "location": "Paint Rack 3", "qty": 5, "minQty": 1, "notes": "White capped"},
        {"id": 73, "name": "Adhesive/Sealant Tube", "category": "Paint", "location": "Paint Rack 3", "qty": 1, "minQty": 1, "notes": "Tube"},
        {"id": 74, "name": "Paint Roller Covers (3-pack)", "category": "Paint Accessories", "location": "Shelf F", "qty": 3, "minQty": 1, "notes": "Sealed plastic pack"},
        {"id": 75, "name": "Wooden Stir Stick", "category": "Paint Accessories", "location": "Shelf F", "qty": 1, "minQty": 1, "notes": "Tool handle"},
    ]

def load():
    _ensure()
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))

def save(items):
    _ensure()
    DATA_FILE.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")

def next_id(items):
    return max((i["id"] for i in items), default=0) + 1

def load_email_config():
    if EMAIL_FILE.exists():
        return json.loads(EMAIL_FILE.read_text(encoding="utf-8"))
    return {"to_email": "", "smtp_server": "smtp.gmail.com", "smtp_port": 587, "smtp_user": "", "smtp_pass": ""}

def save_email_config(cfg):
    EMAIL_FILE.write_text(json.dumps(cfg, indent=2), encoding="utf-8")

def load_users():
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    return []

def save_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")

def add_user(email, password):
    users = load_users()
    if any(u["email"] == email for u in users):
        return None
    user = {
        "id": max((u["id"] for u in users), default=0) + 1,
        "email": email,
        "password": generate_password_hash(password),
    }
    users.append(user)
    save_users(users)
    return user

def get_user_by_email(email):
    users = load_users()
    return next((u for u in users if u["email"] == email), None)

def verify_user(email, password):
    user = get_user_by_email(email)
    if user and check_password_hash(user["password"], password):
        return user
    return None

def get_all_user_emails():
    users = load_users()
    return [u["email"] for u in users if u.get("email")]