<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXQwaGdzcGpmcjhmNTZtZmJpZTdpOTYyaTN5MWhnY2NwcWMyODJweCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LvtKS6f1WatQ4/giphy.gif" width="400" />
  
  <h1 style="color: #ff0055; text-transform: uppercase; letter-spacing: 2px;">MockBase 🎸</h1>
  <p><b>AI-Powered API Mock Server. Describe it. Generate it. Hack it.</b></p>
  
  <p>
    <a href="https://mockback.vercel.app/"><b>👉 LIVE DEMO ON VERCEL 👈</b></a><br/>
    <i>(Replace the link above with your actual Vercel URL!)</i>
  </p>
</div>

---

## ⚡ WHAT IS THIS?

MockBase is a hyper-fast, AI-driven backend generator. You describe an API in plain English, and the Groq LLM spits out a fully functional, stateful, shareable mock server in *under 5 seconds*. 

No more writing fake JSON responses by hand. No more fighting with Postman mock servers. Just type, deploy, and start hitting the endpoints.

### 🔥 Features:
- **🧠 Groq-Powered AI Generation**: Generates complex schema structures instantly.
- **💾 Stateful Redis Cache**: `POST` a new item? It actually saves it for 7 days. `GET` it back later.
- **☠️ Chaos Engineering**: Inject latency, rate limits, and error rates using our Spider-Punk sliders.
- **🔒 Protected Routes**: Toggle "Auth" to require auto-generated Bearer tokens.
- **🛰️ Live Log Streaming**: Watch frontend Server-Sent Events (SSE) stream traffic logs in real-time.

---

## 🏗️ THE ARCHITECTURE

We split this monorepo into 3 microservices so it scales like a beast. 

- **Frontend**: Next.js + React (Deployed on Vercel)
- **Core Server**: NestJS + TypeScript (Deployed on Render)
- **AI Brain**: FastAPI + Python + LangChain (Deployed on Render)
- **Databases**: PostgreSQL (Neon) & Redis (Upstash)

---

## 🛠️ LOCAL DEVELOPMENT (Docker Native)

Want to run the entire cluster on your laptop? We built a massive `docker-compose` setup just for that.

### 1. The Environment Variables
Create a `.env` file in the root directory. You need to connect it to your cloud databases (since we don't run Postgres/Redis locally to save your RAM).

```env
# Get these from Neon and Upstash
DATABASE_URL="postgresql://..."
REDIS_URL="rediss://..."

# Get this from Groq Console
GROQ_API_KEY="gsk_..."

# Leave these exactly like this for local Docker testing:
JWT_SECRET="super-secret-punk-key"
JWT_EXPIRES_IN="7d"
LLM_SERVICE_URL="http://llm-service:8000"
FRONTEND_URL="http://localhost:3001"
```

### 2. Boot the Cluster
Make sure Docker Desktop is running, then blast this into your terminal:

```bash
docker-compose up -d --build
```

That's it. Docker will build the Node 20 and Python 3.11 containers from scratch and network them together. 
Open `http://localhost:3001` and start hacking!

---

## 🚀 CLOUD DEPLOYMENT

We ditched expensive deployment platforms. This entire stack costs **$0/month**.

1. **Frontend**: Import the `apps/frontend` directory into **Vercel**. Set `NEXT_PUBLIC_API_URL` to your live API.
2. **Databases**: Use **Neon** (Serverless Postgres) and **Upstash** (Serverless Redis).
3. **Backends**: Create two manual Web Services on the **Render Free Tier**. Select "Docker" as the environment, point them to `apps/api` and `apps/llm-service`, and paste in your Environment Variables.

*Render might take 50 seconds to wake up your backend if you haven't pinged it in a while — that's just the punk rock tax for free hosting.*
