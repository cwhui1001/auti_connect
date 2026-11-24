# AutiConnect architecture

## Repository and deployment shape

The starting repository has a single placeholder README and an initial commit. The architecture below is proposed for the synthetic demonstration.

| Component | Responsibility |
| --- | --- |
| `frontend/` | Next.js, TypeScript, Tailwind CSS and shadcn/ui. Chat, memory review, settings, consent and the Learning Lab. Authenticate via Supabase Auth and send the user's access token to FastAPI. |
| `backend/` | Python and FastAPI. Verify identity and expose user-scoped application services. Separate memory management and retrieval, preference feature extraction and prediction, and LLM response generation into modules with small typed interfaces. |
| `supabase/` | Version-controlled PostgreSQL migrations, pgvector, access policies and database tests. The database is authoritative for user resources and the active model pointer. |
| `experiments/` | Seeded data generation and repeatable evaluation entry points. Use Pandas and NumPy for dataset preparation and scikit-learn for the first preference learner. Import the application's feature contract and training logic. |

Use one application backend and the same package for an explicit training/maintenance command. For the demo, run background work from a separate command using a small database-backed job ledger where durable tasks need retry. User requests do not train a model synchronously. Add infrastructure only if workload or recovery requirements justify it.

Expose a provider-neutral generation interface with structured extraction and chat operations. Expose a separate embedding interface and evaluate a local Sentence Transformers encoder first. Pin the encoder revision, vector dimension and distance metric when selecting it. Select providers and verify their data handling before introducing approved personal data. Use fake generation and embedding adapters for deterministic integration tests.

## Memory and response flows

| Type | Example | Storage and lifecycle |
| --- | --- | --- |
| Semantic | A fact the user wants remembered | Reviewable long-term memory with dated sources |
| Episodic | An event the user wants to refer to later | Reviewable long-term memory with occurrence time and optional expiry |
| Preference | A proposed preference inferred from something the user said | Proposed memory until reviewed. Confirmation that changes a supported setting writes the authoritative explicit preference and links the source memory. |
| Procedural | A user-authored sequence for preparing for an appointment | Reviewable ordered steps scoped to the relevant activity |
| Goal | A goal the user chooses and can complete or archive | User-controlled goal record with optional links to reviewed memory and source evidence |
| Working | Recent turns and active task context | Bounded to the authenticated conversation and session window. Keep it out of the durable semantic index. |

1. Verify the caller and conversation ownership. Accept current-turn instructions and bounded working context. Read the effective settings, goals and consent.
2. Look up relevant eligible memories and any eligible format prediction. Filter by authenticated owner, review status, validity, context and embedding revision before ranking. Apply a similarity threshold and context budget. Exclude stale, disputed candidate values and superseded material. An existing confirmed entry remains eligible during a pending contradiction unless the user excludes it.
3. Build a typed, request-scoped view containing permitted confirmed profile fields, explicit settings, reviewed memories, current goals, structured behavioural summaries and a prediction if eligible. Each item retains its source and scope. A current-turn instruction takes precedence, followed by a matching confirmed scope, a confirmed general setting, a compatible prediction and the application default. Avoid redundant evidence for preference memories linked to an authoritative setting.
4. Pass only selected context to the generation adapter. Treat chat and memory text as data in the prompt and keep system instructions separate. Attach context IDs to the turn internally and validate any claimed memory reference against the selected evidence. A response with no evidence uses the current turn and generic help.
5. When durable memory consent authorises it, schedule extraction from eligible user-authored sources. Validate typed candidates, source references and allowed fields. Consolidate equivalent candidates and attach new provenance. Queue material contradictions for review without applying them. Promote, correct or delete through a user action. Only confirmed revisions enter durable retrieval. If a source is independently removed, reevaluate the eligibility of derived context.

Store working context only for the approved session window and support a no-durable-memory mode. Explicit settings and selected goals are user-authored records with their own controls. Changing memory consent pauses extraction and durable conversational retrieval without changing separately saved settings. The UI can still show prior memories for review or deletion.

## Preference learning and serving

With training consent, behavioural intake records the context and options visible before a user choice, then accepts the independent user selection as a label. Validate provenance, schema, consent and idempotency before materialising features. Clicks without an explicit detail choice, assistant responses, and the model's own suggestions supply no label. Mark suggestion exposure so the primary experiment can use unprompted choices and separately measure possible feedback effects.

The initial shared starter model is fitted on synthetic data. Consented account observations update only that account's model. Training uses a versioned feature transformation learned on training data and kept fixed for compatible incremental updates. Each job snapshots the eligible data and parent, runs `SGDClassifier.partial_fit` on a candidate copy, evaluates it against the active version and baselines, and publishes an immutable artifact only through the activation gate. A model evaluation can reject an update even when the optimiser changed its parameters. [scikit-learn SGDClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html)

Prediction is a read-only operation with a version reference, evidence summary and an abstention path. Sparse histories, stale evidence or lack of a deployable version use the default or a user-chosen value in chat. Keep the synthetic starter available as a training parent and benchmark. It does not, by itself, establish sufficient evidence for a personal prediction. Offer a correction as either a one-turn choice or a durable preference, with the user's selection determining how it is stored.

The Learning Lab reads consented account data and vetted synthetic cohort metrics. It reports counts, comparisons, model history and evidence without exposing another account's rows. Show probabilities as model estimates and describe recent observed choices in concrete terms. A supporting observation is an example of evidence and does not establish a causal explanation.

## Boundaries and recovery

- Derive the actor from a verified Supabase access token. Preserve its authorization context for user-facing database calls. Run offline and background work under narrowly granted roles with explicit owner scope and consent checks. Keep privileged credentials on the server. [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Recheck consent and source eligibility before writing derived data. At serving time, reject outdated or invalidated preference versions and memory revisions. Keep initial retrieval uncached to simplify deletion and invalidation.
- Record job and request IDs, stage, duration, failure category and counts in operational logs. Keep raw prompts, memory text, tokens and training features out of logs.
- If retrieval, predictions or an embedding provider is unavailable, preserve chat using available current context. If generation is unavailable, surface a retryable error. Extraction failure leaves the source eligible for a bounded retry without adding partial memories.
- Stage versioned artifacts before activation. Recheck the data revision and expected parent in a database transaction. An artifact or candidate that fails validation cannot become active. Retries reuse IDs and abandoned staged objects can be cleaned up.
- Future modules call the same typed personalisation service with a defined purpose and scope. Features and permissions specific to each module stay within that module.
