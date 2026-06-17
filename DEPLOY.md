# Deploy to Render

## Prerequisites
1. A GitHub account
2. Push this project to a GitHub repo

## Step 1: Create a GitHub Repository

```bash
# In the project root directory
git init
git add .
git commit -m "Initial commit"
gh repo create property-maintenance --public --source=. --push
```

(Or create manually on github.com and push.)

## Step 2: Deploy on Render

### Option A: Blueprint (render.yaml) — One-click setup

1. Go to https://dashboard.render.com
2. Click **New > Blueprint**
3. Connect your GitHub repo
4. Render will read `render.yaml` and create:
   - **property-maintenance-db** — Free PostgreSQL database
   - **property-maintenance-api** — Node.js backend web service  
   - **property-maintenance-web** — React frontend static site

5. Click **Apply**

### Option B: Manual setup (if Blueprint fails)

#### 1. Create PostgreSQL database
- Click **New > PostgreSQL**
- Name: `property-maintenance-db`
- Plan: Free
- Region: Oregon
- Click **Create**
- Copy the **Internal Database URL** (starts with `postgres://`)

#### 2. Deploy Backend
- Click **New > Web Service**
- Connect your GitHub repo
- **Name**: `property-maintenance-api`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: Free
- **Advanced > Environment Variables**:
  - `DATABASE_URL`: paste the Internal Database URL from step 1
  - `JWT_SECRET`: click **Generate** (or use any random string)
  - `CORS_ORIGIN`: `https://property-maintenance-web.onrender.com`
  - `PORT`: `10000`
- Click **Create Web Service**
- Wait for the deploy to finish. Copy the URL (e.g., `https://property-maintenance-api.onrender.com`)

#### 3. Deploy Frontend
- Click **New > Static Site**
- Connect your GitHub repo
- **Name**: `property-maintenance-web`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Advanced > Environment Variables**:
  - `REACT_APP_API_URL`: `https://property-maintenance-api.onrender.com`
- Click **Create Static Site**
- Wait for deploy to finish.

## Step 3: Verify

- Visit `https://property-maintenance-web.onrender.com`
- Login with `admin` / `ChangeMeImmediately123!`

## Step 4: Google Form Integration

Update your Google Apps Script with the production backend URL:

```javascript
const API_URL = 'https://property-maintenance-api.onrender.com';
UrlFetchApp.fetch(API_URL + '/api/public/requests', { ... });
```

## Step 5: Change Admin Password

Login, go to the user management modal, or use this endpoint:

```bash
curl -X PATCH https://property-maintenance-api.onrender.com/api/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"currentPassword":"ChangeMeImmediately123!","newPassword":"YourNewPassword"}'
```

## Notes

- **Free tier**: The backend and database sleep after 15 minutes of inactivity. First visit after idle can take 30–60 seconds to wake up.
- **Data**: Data persists in PostgreSQL and survives restarts.
- **File uploads**: The `uploads/` directory won't persist on Render's ephemeral disk. For permanent file storage, integrate Cloudinary (the backend already has it configured) or use Render's Disk volumes (paid tier).
