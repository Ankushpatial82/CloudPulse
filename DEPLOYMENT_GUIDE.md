# 🚀 CloudPulse — 100% Free Cloud Deployment Guide

Ye guide aapko **CloudPulse** ko 100% FREE cloud platforms par 5-10 minutes me live deploy karne ka step-by-step tareeqa batati hai:

- 🗄️ **Database**: Free Managed PostgreSQL (*Neon.tech* ya *Render Postgres*)
- ⚙️ **Backend API**: *Render.com* ya *Railway.app* (Free Node.js Web Service)
- 🖥️ **Frontend**: *Vercel.com* (Free Next.js Deployment)
- 🤖 **Telemetry Agent**: Aapke laptop/server par run hota hai

---

## 📌 STEP 1: Code ko GitHub par Push karein

Agar aapne abhi tak GitHub par repo nahi banayi:

```bash
# 1. Monorepo root directory me:
cd "/Users/ankushpatial/REAL-TIME INFRASTRUCTURE MONITORING PLATFORM"

# 2. Git initialize & commit
git init
git add .
git commit -m "feat: complete production-ready cloudpulse infrastructure monitoring platform"

# 3. GitHub par new repository banayein aur push karein:
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/cloudpulse.git
git push -u origin main
```

---

## 📌 STEP 2: Database & Backend API Deploy karein (Render.com)

1. **[Render.com](https://dashboard.render.com/)** par free account banayein (Login with GitHub).
2. **New +** button par click karein aur **Blueprint** select karein.
3. Apni GitHub repository `cloudpulse` select karein.
4. Render automatically `render.yaml` detect kar lega:
   - **PostgreSQL Database** automatically create ho jayegi.
   - **API Web Service** automatically build & start ho jayegi.
5. Deploy hone ke baad aapko API URL mil jayega, jaise:  
   `https://cloudpulse-api-xxxx.onrender.com`

> **Note**: Pehli baar deploy hone par database me tables banane ke liye Render Shell me ye command chalayein:
> ```bash
> npx prisma db push
> ```

---

## 📌 STEP 3: Frontend Deploy karein (Vercel.com)

1. **[Vercel.com](https://vercel.com/)** par login karein (Continue with GitHub).
2. **Add New Project** par click karein aur `cloudpulse` repo import karein.
3. Project Configuration me:
   - **Framework Preset**: Next.js (Default)
   - **Root Directory**: `apps/web` (Edit par click karke `apps/web` select karein)
4. **Environment Variables** section expand karein aur add karein:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://cloudpulse-api-xxxx.onrender.com/api` *(Aapke Step 2 ka Render API URL)*
5. **Deploy** button par click karein!
6. 1 minute me aapki live site tayar ho jayegi, jaise:  
   `https://cloudpulse.vercel.app`

---

## 📌 STEP 4: Live Telemetry Python Agent Connect karein

Aap jis bhi laptop ya server ko monitor karna chahte hain, wahan ye command run karein:

```bash
# Deployed cloud backend ke sath run karein:
cd agent
API_URL=https://cloudpulse-api-xxxx.onrender.com AGENT_TOKEN=cp_agent_70298f6afe44c5a53be2f9fc93aed61e python3 agent.py
```

Agent live CPU, RAM, Disk, aur Processes ka data seedha aapke Cloud Dashboard par stream karna shuru kar dega!

---

## 🎯 Verification Checklist

- [ ] Visit `https://cloudpulse.vercel.app`
- [ ] Login with `admin@cloudpulse.io` / `Admin@1234`
- [ ] Live servers and charts updating in real-time
- [ ] Dropdowns, Settings, API Keys & Webhooks fully interactive
