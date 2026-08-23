# 🚀 CloudPulse — Real-Time Infrastructure Monitoring & Observability Platform

<div align="center">

![CloudPulse Banner](https://img.shields.io/badge/CloudPulse-Real--Time_Observability-06b6d4?style=for-the-badge&logo=datadog&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live_Demo-cloud--pulse--web.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://cloud-pulse-web.vercel.app)
[![API Status](https://img.shields.io/badge/API_Status-Online_(Render)-464EB8?style=for-the-badge&logo=render&logoColor=white)](https://cloudpulse-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

**A production-ready, distributed infrastructure monitoring platform inspired by Datadog and Grafana.**
<br/>
*Live telemetry streaming, threshold incident alerting, cross-node process observer, and analytical SLA reports.*

</div>

---

## 🌟 Live Deployments & Instant Sandbox

| Component | Platform | URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [cloud-pulse-web.vercel.app](https://cloud-pulse-web.vercel.app) | 🟢 Live |
| **Backend Engine** | Render | [cloudpulse-api.onrender.com](https://cloudpulse-api.onrender.com) | 🟢 Live |
| **Live Demo Access** | Web | [Instant Sandbox Mode](https://cloud-pulse-web.vercel.app/login) (Click *ADMIN*, *USER*, or *VIEWER*) | 🟢 1-Click Access |

---

## ⚡ Key Highlights & Core Features

- 📊 **Real-Time Telemetry Streaming**: Sub-second socket-driven metrics push for CPU Load, Memory Allocation, Swap, Disk IO, Network Bandwidth, and Load Averages.
- 🖥️ **Multi-Host Node Management**: Connect and monitor physical servers, cloud VMs (AWS/GCP/DigitalOcean), and local machines with dynamic Health Scoring (0–100%).
- 🚨 **Automated Incident Alerting**: Configurable threshold rules (e.g. `CPU > 85%`, `Memory > 90%`) with automatic state evaluation (`INFO`, `WARNING`, `CRITICAL`) and resolution workflows.
- 🔍 **Cross-Server Process Observer**: Inspect real-time OS process trees, identify high-memory consumers, and filter by process name or PID across the entire node cluster.
- 📈 **Analytical Report Builder**: Generate infrastructure health rollups, historical SLA compliance summaries, and export datasets as `.csv`.
- 📜 **Security & Audit Operations Log**: Full chronological trail of user registrations, logins, node creation, and alert triggers.
- 👥 **Role-Based Access Control (RBAC)**: Strict permission boundaries for `ADMIN` (full cluster control), `USER` (server/alert management), and `VIEWER` (read-only monitoring).
- 🐍 **Lightweight Python Agent**: Ultra-low footprint daemon (< 15MB RAM) utilizing `psutil` to collect and stream telemetry over secure token-authenticated endpoints.

---

## 📡 Architecture Overview

```mermaid
flowchart TD
    subgraph Host["🖥️ Monitored Hosts / Nodes"]
        Agent["🐍 Python Monitoring Daemon (psutil)"]
    end

    subgraph Cloud["⚡ Cloud Infrastructure Backend (Render)"]
        API["🚀 Node.js / Express API Engine"]
        Redis[("⚡ Redis (Rate Limiting & Memory Store)")]
        DB[("💾 PostgreSQL (Prisma ORM)")]
        Socket["📡 Socket.IO Real-Time Stream Gateway"]
        AlertEngine["⚙️ Incident & Threshold Evaluation Engine"]
    end

    subgraph Client["💻 Observability Client (Vercel)"]
        UI["✨ Next.js App Router (Tailwind CSS + Recharts)"]
    end

    Agent -- "1. Telemetry Ingest (POST / 5s)" --> API
    API -- "2. Authenticate & Store" --> DB
    API -- "3. Cache / Rate Limit" --> Redis
    API -- "4. Trigger Evaluation" --> AlertEngine
    AlertEngine -- "5. Emit Alert Incident" --> Socket
    API -- "6. Broadcast Metrics" --> Socket
    Socket -- "7. Real-Time Push" --> UI
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, TanStack Query |
| **Backend API** | Node.js, Express.js, TypeScript, Socket.IO, Prisma ORM, Helmet, Zod Validation |
| **Database & Cache** | PostgreSQL, Redis (Optional in-memory fallback) |
| **Host Agent** | Python 3.8+, `psutil`, `requests`, `websocket-client` |
| **Architecture** | Monorepo structure with shared TypeScript packages (`@cloudpulse/shared`) |
| **Deployment** | Vercel (Frontend), Render (Backend API), Docker & Docker Compose |

---

## 📁 Repository Structure

```text
CloudPulse/
├── apps/
│   ├── api/                    # Express + Socket.IO Backend Server
│   │   ├── src/
│   │   │   ├── controllers/    # Route controllers (Auth, Server, Metrics, Alerts, Reports)
│   │   │   ├── services/       # Core business logic & Incident rule engine
│   │   │   ├── sockets/        # Real-time Socket.IO connection manager
│   │   │   ├── middlewares/    # JWT Auth, Agent Token Auth, RBAC, Rate Limiting
│   │   │   └── routes/         # Express API routes
│   │   └── package.json
│   └── web/                    # Next.js Observability Dashboard
│       ├── app/                # Next.js App Router pages (Overview, Servers, Alerts, etc.)
│       ├── components/         # Reusable charts, tables, gauges, and modals
│       ├── lib/                # API fetch helpers & Socket.IO client
│       └── package.json
├── packages/
│   └── shared/                 # Shared TypeScript interfaces, DTOs & Zod schemas
├── agent/                      # Python Host Monitoring Agent
│   ├── agent.py                # Main telemetry collection & ingestion loop
│   ├── metrics.py              # Hardware & OS process metrics extractor
│   ├── config.py               # Agent environment settings
│   └── requirements.txt        # Python dependencies
├── prisma/
│   └── schema.prisma           # Prisma schema definition (PostgreSQL)
├── docker-compose.yml          # Full stack multi-container orchestration
└── package.json                # Monorepo root configuration
```

---

## 🏁 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Ankushpatial82/CloudPulse.git
cd CloudPulse
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Backend API (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/cloudpulse"
JWT_SECRET="your_secure_jwt_secret_key"
PORT=5002
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"

# Frontend Web (apps/web/.env.local)
NEXT_PUBLIC_API_URL="http://localhost:5002/api"
```

### 3. Run Database Migrations
```bash
npx prisma db push
```

### 4. Start Development Servers
```bash
# Start backend API (Port 5002)
npm run dev:api

# In a new terminal, start frontend web dashboard (Port 3000)
npm run dev:web
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐍 Connecting a Monitored Host (Python Agent)

1. Open the CloudPulse dashboard and navigate to **Servers** > **Add Host Node**.
2. Register your node name to generate a unique `AGENT_TOKEN`.
3. On the target host machine, start the agent daemon:

```bash
cd agent
pip install -r requirements.txt

# Run with environment credentials
export API_URL="https://cloudpulse-api.onrender.com"
export AGENT_TOKEN="your_generated_agent_token_here"

python agent.py
```

*The agent will immediately begin streaming real-time hardware telemetry and active processes to the dashboard!*

---

## 🐳 Docker Deployment (One-Command Launch)

To spin up the full containerized stack locally including PostgreSQL and Redis:

```bash
docker-compose up --build
```

Services initialized:
- 🌐 **Web Dashboard**: `http://localhost:3000`
- ⚡ **API Engine**: `http://localhost:5002`
- 💾 **PostgreSQL Database**: `localhost:5432`
- ⚡ **Redis Cache**: `localhost:6379`

---

## 🔒 Security & Best Practices

- **Token-Isolated Agent Pipelines**: Each monitored host authenticates via distinct scoped agent keys (`X-Agent-Token`).
- **Cryptographic Security**: Passwords hashed using standard `bcrypt` with salt rounds.
- **Strict Role Boundaries**: Enforced RBAC middleware on all API routes preventing privilege escalation.
- **Zero-Crash Resilience**: Non-blocking Redis fallback mode and client-side sanitization against malformed error responses.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/Ankushpatial82/CloudPulse/issues).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ by Ankush Patial · Powered by Next.js, Node.js & Python</sub>
</div>
