# AutiConnect research evaluation plan

## Research questions

| Question | Comparison | Primary evidence |
| --- | --- | --- |
| RQ1. Does memory retrieval improve personalised grounding in simulated conversations? | Same base model with bounded current context, with and without reviewed personalised memory. | Supported personalisation, retrieval recall and absence of cross-account evidence. |
| RQ2. Can a statistical model predict the next detail preference using only available information? | Multiclass `SGDClassifier` with log loss versus training-set majority class and simple user-history baselines. | Held-out macro F1 and accuracy, with per-class support and prediction coverage. |
| RQ3. Does incremental training respond to changing preferences? | User-specific incremental model versus frozen starter and simple recency baseline on the same ordered streams. | Prequential macro F1, coverage and post-change recovery on held-out synthetic streams. |
| RQ4. Does an optional adapter improve response behaviour with personalised retrieval? | Base LLM, base LLM with personalised RAG, and adapted LLM with the same personalised RAG. | Paired changes in grounding, instruction adherence, privacy, response quality and cost. |

## Dataset and leakage controls

Generate synthetic structured events with a versioned generator, seed, configuration and checksum. Model heterogeneous response-detail choices, context effects, random noise, sparse histories, delayed feedback, and both stable and changing preferences. Keep scripted drift and synthetic latent preference state as test annotations. Exclude these annotations, persona IDs, label timestamps and post-choice data from model input. Record available choices, context, event order and whether a suggestion was shown. Include difficult cases and publish per-class and per-scenario counts.

The target is the independently selected detail level for the current turn. Make an evaluation prediction using information available before the choice. A feature row can contain an allowlisted context category and counts or recency of earlier eligible choices. Build history from records whose event and label availability precede the prediction, using a stable tie-breaker. No free-text chat, sensitive attributes or inferred diagnoses enter training features. Use a full choice set in the primary experiment. Report suggestion-exposed observations separately and exclude them from the primary supervised comparison. A choice influenced by a model suggestion is an intervention outcome.

- **Offline generalisation.** Assign synthetic users and their persona template families to disjoint train, validation and test groups before fitting or feature selection. Splits must contain independent scenario instances, avoid near-duplicate scripted sequences across groups and retain adequate class support. In held-out accounts, prior choices may be used as point-in-time features for predicting later choices. Their labels may not update the frozen estimator.
- **Continuous adaptation.** Use separate validation and held-out test streams with ordered events. For each step, predict first, record the outcome when its label becomes available, then queue eligible updates. Release-gate slices must precede the scored outcome and be excluded from fitting that candidate. A previously evaluated observation may enter a later training batch if the version tracks that transition. The final research test streams are never available for threshold tuning or retrospective candidate selection.
- **LLM scenarios.** Split by user, template family and near-duplicate conversation group. Hold out tasks that require reviewed memories and include unrelated, expired, contradictory, corrected, deleted and foreign-account candidates. Keep the gold evidence and ratings separate from the prompt and index. The index may contain that scenario's eligible synthetic memories during evaluation.
- **Reproducibility.** Keep split membership, generator and feature versions, seeds, code revision, package versions, model and artifact checksums, and evaluation protocol with every report. Fit transformations on training data. Tune and choose thresholds on validation data. Freeze the recipe before running the held-out protocol. [scikit-learn guidance on data leakage](https://scikit-learn.org/stable/common_pitfalls.html)

## Offline prediction and release gates

Compare global training-set majority and class-frequency predictions, per-user historical mode and most recent eligible choice, and a trained model. Apply the same prediction-time data boundary to every method. The history baselines fall back to the training-set baseline when the user has no history. Use the same synthetic-run seeds and held-out records for paired comparisons.

Report macro F1, accuracy, confusion matrix, per-class support and prediction coverage. Report log loss when comparing probabilities, with a fixed class set. Where the model abstains, report metrics at full forced coverage for the research comparison and report coverage plus selective accuracy for the proposed serving policy. Show results by history size and stable versus changed preference, with uncertainty estimated by resampling whole users when sample sizes support it. Report poorer-than-baseline findings and sparse slices directly.

For each future release-gate decision, evaluate the active version, candidate and relevant baseline on the same fresh, owner-scoped chronological slice that neither compared model fitted. Predeclare minimum evidence, coverage, tolerable regression and drift-trigger settings during M4 validation and keep the versioned thresholds fixed for the held-out evaluation. Insufficient evaluation support leaves the candidate inactive. The serving policy also abstains if too little eligible history exists, observed behaviour is stale, or the model estimate falls below the chosen threshold. A predefined default remains available when no candidate qualifies.

For drift, compare recent and earlier class frequencies and monitor forecast error once labels arrive. Treat a sustained change as a reason to evaluate an update, subject to minimum evidence. Include no-shift controls and delayed labels to count false alarms. Report pre-change and post-change scores, false alarms and recovery time in number of choices from the scripted change to a predeclared performance threshold. Report cases that never recover within the observation window. In a technical regression test, verify a real coefficient update on eligible input, idempotent retries, rollback and a clean rebuild after deletion.

## Memory and response evaluation

Track memory extraction precision and recall against annotated candidates. Record duplicate and contradiction handling, review outcomes, and the time to reflect a correction or deletion. For retrieval, report recall@k and precision@k over eligible evidence, cross-account and obsolete retrieval counts, and latency. Scenarios with no relevant memories test whether the system abstains from personalising.

Give both RQ1 conditions the same current task and bounded history. Fix the base model, generation settings, and scoring rubric. Score each answer for grounding in allowed evidence, adherence to the latest user choice, useful task completion and unsupported personal claims. Record rubric examples and grading procedure. Blind reviewers to condition where feasible, and use a second reviewer and report agreement if resources permit. Cross-account disclosure, reappearance of deleted evidence or any protected inference fails the scripted safety checks. Reviewers should also inspect keyboard access, feedback controls and explanations in the M5 demonstration.

## Optional LoRA or QLoRA protocol

After the core milestone, choose a base model with compatible licensing and available compute. Train a versioned PEFT adapter with PyTorch on synthetic or appropriately approved examples about response behaviour and grounding. Keep user-specific facts in the retrieval store. Record base revision, adapter configuration, quantization if used, data manifest, compute cost and checkpoint selection. Run the three RQ4 conditions using the same held-out tasks and decoding settings. The two RAG conditions receive identical ranked evidence. Report paired quality scores, privacy failures, latency and resource use alongside limitations. Treat the adapter as an optional experiment independent of the memory mechanism. [Hugging Face PEFT quantization guide](https://huggingface.co/docs/peft/developer_guides/quantization)

## Reporting and interpretation

Each run report lists the protocol, sample and split sizes, architecture and artifact versions, per-condition metrics, baseline differences, interval method, and failure examples. Distinguish synthetic cohort metrics from account-level prediction history. The generator creates a controlled test of the engineering claims. Its behaviour and labels cannot establish clinical effectiveness, accessibility for every person, or real-world user satisfaction. Future research with people needs a separate consent, data-handling and evaluation protocol with applicable institutional approvals in place.

## M0 results

This milestone defines the protocol. Dataset generation, model fitting and measurement begin in later milestones. Sample sizes, thresholds and providers will be decided during the relevant implementation and validation milestones.
