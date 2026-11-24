# AutiConnect

AutiConnect is a Final Year Project investigating whether an AI system can progressively learn an individual's interaction preferences and provide more relevant support. The first demonstration uses synthetic accounts and simulated interactions. **M0 covers architecture and AI research planning.**

## Problem and objectives

An individual may prefer a checklist for one task and numbered steps for another. They may also change their preference over time. A static profile captures explicit settings but cannot measure or adapt to those patterns. Repeating instructions and context across interactions also adds work for the user.

- Give users control over what the system remembers and when it uses that information.
- Demonstrate measurable learning from task context, choices and feedback through a fitted model with real parameter updates.
- Show how adaptation compares with static settings, simple statistical baselines and generic LLM responses.
- Reuse confirmed knowledge across allowed support modules with consistent privacy and precedence rules.

## Proof of concept

The proposed system combines three independent AI capabilities. **Memory** extracts reviewable information from conversations and finds relevant confirmed memories with embeddings and pgvector. **Preference learning** predicts instruction format from structured prior choices and adapts a fitted model for each eligible account. **Generation** uses reviewed context and eligible predictions to produce grounded responses through a provider-neutral LLM interface.

The first prediction target is a user's next instruction-format choice among numbered steps, a checklist and a paragraph. Confirmed settings take precedence over predictions. The AI Learning Lab will show what was learned, where the evidence came from, and how performance changed. The synthetic proof of concept measures technical behaviour. Future human-participant evaluation has a separate design.

## Technology and proposed structure

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
├── frontend/              # Planned Next.js application
├── backend/
│   ├── app/               # Planned API, memory, learning, generation and personalisation modules
│   └── tests/             # Planned backend tests
├── supabase/              # Planned local config, migrations, synthetic fixtures and policy tests
├── experiments/           # Planned dataset generators, training and comparative evaluation
├── AGENTS.md
└── README.md
```

## Roadmap and setup

M1–M3 establish the full-stack foundation, onboarding and generic chat. M4–M8 add reviewed memory, personalised retrieval, consented interaction tracking and model training. M9–M10 integrate shared personalisation and the Learning Lab. M11 is an optional adapter experiment. M12–M13 demonstrate module reuse and report the research results. See the [milestone roadmap](docs/ROADMAP.md) for dependencies and acceptance criteria.

M0 is ready to review in a Markdown viewer with Mermaid support. Clone or open the repository and start with the documents below. M1 will add pinned prerequisites, example environment settings, local Supabase startup, synthetic account fixtures, and frontend/backend run and test commands.

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
