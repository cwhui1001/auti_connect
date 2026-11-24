# AutiConnect

AutiConnect is a Final Year Project investigating whether an AI system can progressively learn an individual's interaction preferences and provide more relevant support. The first demonstration uses synthetic accounts and simulated interactions. **M1 establishes the application and identity foundation.**

## Problem and objectives

An individual may prefer a checklist for one task and numbered steps for another. They may also change their preference over time. A static profile captures explicit settings but cannot measure or adapt to those patterns. Repeating instructions and context across interactions also adds work for the user.

- Give users control over what the system remembers and when it uses that information.
- Demonstrate measurable learning from task context, choices and feedback through a fitted model with real parameter updates.
- Show how adaptation compares with static settings, simple statistical baselines and generic LLM responses.
- Reuse confirmed knowledge across allowed support modules with consistent privacy and precedence rules.

## Proof of concept

The proposed system combines three independent AI capabilities. **Memory** extracts reviewable information from conversations and finds relevant confirmed memories with embeddings and pgvector. **Preference learning** predicts instruction format from structured prior choices and adapts a fitted model for each eligible account. **Generation** uses reviewed context and eligible predictions to produce grounded responses through a provider-neutral LLM interface.

The first prediction target is a user's next instruction-format choice among numbered steps, a checklist and a paragraph. Confirmed settings take precedence over predictions. The AI Learning Lab will show what was learned, where the evidence came from, and how performance changed. The synthetic proof of concept measures technical behaviour. Future human-participant evaluation has a separate design.

## Technology and project structure

| Area | Planned technology |
| --- | --- |
| User interface | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| API and workers | Python and FastAPI, with a command that runs training and maintenance outside the request path |
| Identity, data and artifacts | Supabase Auth, PostgreSQL, pgvector and private artifact storage |
| Memory and generation | Separate embedding and LLM interfaces, with Sentence Transformers as the first embedding option |
| Experiments | Pandas, NumPy and scikit-learn. River is an alternative for streaming experiments. PyTorch and Hugging Face PEFT are optional for adapter experiments. |

```text
auti_connect/
├── docs/                  # M0 design and research documents
├── frontend/              # Next.js application, UI primitives, and smoke test
├── backend/
│   ├── app/               # FastAPI routes, validation, configuration and Supabase adapter
│   └── tests/             # API tests and opt-in hosted verification
├── supabase/migrations/   # Versioned PostgreSQL schema and policies
├── experiments/           # Planned dataset generators, training and comparative evaluation
├── AGENTS.md
└── README.md
```

## Run M1 locally

Use Node.js 24 LTS with npm, Python 3.11 or newer, and a hosted Supabase development project. Run both application processes from your computer. The database and Auth run on Supabase.

1. In your Supabase development project, run [the foundation migration](supabase/migrations/202611250001_foundation.sql) once through the SQL Editor. It enables pgvector and creates the protected profile table.
2. Enable email/password registration and email confirmation. Add `http://localhost:3000/auth/confirm` to **Authentication → URL Configuration → Redirect URLs**. Use `http://localhost:3000` as the development Site URL. The default confirmation link exchanges a code in the browser that started registration. For confirmation across browsers, the route also supports the Supabase email template URL `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`. [Supabase Next.js SSR setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
3. Copy the frontend example to `frontend/.env.local` and the backend example to `backend/.env`. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to the same project URL and `sb_publishable_` key in both. Open the frontend at the origin configured in `APP_ORIGIN`. The default backend URL is `http://127.0.0.1:8000`. Keep actual environment files local.

Backend, from the repository root in PowerShell:

```powershell
Set-Location backend
python -m venv .venv
if (!(Test-Path .env)) { Copy-Item .env.example .env }
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
# Fill in the copied .env before testing sign-in.
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --no-access-log
```

Frontend, in a separate terminal from the repository root:

```powershell
Set-Location frontend
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
# Fill in the copied .env.local before testing sign-in.
npm ci
npm run dev
```

Open `http://localhost:3000`. The public `/api/health` on Next.js checks FastAPI's `/api/v1/health`. FastAPI serves its OpenAPI UI at `http://127.0.0.1:8000/docs`. The health endpoints report API liveness. An authenticated profile save and read checks the Supabase connection.

## Verify M1

Run the backend suite from `backend/`:

```powershell
& .\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Run frontend checks from `frontend/`. The smoke test starts and stops a production Next.js server and a FastAPI process on temporary loopback ports:

```powershell
npm run lint
npm run typecheck
npm run build
$env:PYTHON_BIN = (Resolve-Path ..\backend\.venv\Scripts\python.exe).Path
npm test
```

For the hosted integration test, apply the migration and set `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_EMAIL` and `TEST_USER_B_PASSWORD` through a private environment file or your shell. Use two disposable, confirmed synthetic accounts. The test saves names to both profiles and attempts direct foreign-account reads and writes through Supabase's Data API:

```powershell
& .\.venv\Scripts\python.exe -m unittest discover -s tests -p test_hosted_supabase.py -v
```

For manual verification, open `/dashboard` signed out and confirm the app redirects to sign-in. Register a synthetic user, confirm their email and sign in, save a display name, reload, then sign out and revisit the dashboard. Sign in separately as the second account and verify the first name is absent. Try the page at a narrow viewport and use Tab to check the skip link, navigation, form labels and focus. With a session active, stop FastAPI and confirm the dashboard shows an outage and a retry action.

## Roadmap

M1–M3 establish the full-stack foundation, onboarding and generic chat. M4–M8 add reviewed memory, personalised retrieval, consented interaction tracking and model training. M9–M10 integrate shared personalisation and the Learning Lab. M11 is an optional adapter experiment. M12–M13 demonstrate module reuse and report the research results. See the [milestone roadmap](docs/ROADMAP.md) for dependencies and acceptance criteria.

M1 keeps the profile limited to a display name. The onboarding, consent and AI components follow their own milestones.

| Document | Contents |
| --- | --- |
| [Project instructions](AGENTS.md) | Project brief and milestone workflow |
| [Architecture](docs/ARCHITECTURE.md) | Application components, interfaces, data flow and module reuse |
| [AI architecture](docs/AI_ARCHITECTURE.md) | Three AI layers and algorithm selection |
| [Database design](docs/DATABASE_DESIGN.md) | Entities, relationships, permissions, indexing and deletion |
| [ML training plan](docs/ML_TRAINING_PLAN.md) | Synthetic dataset, time-based splits, training and activation gates |
| [Memory design](docs/MEMORY_DESIGN.md) | Memory lifecycle, review, retrieval and correction |
| [Requirements](docs/REQUIREMENTS.md) | User stories, requirements and acceptance criteria |
| [Evaluation plan](docs/EVALUATION_PLAN.md) | Comparisons A–E, metrics and research limits |
| [Roadmap](docs/ROADMAP.md) | M0–M13 objectives, dependencies, deliverables and verification |
| [Learning guide](docs/LEARNING_GUIDE.md) | Beginner-friendly explanations tied to the project |
