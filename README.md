# 📚 MULTICON-W — Conference Research Repository (CRR)

A production-grade, secure, and modern research paper repository platform built for **MULTICON-W (TCET)**. This platform facilitates conference paper submission, administrative peer review, indexing, and open-access publication with Google Scholar metadata compatibility.

---

## 🏛️ System Architecture

The application is containerized using Docker Compose with strict multi-tier network isolation:

```
[ Internet / Visitors ]
          │
          ▼ HTTPS
[ Cloudflare Edge + Tunnel ]
          │
          ▼
[ Traefik Platform Proxy ] (Dokploy Platform Ingress)
          │
          │ Internal Network: dokploy-network
          ▼
┌────────────────────────────────────────────────────────┐
│  `web` (Nginx Reverse Proxy)                           │
│  - Port 80 internal listener                           │
│  - ngx_http_realip_module (restores CF-Connecting-IP)  │
│  - Rate Limiting (20 req/s, burst 40)                  │
│  - Max upload size: 30MB                               │
└──────────────────────────┬─────────────────────────────┘
                           │ Internal Network: edge
                           ▼
┌────────────────────────────────────────────────────────┐
│  `app` (Next.js 16 Production Application)             │
│  - SSR & REST APIs (App Router)                        │
│  - JWT Cookie Session Auth (HttpOnly, SameSite, Secure)│
│  - Academic SEO (Highwire Press metadata)              │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               │ Internal Network: internal│ Remote TLS / Internet
               ▼                           ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ `minio` (SeaweedFS S3)       │ │ MongoDB Atlas Cluster        │
│ - Lightweight S3 Blob Store  │ │ - Multi-replica cloud DB     │
│ - Port 8333 (S3 REST API)    │ │ - Encrypted storage (TLS)    │
│ - Persistent volume: /data   │ │ - Stores papers & auth data  │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Network Isolation Tiers:
1. **`dokploy-network`**: Only attached to `web` (Nginx) for Traefik traffic routing.
2. **`edge`**: Connects `web` (Nginx) to `app` (Next.js).
3. **`internal`**: Completely isolated backend network (`internal: true`). Only `app` and `minio` can communicate here. External traffic cannot reach the storage layer directly.

---

## 🚀 Key Features

- **Paper Management**: Contributor submission, PDF upload, administrative review (Approve / Reject / Changes Requested).
- **Search & Filter**: Full-text search across titles, authors, conference names, abstracts, and keywords.
- **Academic SEO**:
  - Dynamically generated Google Scholar citation metadata (`citation_title`, `citation_pdf_url`, `citation_doi`, etc.).
  - Automated `/sitemap.xml` and `/robots.txt` indexing.
- **Enterprise Security**:
  - Rate-limit protection on `/api/auth/login` (15 attempts/15 min) and `/api/*` (300 req/15 min).
  - Genuine client IP propagation via Cloudflare `CF-Connecting-IP`.
  - Secure, HTTP-only JWT sessions with token invalidation support.
  - Zero-race-condition startup gating via Docker health probes.

---

## ⚙️ Environment Variables Reference

Configure these in `.env`:

| Variable | Description | Example (Production) | Example (Local Dev) |
|---|---|---|---|
| `DOMAIN` | Host domain name | `multicon.tcetmumbai.in` | *(Optional in local)* |
| `APP_URL` | Canonical public URL | `https://multicon.tcetmumbai.in` | `http://localhost` |
| `JWT_SECRET` | 32+ character random secret | `<random_secure_string>` | `ehrygfiekduthrydhegirewbf...` |
| `ADMIN_LOGIN_ID` | Seeded admin username | `admin` | `admin` |
| `ADMIN_EMAIL` | Seeded admin email | `admin@tcetmumbai.in` | `admin@tcetmumbai.in` |
| `ADMIN_PASSWORD` | Seeded admin password | `<secure_admin_password>` | `Cse@424` |
| `MONGODB_URI` | MongoDB Atlas Connection URI | `mongodb+srv://...` or `mongodb://...` | `mongodb://...atlas cluster...` |
| `S3_ENDPOINT` | SeaweedFS S3 internal URL | `http://minio:8333` | `http://minio:8333` |
| `S3_ACCESS_KEY_ID` | S3 Access Key | `admin` | `admin` |
| `S3_SECRET_ACCESS_KEY` | S3 Secret Key | `<secure_s3_secret>` | `password` |
| `S3_BUCKET` | S3 bucket name for PDFs | `my-pdfs` | `my-pdfs` |
| `S3_REGION` | S3 region identifier | `us-east-1` | `us-east-1` |

---

## 🛠️ Local Development & Testing

1. **Clone and Setup:**
   ```bash
   cp .env.example .env   # Ensure MONGODB_URI and S3 credentials are set
   ```

2. **Launch Services:**
   ```bash
   docker compose up -d
   ```

3. **Check Container Status:**
   ```bash
   docker compose ps
   ```
   All services (`web`, `app`, `mongo`, `minio`) should report `Up (healthy)`.

4. **Verify Health Endpoint:**
   ```bash
   curl -i http://localhost/api/health
   # Expected: {"status":"ok","mongo":"up","storage":"up"}
   ```

5. **Access in Browser:**
   - **Frontend:** [http://localhost/](http://localhost/)
   - **Search:** [http://localhost/search](http://localhost/search)
   - **Admin Login:** [http://localhost/login](http://localhost/login) (Credentials from `.env`)

---

## 📦 Production Deployment & Upcoming Changes

> [!NOTE]
> **Pending Migration:** The user will be creating a **new MongoDB cluster** and configuring the **new production website URL/domain**. Detailed handoff instructions for updating `MONGODB_URI`, `DOMAIN`, and `APP_URL` are fully documented in [`NEXT_STEPS.md`](file:///c:/Users/Admin/Downloads/Multicon-W-2026-main/Multicon-W-2026-main/NEXT_STEPS.md).

For step-by-step instructions on moving to your VPS / Dokploy server, refer to [NEXT_STEPS.md](file:///c:/Users/Admin/Downloads/Multicon-W-2026-main/Multicon-W-2026-main/NEXT_STEPS.md).

