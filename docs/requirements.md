# AutiConnect requirements

## Initial demonstration

A synthetic user can chat, review what AutiConnect proposes to remember, set or correct preferences, and choose whether structured behavioural events can be used for training. The system can use relevant reviewed information and, when there is sufficient evidence, suggest a response detail level. The Learning Lab shows where personalisation came from and how it changed over time.

The first prediction target is the detail level the user actively chooses for an individual turn. The options are concise, standard and detailed. A turn-level choice supplies a label when training consent covers the event. A separate explicit setting records a durable preference when the user asks to save it. The closed set and single target are prototype design choices.

## Functional requirements

| ID | Capability | Acceptance evidence | Milestone |
| --- | --- | --- | --- |
| FR-01 | Authenticate and scope conversations, settings, consent and subsequent user resources to their owner. | Two synthetic accounts exercise API and database isolation, including guessed resource IDs and foreign-owner writes. | M1 and each feature milestone |
| FR-02 | Manage profile information, context-specific support settings and goals through user input. Keep consent for durable memory and behavioural training independently configurable. | A user can inspect and change settings. Disabled consent prevents new collection for that purpose, including under retry or delayed processing. | M1–M2 |
| FR-03 | Maintain semantic facts, episodes, preferences, procedures, goals and session-scoped working context. Extract durable candidates through a structured LLM output. | Fixtures cover every memory type. Durable candidates have source references and timestamps, enter review and can be confirmed, corrected or deleted. Working context expires with its bounded session policy. | M2 |
| FR-04 | Consolidate duplicates and handle conflicting claims within the same memory scope. | Replayed extraction produces a single proposal. Contradictions retain their source and trigger review. The existing confirmed record remains effective until the user resolves the conflict. | M2 |
| FR-05 | Retrieve relevant, current owner-scoped material with pgvector and construct grounded responses. | Evaluation checks ranking, expiration, corrections, deletion, context-specific preferences and cross-account isolation. The response can use only evidence selected for the current turn. | M2, then M4 for predictions |
| FR-06 | Materialise a unified user context for chat and future modules. | A request-scoped view keeps confirmed profile, settings, reviewed memories, selected goals, behavioural summaries and eligible predictions distinguishable by source, scope and freshness. | M2–M4 |
| FR-07 | Generate repeatable synthetic datasets, validate point-in-time features and labels, and train a real preference model. | Multiple seeded runs produce comparable datasets and the recorded split is reproducible. The experiment reports model and statistical baselines on held-out data. | M3 |
| FR-08 | Incrementally train user-specific candidates, detect preference changes and handle sparse histories. | A valid new batch updates fitted parameters. Replays leave the event ledger and active artifact unchanged. Experiments compare adaptation and sparse-user behaviour against baselines. | M4 |
| FR-09 | Version, evaluate, activate, roll back and rebuild preference models. | Activation requires evaluation evidence. Concurrent jobs cannot publish against stale state. Deleting a training observation makes affected versions ineligible and permits a rebuild from surviving observations. | M4 |
| FR-10 | Give users an explanation, correction and deletion path through the AI Learning Lab. | The user can see observation counts, training history, versions, held-out accuracy, baseline comparisons, memories, prediction evidence, adaptation and corrections. The UI clearly identifies synthetic cohort results and distinguishes them from the signed-in account's history. | M5 |
| FR-11 | Design and optionally run LoRA or QLoRA experiments after the core demonstration. | A reproducible protocol compares base LLM, base with personalised RAG, and adapted LLM with the same RAG on held-out synthetic or appropriately approved data. | M6 optional |

## Cross-cutting requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| NFR-01 | Apply confirmed preferences before predictions. Explicit instructions for the current turn govern that turn. | Unit and response-level cases cover turn instructions, scoped and general settings, predictions and abstention. |
| NFR-02 | Minimise data. Use allowlisted structured training fields, owner-scoped evidence, and separate consent for each use. | Feature validation rejects unapproved fields. Storage, dashboard and logs avoid unnecessary conversation content and protected inferences. |
| NFR-03 | Enforce user control and respect deletion in retrieval, features and serving. | Tests cover corrections, deletion, consent withdrawal, stale in-flight work, invalid artifacts and handling when no eligible personalised model remains. |
| NFR-04 | Keep the application accessible and predictable. Target WCAG 2.2 AA and provide keyboard navigation, visible focus, labelled controls, text alternatives for charts, plain-language evidence and clear save/delete status. | Review keyboard and screen-reader flows and check contrast, focus, status announcements and reduced-motion behaviour on core screens. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| NFR-05 | Keep experiments reproducible and claims proportional to the evidence. | Reports identify the data source, seeds, splits, code and artifact versions, denominators, uncertainty and limitations. Synthetic results describe simulated behaviour only. |
| NFR-06 | Prevent inference of autism severity, intelligence, diagnoses, emotional states or capability from interactions. | Extraction and feature validation exclude those attributes. Tests include attempts to elicit or introduce those inferences through source text or model output. |
| NFR-07 | Keep memory retrieval, model training and response generation independently testable. | Interfaces support fake providers. Chat remains usable with generic responses when personalised context or a prediction is unavailable. |

## Deferred applications

Communication assistance, adaptive learning activities, daily planning, education and employment recommendations, and caregiver support can reuse the personalisation engine. Each module will need its own interaction design and evaluation. Caregiver access needs an explicit user-granted sharing model before another person can see any account data.
