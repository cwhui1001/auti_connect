# AutiConnect AI architecture

The system has three AI layers with separate interfaces, inputs and evaluation. Memory provides reviewable evidence. The preference model estimates a likely instruction format. Generation uses selected context to answer the user. The personalisation service resolves which fields and format can be used for an interaction.

## Layer 1 · Intelligent user memory

The memory service classifies semantic facts, dated episodes, procedural instructions, preference candidates, goals and session-scoped working context. A provider-neutral LLM operation proposes typed candidates from consented user-authored turns. Schema validation checks source references, owner, provenance, scope and allowed content. Consolidation links equivalent records to existing evidence. A conflict preserves both source histories and asks the user to review before changing the current value.

Only eligible confirmed revisions enter durable retrieval. A frozen encoder transforms content and queries into vectors. PostgreSQL filters by owner, purpose, validity, review state and encoder revision before pgvector ranks the eligible subset. Apply a result limit, similarity cutoff and prompt budget. A user correction triggers re-embedding, and deletion removes eligibility immediately and purges derived data. Working context stays out of the durable index. See the [complete memory lifecycle](MEMORY_DESIGN.md).

## Layer 2 · Trainable user preference model

Predict one outcome per task, the user's independent choice of instruction format among numbered steps, a checklist and a paragraph. Collect a structured pre-choice context and the explicit selection with training consent. Transform eligible prior choices into versioned features, and prepare deterministic synthetic splits before fitting.

Train a shared synthetic starter and copy its fitted state to initiate an eligible account-specific candidate. Apply validated new observations via `partial_fit`. Track support, recency and performance. Abstain when evidence is sparse, stale or gated out. Monitor recent outcome mix and error for drift. Evaluate candidate and incumbent on a later untouched slice before activation. Keep immutable artifacts and version history so a prior eligible version can be restored. Invalidate affected models on training-data deletion, recompute affected history features, and rebuild from a clean starter. See the [training protocol](ML_TRAINING_PLAN.md).

### Algorithm comparison

| Candidate | Fit for instruction format | Prototype decision |
| --- | --- | --- |
| Naive Bayes | Lightweight classifier with incremental variants. Multinomial Naive Bayes fits non-negative count inputs, but the conditional independence assumption is strained by related signals such as last format and rolling choice counts. | Use as an optional trained comparator with compatible features. [scikit-learn Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html) |
| `SGDClassifier` with log loss | A regularised linear classifier for categorical outputs, with class scores and real online parameter updates through `partial_fit`. Supports the same feature representation for initial and incremental learning. | **Recommended initially.** One estimator covers both experiments with a small feature set and existing scikit-learn tooling. [scikit-learn SGDClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html) |
| Online regression | An incremental regressor can predict a numeric target such as time or quantity. Numbering the three formats would create a numeric distance without a supported interpretation. | Defer to a later continuous target. [scikit-learn SGDRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDRegressor.html) |
| River-based online learning | River provides stream-native models such as softmax regression, along with online preprocessing, metrics and drift tools. | Revisit if per-event streaming or a stream-native evaluation pipeline adds value. [River softmax regression](https://riverml.xyz/latest/api/linear-model/SoftmaxRegression/) |
| Contextual bandits | Choose an action and learn from feedback on the selected action. Evaluation depends on the action-selection policy and logged propensities. | Defer. The prototype already has an explicit class label and can evaluate without introducing exploration into user-facing choices. [Vowpal Wabbit contextual bandit guide](https://vowpalwabbit.org/docs/vowpal_wabbit/python/latest/tutorials/python_Contextual_bandits_and_Vowpal_Wabbit.html) |

The linear model may miss interactions or fail to beat recent-choice baselines. A comparison on held-out data will determine whether personal predictions are worth using. A class score is a model estimate. Confirmed settings and direct instructions remain authoritative.

## Layer 3 · Personalised generative AI

- Define a shared generation interface that accepts a task, bounded working context, typed evidence, an effective format and a versioned response schema. Put provider-specific authentication, model selection, timeouts and output parsing in adapters.
- Build the prompt with instructions, the current task, the resolved format and the minimum permitted evidence. Label evidence with typed sources and identifiers. Treat conversation and memory text as data. Exclude raw learning observations and scores that the response does not need.
- Return a structured answer with text, a format and any evidence references. Validate the format, schema and membership of each reference in the selected evidence set. Invalid output gets a bounded retry or generic fallback. Evaluate factual grounding separately from reference validity.
- Keep personal knowledge and deletion controls in application storage. An optional M11 LoRA or QLoRA adapter can learn general generation behaviour such as following a format or using provided evidence. Fit it only on synthetic or approved examples, and measure the difference with the same retrieved context. [Hugging Face PEFT quantization guide](https://huggingface.co/docs/peft/developer_guides/quantization)

## Where training happens

| Operation | What changes |
| --- | --- |
| LLM-based extraction, embedding generation and LLM response generation | A pretrained model performs inference. The operation produces candidates, vectors or text. Its weights remain fixed. |
| Review, conflict handling and pgvector search | Application logic changes stored evidence or reads and ranks existing records. |
| Preference training and incremental adaptation | The classifier learns coefficients from labelled examples. Offline and incremental fitting create separate versioned artifacts. |
| Preference prediction | The active artifact reads point-in-time features and emits a score or abstention using fixed parameters for that request. |
| Optional PEFT experiment | Trainable adapter weights change. The base model stays frozen and user-specific facts stay in the retrieval store. |

The backend shares authenticated context between layers through [typed interfaces and precedence rules](ARCHITECTURE.md). Reviewed sources, model estimates and explicit preferences remain traceable wherever a module uses them.
