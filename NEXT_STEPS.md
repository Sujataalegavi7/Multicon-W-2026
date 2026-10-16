# 🚀 Server Deployment Guide & Next Steps

> [!IMPORTANT]
> ### 🤖 AI & Developer Handoff Notice: Pending Migration Changes
> In the next step, the user will be **creating a new MongoDB database** and **changing the website URL**. When this happens, follow these exact instructions:
> 
> 1. **New MongoDB Database:**
>    - Update `MONGODB_URI` in [`.env`](file:///c:/Users/Admin/Downloads/Multicon-W-2026-main/Multicon-W-2026-main/.env) (and in your server/Dokploy environment variables) with the new MongoDB connection string.
>    - Ensure the new cluster's **Network Access** whitelist in MongoDB Atlas allows the server's IP address (or `0.0.0.0/0`).
>    - When the application starts up against the clean database, `bootstrap()` will automatically seed the initial administrator account from `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
> 
> 2. **New Website URL & Domain:**
>    - Update `DOMAIN` in [`.env`](file:///c:/Users/Admin/Downloads/Multicon-W-2026-main/Multicon-W-2026-main/.env) to the new domain name (e.g., `research.tcetmumbai.in`).
>    - Update `APP_URL` in [`.env`](file:///c:/Users/Admin/Downloads/Multicon-W-2026-main/Multicon-W-2026-main/.env) to the new HTTPS URL (e.g., `https://research.tcetmumbai.in`).
>    - Verify that the Traefik router label in [`docker-compose.yml`](file:///c:/Users/Admin/Downloads/Multicon-W-2026-main/Multicon-W-2026-main/docker-compose.yml) matches `Host(`${DOMAIN:?DOMAIN must be set}`)`.
>    - Recreate the application container using `docker compose up -d app` to load the new environment variables.

This guide details the step-by-step checklist to shift MULTICON-W from localhost to your production server (e.g., VPS running Dokploy with Cloudflare Tunnel & Traefik).

---

## 📋 Overview of Changes (Localhost vs. Production Server)

| Component | Localhost State | Production Server (Dokploy) State |
|---|---|---|
| **Port Binding** | `ports: ["80:80"]` | **No published host ports** (Traefik routes traffic) |
| **Routing** | Direct host port 80 | **Traefik labels** on `web` container |
| **Network** | `edge`, `internal` | `edge`, `internal`, plus external `dokploy-network` |
| **`APP_URL`** | `http://localhost` | `https://multicon.tcetmumbai.in` (Strict HTTPS) |
| **`DOMAIN`** | Optional | `multicon.tcetmumbai.in` (Required for Traefik rule) |
| **Atlas Whitelist** | Current local IP / Any | Server Public IP whitelisted in Atlas |

---

## Step 1: Whitelist Server IP in MongoDB Atlas

Before deploying, MongoDB Atlas must permit connections from your production server:

1. Open **[MongoDB Atlas Console](https://cloud.mongodb.com/)**.
2. Go to **Security** ➔ **Network Access**.
3. Click **Add IP Address**.
4. Enter your production server's public IPv4 address (or `0.0.0.0/0` with strong password authentication if dynamic).
5. Click **Confirm**.

---

## Step 2: Push Code to Git Repository

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: multicon-w verified production build"
   ```
2. Ensure your `.env` is **never committed** (check `.gitignore`).
3. Push to your GitHub / GitLab repository linked to your server or Dokploy.

---

## Step 3: Update `docker-compose.yml` for Production (Dokploy)

In your production repository (or in the Dokploy Compose Editor), switch `docker-compose.yml` from local mode to production mode:

### 1. In the `web` service:
Remove `ports: ["80:80"]`, add `dokploy-network`, and add Traefik routing labels:

```yaml
  web:
    image: nginx:1.27-alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      app:
        condition: service_healthy
    networks: [edge, dokploy-network]
    restart: unless-stopped
    labels:
      - traefik.enable=true
      - traefik.docker.network=dokploy-network
      - "traefik.http.routers.multiconw.rule=Host(`${DOMAIN:?DOMAIN must be set}`)"
      - traefik.http.services.multiconw.loadbalancer.server.port=80
```

### 2. In the `networks` block at the bottom:
Add `dokploy-network` as external:

```yaml
networks:
  edge: {}
  internal:
    internal: true
  dokploy-network:
    external: true
```

*(Leave `app`, `mongo`, and `minio` exactly as they are — their health checks and internal networking are already configured).*

---

## Step 4: Configure Production Environment Variables (`.env`)

In Dokploy (under **Application Settings ➔ Environment**) or in your server's `.env` file, configure:

```ini
# ---------- App & Domain (HTTPS Required) ----------
DOMAIN=multicon.tcetmumbai.in
APP_URL=https://multicon.tcetmumbai.in
JWT_SECRET=generate_a_random_secure_64_character_hex_key_here

# ---------- Admin Account (Seeded on First Startup) ----------
ADMIN_LOGIN_ID=admin
ADMIN_EMAIL=admin@tcetmumbai.in
ADMIN_PASSWORD=SetAStrongProductionPassword123!

# ---------- MongoDB Atlas (Remote Cluster) ----------
MONGODB_URI=mongodb://himanshunaik7715_db_user:slZPkEnQ2NjDa72K@ac-j6lszro-shard-00-00.t0vu58q.mongodb.net:27017,ac-j6lszro-shard-00-01.t0vu58q.mongodb.net:27017,ac-j6lszro-shard-00-02.t0vu58q.mongodb.net:27017/?ssl=true&replicaSet=atlas-iem6xn-shard-0&authSource=admin&appName=Cluster0

# ---------- SeaweedFS S3 (Internal Storage) ----------
S3_ENDPOINT=http://minio:8333
S3_ACCESS_KEY_ID=admin
S3_SECRET_ACCESS_KEY=SetAStrongRandomS3SecretPasswordHere
S3_BUCKET=my-pdfs
S3_REGION=us-east-1
```

> [!IMPORTANT]
> - `APP_URL` **must** start with `https://`. This activates the `Secure` flag on JWT authentication cookies and ensures Google Scholar metadata points to production URLs.
> - `S3_ENDPOINT` **must** remain `http://minio:8333` so the `app` container communicates with SeaweedFS across the private Docker network.

---

## Step 5: Deploy the Containers

### On Dokploy:
Click **Deploy** (Dokploy builds the image, sets labels, connects to `dokploy-network`, and starts the stack).

### Or via Server CLI:
```bash
docker compose up -d --build
```

---

## Step 6: Post-Deployment Verification & Audit

Run these tests on the live server or from your terminal to verify everything is operating properly:

### 1. Verify Service Health
```bash
docker compose ps
```
All containers should display `Up (healthy)`.

### 2. Verify Health Check Endpoint
```bash
curl -i https://multicon.tcetmumbai.in/api/health
```
**Expected Response:**
```json
HTTP/2 200
{"status":"ok","mongo":"up","storage":"up"}
```

### 3. Verify Academic SEO Sitemap
```bash
curl -s https://multicon.tcetmumbai.in/sitemap.xml | grep "<loc>"
```
**Expected Response:** All URLs must start with `https://multicon.tcetmumbai.in/...` (never `localhost`).

### 4. Verify Cookie Security
1. Navigate to `https://multicon.tcetmumbai.in/login` in your browser.
2. Open DevTools (F12) ➔ **Application** ➔ **Cookies**.
3. Log in with admin credentials.
4. Verify the `crr_token` cookie has:
   - ✅ `HttpOnly` checked
   - ✅ `Secure` checked
   - ✅ `SameSite` = `Lax`

### 5. Verify PDF Upload and Retrieval
1. Go to the dashboard as a contributor and upload a test paper.
2. Log in as admin, navigate to Admin panel, and click **Approve**.
3. Open the paper on the public search page and verify the document preview / PDF loads cleanly.

---

## Step 7: Backup Strategy

- **Database (MongoDB Atlas):** Handled automatically through Atlas Cloud Backup (snapshots).
- **Files (SeaweedFS S3):** Uploaded PDF files are stored in the Docker volume `minio_data`. Back this up periodically:
  ```bash
  # Backup SeaweedFS volume to tar archive
  docker run --rm -v multicon-w-2026-main_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_data_backup_$(date +%Y%m%d).tar.gz /data
  ```
