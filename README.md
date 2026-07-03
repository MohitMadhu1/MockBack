# MockBase

AI-Powered API Mock Server. Describe an API in plain English, get a live, shareable mock server in under a minute.

## Architecture

- **Frontend**: Next.js (React)
- **Core Server**: NestJS (TypeScript)
- **LLM Service**: FastAPI (Python) + LangChain + Groq
- **Database**: PostgreSQL (Configs, Users, Logs)
- **State/Cache**: Redis (Ephemeral mock data, rate limits)

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js (v20+)
- Python (3.12+)

### Setup

1. Copy `.env.example` to `.env` and fill in your Groq API key:
   ```bash
   cp .env.example .env
   ```

2. Start local databases (Postgres & Redis):
   ```bash
   docker-compose up -d
   ```

3. Setup Core Server (NestJS):
   ```bash
   cd apps/api
   npm install
   npm run start:dev
   ```

4. Setup LLM Service (FastAPI):
   ```bash
   cd apps/llm-service
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. Setup Frontend (Next.js):
   ```bash
   cd apps/frontend
   npm install
   npm run dev
   ```

## Deployment (Render)

MockBase is designed to be deployed on Render with 3 web services (Frontend, API, LLM) and 2 managed databases (Postgres, Redis). See `render.yaml` for deployment configuration.
