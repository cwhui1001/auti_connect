# AutiConnect development roadmap

Deliver one milestone at a time. Each completed milestone should identify changed files, describe the implemented AI concepts in plain language, include actual results or state why they are unavailable, record assumptions and limitations, provide manual checks and exact staging commands, and propose Conventional Commit messages. Run the relevant automated checks and builds, inspect Git status and diff, and leave commit and push under user control.

| Milestone | Deliverables | Exit evidence |
| --- | --- | --- |
| **M0 · Repository discovery and design** | Inspect the starting repository, record the project instructions, and document architecture, requirements, database design, evaluation and roadmap. | Documents agree on scope and milestone order. Local references and Git diff pass review. |
| **M1 · Synthetic application foundation** | Scaffold Next.js and FastAPI, establish local Supabase migrations and test fixtures, configure verified identity, owner-scoped profiles and separate consent controls, and provide development commands. | Frontend lint, type and build checks pass. Backend health and identity tests and database policy tests pass. Two synthetic accounts can manage their own consent and cannot read or mutate each other's records. |
| **M2 · Reviewable memory and personalised RAG** | Add a bounded chat context, memory extraction and review, preferences, goals, idempotent consolidation, embeddings and tenant-scoped retrieval. | Automated and manual exercises cover all memory types, duplicate and conflicting statements, cross-account and obsolete results, corrections, deletion and grounded fallback. Report initial RQ1 results. |
| **M3 · Offline preference prediction** | Build the seedable generator, validated feature pipeline, separated data splits, statistical baselines, real offline training and artifact storage for the initial response-detail target. | Reproduce a data and training run, verify split and time-boundary assertions, and report held-out RQ2 metrics and baselines even if the trained model falls short. |
| **M4 · Continuous learning and serving** | Add consented intake, deduplication, per-user `partial_fit`, pre-promotion evaluation, deployment pointers, drift monitoring, abstention, rollback and rebuild after deletion. Connect eligible predictions to the user context. | Demonstrate parameter updates, blocked duplicate and stale publications, sparse-data fallback, confirmed preference precedence, rollback and deletion. Report RQ3 results from held-out synthetic streams. |
| **M5 · AI Learning Lab and integrated demonstration** | Surface training volume, version history, evidence, metrics, baselines, memories, adaptation and corrections. Prepare the end-to-end synthetic demonstration and written results. | End-to-end suite and app build pass. Verify dashboard scope, correction and deletion, keyboard and screen-reader paths, and correct attribution of cohort and owner metrics. Report actual integrated results. |
| **M6 · Optional fine-tuning experiment** | Implement the documented LoRA or QLoRA comparison if compute and data approvals permit. | Record experiment inputs or feasibility constraints. If run, report paired RQ4 results and adapter cost. |

## Manual verification by milestone

| Milestone | Exercise |
| --- | --- |
| M0 | Open the README, follow each local link, and confirm that every core AI requirement maps to a milestone. Check that the status and evaluation results describe the planning stage. |
| M1 | Use two synthetic accounts. Toggle each consent separately, reload and inspect persistence. Open a known resource from the other account and confirm that access fails without revealing its content. |
| M2 | Add facts, events, procedures and goals to a synthetic account, review a proposed preference, introduce a contradiction, then correct and delete it. Repeat a relevant question and inspect which evidence the response uses. Verify unrelated and foreign-account content stays out. |
| M3 | Run the documented experiment twice with the same seed. Compare the dataset checksums, split membership, fitted model metrics and baselines. Change the seed and verify the manifest records it. |
| M4 | Replay an observation ID, simulate a changing detail preference and inspect candidate history and serving behaviour. Set an explicit override. Roll back, delete an observation and verify the affected artifact stops serving before a clean rebuild finishes. |
| M5 | Start with no history, add synthetic feedback and follow the explanation through evidence and model history. Complete the same flow from the keyboard and with a screen reader, including correction and deletion. |
| M6 | Run the three configurations on the same held-out task and trace an example back to the recorded model and evidence. |

M0 leaves the exact model providers, data retention periods, evaluation thresholds and package versions open for selection in their relevant milestones. M1 begins with a synthetic application foundation and access-control tests.
