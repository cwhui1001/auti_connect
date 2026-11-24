# AutiConnect memory design

## Memory types and sources

| Type | Example | Authority and lifecycle |
| --- | --- | --- |
| Semantic | The user wants the system to remember that their study group meets online. | User-entered or explicitly confirmed fact with source and validity dates. |
| Episodic | The user wants to remember finishing a particular practice task. | Dated occurrence. Keep distinct events separate and set an expiry if the information is temporary. |
| Procedural | The user has a personal sequence for preparing a study session. | Ordered steps with a declared task or activity scope and version history. |
| Preference | The user prefers checklists for packing. | A conversation proposes a candidate. An explicit confirmation can save a typed scoped setting in `user_preferences`. |
| Goal | The user has chosen to plan tomorrow's travel. | User-owned goal with a status and optional memory evidence. The `goals` record is authoritative for progress. |
| Working | The recent conversation turns and the task in progress. | Bounded within the verified conversation and session. Excluded from the durable vector index. |

An LLM-extracted candidate remains inferred and pending until the user confirms it. An ML prediction is a separate, expiring estimate and cannot become a memory or durable setting without a user action. An explicitly saved setting and a reviewed conversation memory have separate deletion controls and visible links when they share evidence.

## Lifecycle

1. **User interaction.** Authenticate the user and scope the turn to an owned conversation. Keep recent context within its retention window. When the user has enabled durable memory, queue an extraction job referencing eligible user-authored content. A setting or goal explicitly entered through a control can be saved directly under its own policy.
2. **Extraction and classification.** Ask the LLM adapter for structured candidates containing a type, normalised claim, scope, source reference, occurrence time if known and validity hints. Cite user-authored evidence. Treat time or confidence supplied by the model as unverified metadata.
3. **Validation and review.** Check the schema, allowed fields, source eligibility, consent, owner and scope. Deduplicate exact replays by source revision and extractor revision. Consolidate equivalent claims or flag contradictions for review. Store the eligible proposal and evidence in a pending state so the user can confirm, edit or dismiss it.
4. **Embedding and storage.** On confirmation, record a new current revision, invalidate any superseded revision and queue indexing. Encode the confirmed content with the pinned encoder. Write the indexed vector with owner, revision and encoder revision after rechecking consent and eligibility. Until indexing succeeds, skip the revision for vector retrieval. Explicit settings and goals resolve via structured access.
5. **Retrieval.** Scope by user, module purpose, relevance scope, review state, timeframe and encoder revision before exact cosine ranking. Apply a similarity cutoff and bounded top-k. Prefer current evidence and remove redundant claims, especially if a saved setting already supplies the authoritative value. Return source IDs alongside text and validity.
6. **Personalised response.** The orchestration service uses only selected evidence and the effective preference. Treat retrieved text as data. Attach only supported evidence references and report the reason for personalising when it helps the user verify the result.
7. **Feedback and update.** Allow review, correction, deletion and scoped preference changes. Record an independently chosen instruction format for learning only when authorised. Generic approval or rejection can be useful feedback without supplying a format label. Recheck in-flight extraction, embeddings and response evidence against current revisions and consent. Exclude prior generated turns whose selected evidence became ineligible from subsequent working context.

## Conflict and safety rules

| Case | Rule |
| --- | --- |
| Duplicate evidence | Use a deterministic key for retries. Use a scoped exact match to attach another source to a compatible revision. Semantic similarity can propose consolidation for review, with distinct dated episodes preserved. |
| Contradictory claims | Keep the current confirmed revision eligible while another value is pending. Show the competing claims, timestamps and provenance. On resolution, atomically change the pointer and remove the obsolete revision from retrieval. |
| Changing or scoped preferences | Record the scope and validity of the new explicit choice. A scoped value takes priority within that scope. A reviewed general value remains available elsewhere. A drift alert can prompt a review without silently changing an explicit setting. |
| Outdated memory | Filter expired and superseded material at query time even if physical cleanup is pending. The review screen can show why a retained item is inactive. |
| Sensitive information | Allowlist memory fields and limit prompt context. Reject proposed diagnosis, autism severity, intelligence, capability and emotional-state inferences. Keep sensitive content outside the initial synthetic memory and training inputs. |
| Cross-user retrieval | Check owner at the API, scope every application query, enforce RLS and same-owner references in PostgreSQL, and test that embeddings, sources and review actions respect that boundary. |
| Correction and deletion | A correction creates a revision and requires a fresh embedding. Deletion makes the memory and derivatives ineligible immediately, purges content and vectors and suppresses replay from an already processed source. Handle a deleted source by rechecking any dependent revisions and their remaining evidence. A directly confirmed value may remain eligible if the user chose to keep it independently. |

## Checks and failure handling

Test extractors with exact and near duplicates, conflicting claims, ambiguity, stale episodes and attempts to infer protected attributes. Test queries with irrelevant, contradictory, expired, superseded and foreign-account evidence. Rehearse a correction while an embedding job is queued, deletion during a background run and a user turning off retrieval consent. A bounded job retry can recover an indexing failure. Chat can answer from permitted current context while that work is pending.

The [database design](DATABASE_DESIGN.md) defines the rows and access constraints. The [evaluation plan](EVALUATION_PLAN.md) defines extraction, retrieval and grounding measurements.
