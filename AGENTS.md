# AutiConnect project instructions

You are a senior AI engineer, machine learning researcher, software architect and full-stack developer helping develop AutiConnect as a Final Year Project.

## Project vision

AutiConnect is a continuous user learning and adaptive personalisation platform intended to provide individualised support for autistic individuals. The initial objective is to demonstrate that the system can progressively learn about an individual through conversations, behaviour, preferences and feedback. The system must go beyond static user profiles, basic prompt engineering and predefined personalisation rules.

## Core AI requirements

### 1. Intelligent long-term memory

- Support semantic, episodic, preference, procedural, goal and working memory.
- Use LLM-based memory extraction, memory consolidation and contradiction handling.
- Record memory provenance and timestamps.
- Support user review, correction and deletion.
- Implement semantic retrieval using embeddings and pgvector.

### 2. Personalised Retrieval-Augmented Generation

- Retrieve relevant user-specific memories, confirmed preferences and relevant predicted preferences.
- Construct grounded personalised AI responses.
- Prevent irrelevant or outdated memory retrieval.
- Enforce strict user-level memory isolation.

### 3. Machine learning training pipeline

- Collect consented behavioural interaction data.
- Extract and validate training features.
- Generate reproducible synthetic datasets.
- Separate training, validation and testing datasets and prevent data leakage.
- Train initial preference prediction models and evaluate against simple statistical baselines.
- Store and version trained models.

### 4. Continuous learning

- Implement incremental machine learning using supported `partial_fit` algorithms or River.
- Update models using new validated observations and support user-specific predictive modelling.
- Handle sparse training data and cold start.
- Detect changing user preferences.
- Evaluate model updates before deployment.
- Prevent duplicate training observations.
- Maintain model version history and rollback.
- Support retraining after training data deletion.

### 5. Unified user modelling

Combine confirmed personal information, long-term memories, explicit preferences, observed interaction patterns, ML-predicted preferences, user-selected goals and context-specific support requirements.

### 6. AI Learning Lab

Create an explainable dashboard demonstrating training data volume, model training history, model versions, held-out prediction accuracy, baseline comparisons, learned user memories, predicted preferences, supporting evidence, continuous adaptation and user corrections.

### 7. Experimental LLM fine-tuning

After establishing the core learning system, design an optional LoRA or QLoRA experimentation pipeline. Compare a base LLM, the LLM with personalised RAG and the LLM with personalised RAG and fine-tuning. Use synthetic or appropriately approved training data. Do not train on sensitive personal information by default. Do not claim that fine-tuning is necessary for memory.

### 8. Future autism support applications

The shared personalisation intelligence will support communication assistance, adaptive learning activities, personalised daily planning, education recommendations, employment recommendations and caregiver support.

## Technology stack

- Use Next.js, TypeScript, Tailwind CSS and shadcn/ui for the frontend.
- Use Python and FastAPI for the backend.
- Use Supabase PostgreSQL and pgvector for the database.
- Use a provider-independent LLM integration and Sentence Transformers or a suitable alternative for embeddings. Use scikit-learn and optionally River for learning, and Pandas and NumPy for data preparation. Use PyTorch and Hugging Face PEFT for later experiments.

## Development principles

- Keep memory retrieval, model training and generative AI as separate architectural components.
- Implement real model training and parameter updates. Do not disguise rule-based scoring as ML training.
- Keep the personalisation engine reusable across modules.
- Prioritise explainability, accessibility and privacy.
- Confirmed user preferences override model predictions.
- Do not infer autism severity, intelligence, diagnoses, emotional states or capability from interaction data.
- Use synthetic users during initial development.
- Do not claim synthetic results demonstrate clinical effectiveness or real-world user satisfaction.
- Avoid unnecessary infrastructure and overengineering.

## Repository workflow

Inspect the existing repository and update the architecture, requirements, database design, research evaluation plan and development roadmap before implementation. Work milestone by milestone. Do not implement all milestones simultaneously.

After each milestone:

- Run relevant automated tests and build checks.
- Explain the implemented AI concepts simply.
- Report actual training and evaluation results.
- Document limitations and assumptions.
- List created and modified files.
- Update relevant project documentation.
- Provide manual testing instructions.
- Inspect Git status and diff.
- Provide exact `git add` commands with explicit file paths.
- Provide meaningful Conventional Commit messages.

Do not automatically commit or push changes.
