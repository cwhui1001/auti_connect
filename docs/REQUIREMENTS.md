# AutiConnect requirements

The initial proof of concept uses synthetic accounts to show progressive learning of instruction-format preferences from conversations, interactions and feedback. Development starts with a single categorical target and expands through the [milestone roadmap](ROADMAP.md).

## User stories

| ID | User story | Acceptance evidence |
| --- | --- | --- |
| US-01 | As a user, I can save a preferred instruction format and decide separately whether conversations can become memories and interactions can be used for learning. | Saved settings persist on reload. The two consent controls act independently. Turning one off prevents new processing for that purpose. |
| US-02 | As a user, I can ask a question, review what AutiConnect proposes to remember, and correct or delete outdated information. | Show the memory source and status. A corrected revision replaces the previous one in retrieval and a deleted revision is excluded immediately. |
| US-03 | As a user, I can understand and override an inferred preference. | The Learning Lab shows a clearly labelled estimate, evidence, version and time. A saved explicit preference overrides it. I can dismiss an adaptation suggestion without saving it. |
| US-04 | As a user, I can switch from chat to planning and retain relevant choices. | The modules apply the same confirmed general preference and respect module-specific scopes and authorisation. |
| US-05 | As a user, I can complete core flows with a keyboard or screen reader. | Review sign-in, preferences, consent, memory review and the Learning Lab for labelled controls, focus, status announcements and accessible chart alternatives. |
| US-06 | As a supervisor, I can inspect evidence of real model learning. | The demonstration shows baseline comparisons, held-out metrics, a parameter-changing update, historical versions and limitations of the synthetic study. |

## Functional and AI requirements

| ID | Requirement | Acceptance evidence | Milestone |
| --- | --- | --- | --- |
| FR-01 | Authenticate accounts and scope each API and database resource to its owner. | Synthetic users A and B can access their own data. Attempts to read, mutate or reference the other's data fail. | M1 onward |
| FR-02 | Let users maintain a profile, scoped explicit settings, goals and independent permissions for memory and learning. | Onboarding values persist, withdrawal is effective, and duplicate consent actions are idempotent. | M2 |
| FR-03 | Accept conversational requests through a provider-neutral interface and maintain bounded working context. | A fake provider supports deterministic tests. The chat handles expired sessions and provider failures with visible status. | M3 |
| AI-01 | Represent semantic, episodic, procedural, preference, goal and working memory, with provenance and correction/deletion. | Fixtures cover all types. Review shows sources, timestamps and validity. Working context expires separately. | M3–M4 |
| AI-02 | Extract validated memory candidates and consolidate or flag conflicts. | Retries do not duplicate memory. Contradictions enter review and confirmed values take effect only through user actions. | M5 |
| AI-03 | Retrieve relevant current evidence with pgvector and generate grounded structured responses. | Owner, status, consent, expiry and scope filters pass. Unsupported references are rejected. Cases with no eligible evidence fall back to current context. | M5 |
| AI-04 | Resolve a unified user context for chat and future modules with consistent precedence and provenance. | One interface combines authorised fields. Current instruction, scoped explicit and general explicit preferences all override eligible model estimates. | M9 |
| FR-04 | Expose memories, feedback, predictions, adaptation suggestions and versioned training evidence through the Learning Lab. | Users can distinguish confirmed, observed and predicted information. The view shows data volumes, history, held-out scores, baseline comparisons, correction and abstention. | M10 |
| FR-05 | Demonstrate reuse with one daily-planning slice. | A reviewed preference carries from chat to planning, and a withdrawal or correction takes effect in both. | M12 |
| AI-05 | Evaluate an optional adapter with the same retrieved context. | If run, compare base, base with RAG, and RAG plus adapter using an approved dataset and paired held-out tasks. | M11 optional |

## Machine learning requirements

| ID | Requirement | Acceptance evidence | Milestone |
| --- | --- | --- | --- |
| ML-01 | Record consented structured choices and feedback with event identity, context, provenance and label availability. | Intake rejects duplicates, invalid fields, blocked purposes and unknown labels. The same seed regenerates the same synthetic artifact. | M6 |
| ML-02 | Build point-in-time features and train a real classifier against statistical baselines. | Automated assertions enforce chronological and group cutoffs. A saved model has fitted parameters and a held-out evaluation report. | M7 |
| ML-03 | Update per-account models incrementally and handle drift, sparsity and invalidation. | New observations change candidate parameters. Sparse or stale histories abstain. Both stable and changing preference streams are measured. | M8 |
| ML-04 | Gate model deployment, version artifacts, support rollback and rebuild after deletion. | Bad, stale or duplicate updates cannot publish. A prior eligible version can be restored. Training deletion makes affected versions ineligible before clean rebuild. | M8 |

## Non-functional, accessibility, security and privacy requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| NFR-01 | Keep retrieval, training and generation independently testable and offload training from user requests. | Fake provider contracts, deterministic data/feature checks and training-job tests exercise the boundaries. Generic chat can answer without optional retrieval. |
| NFR-02 | Design toward WCAG 2.2 AA. Use readable labels, predictable navigation, keyboard access, visible focus, accessible feedback, text alternatives and reduced-motion behaviour. | Run automated accessibility checks plus manual keyboard and screen-reader review in the core flows. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| NFR-03 | Minimise data and scope permissions with verified actors, grants, RLS and owner-linked records. Keep secrets and raw content out of logs. | Two-owner policy tests include references, vector retrieval, background operations and delete/restore scenarios. Payload validation excludes prohibited fields. |
| NFR-04 | Respect consent withdrawal, deletion and retention throughout model serving, retrieval and derived data. | Verify in-flight jobs cannot reintroduce invalid data, and backups and retained sources have a documented deletion process. |
| NFR-05 | Prevent diagnosis, severity, intelligence, emotional state or capability inference from interactions. | Include negative cases for extraction, feature input, generation and review. |
| NFR-06 | Make the technical research reproducible and report uncertainty, cost and limitations. | Manifests identify data, seeds, splits, code and artifact versions. Reports label all synthetic results and contain baseline and failure detail. |

The [database design](DATABASE_DESIGN.md), [memory design](MEMORY_DESIGN.md) and [training plan](ML_TRAINING_PLAN.md) define the implementation contracts. The [evaluation plan](EVALUATION_PLAN.md) defines research acceptance evidence separately from software checks.
