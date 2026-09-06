# Topic coverage and prerequisite map

This map distinguishes **core practice**, **guided comparison**, and **optional depth**. Coverage means a topic is introduced in the course at the stated depth; it does not imply mastery.

| Area | Where | Depth and evidence |
|---|---|---|
| Python, environments, JSON, types, tests, APIs | 1, 9, 17 | Core refresher applied to reproducible labs and validated tools |
| Arrays, dot products, probability, gradients | 2, 4, 7 | Core numerical exercises; advanced calculus optional |
| Regression/classification, splits, metrics | 3 | Core trained baseline and evaluated classifier |
| Clustering, anomaly detection, recommendation | 3, 5 | Guided comparison; deeper implementation optional |
| Neural nets, weights, activations, backprop | 4 | Core small CPU training loop and save/load |
| CNN, RNN/LSTM, autoencoder/VAE/GAN | 5 | Architectural orientation; separate large projects optional |
| Diffusion and generative vision/audio | 5, 26 | Denoising concept core; full model training optional |
| RL, reward, policy, DPO/RLHF/RLAIF | 5, 8, 27 | Guided conceptual comparison; advanced training optional |
| Tokens, BPE, vocabulary, logits, sampling | 6 | Core tokenizer and toy language-model experiment |
| Context windows and token budgeting | 6, 10, 20, 25 | Core measured/illustrative budgets with honest labels |
| Attention, Q/K/V, masking and transformer blocks | 7 | Core tiny attention implementation; full transformer training optional |
| Positional encodings/RoPE, residuals, normalization | 7 | Explanatory overview linked to the block diagram |
| Pretraining, adaptation, licenses, model cards | 8, 27 | Core model inspection and adaptation decision |
| Hugging Face Hub/Transformers/Datasets/Tokenizers/PEFT | 6, 8, 27 | Core selected tools; Spaces and Accelerate orientation |
| OpenAI, Claude and Gemini APIs | 9, 17, 22 | One live provider core, contracts compared; extra provider ports optional |
| Prompting, few-shot examples and context engineering | 10 | Core prompt comparison and evidence checking |
| Hallucinations, abstention and deterministic rules | 10, 13, 23, 24 | Core tests; no universal truth guarantee |
| Embeddings, similarity and semantic search | 11 | Core exact vector retrieval before a database |
| Vector stores, FAISS, HNSW/IVF and pgvector | 12 | One index/store core; other products compared by requirements |
| Data ingestion, chunking, metadata, ACLs and deletion | 12, 13 | Core repeatable ingestion and retrieval checks |
| RAG, citations and evidence validation | 13 | Core end-to-end cited answer pipeline |
| Hybrid retrieval, reranking, RRF, Recall@k/MRR | 14 | Core controlled experiments; nDCG introduction |
| HyDE, ColBERT, compression and query decomposition | 14 | Optional experiments, not hidden required tasks |
| Graph theory, property graphs, RDF and ontology | 15 | Core small graph/traversal; RDF/ontology comparison |
| Entity resolution, provenance and temporal relations | 15, 16 | Core manually checked relations before extraction automation |
| GraphRAG, communities and global/local queries | 16 | Core small graph-assisted path; full Microsoft pipeline optional |
| Raw tools, ReAct, loops and budgets | 17 | Core plain Python implementation before frameworks |
| LangChain messages/models/tools/create_agent | 18 | Core equivalent implementation with traces |
| Runnables/LCEL, middleware and alternatives | 18 | Guided comparison; extra framework projects optional |
| LangGraph state, nodes, edges, reducers and cycles | 19 | Core branching workflow and isolation checks |
| Checkpoints, stores, interrupts and durable execution | 19, 21 | Core restart/resume and approval evidence |
| Memory, compaction, provenance, TTL and deletion | 20 | Core scoped memory with tests |
| MCP, tools/resources/prompts and transport boundaries | 22 | Core local read-only server/client lab |
| A2A, agent cards and task lifecycle | 22 | Guided comparison; a remote implementation optional |
| Supervisor, handoffs, specialists and agent harnesses | 22 | Core small comparison against a single agent |
| LangSmith/OTEL, traces and operational telemetry | 23, 25, 28 | Core trace evidence; platform choice flexible |
| Evals, human/model graders, holdouts and benchmarks | 23, 29 | Core harness and release report; SWE-bench/GAIA orientation |
| Prompt injection, permissions, tenancy and governance | 24 | Core threat model and adversarial tests |
| Caches: answers, embeddings, semantic, prefix and KV | 25 | Core distinctions and selected measured caches |
| Prefill/decode, batching, routing, throughput and p95 | 25 | Core load measurements; GPU serving depth optional |
| Quantization, vLLM and speculative decoding | 25, 27 | Guided serving comparison; advanced hosting optional |
| VLM, CLIP, OCR, STT/TTS and voice | 26 | One multimodal path core; live voice loop optional |
| LoRA/QLoRA, SFT, distillation and tuning evaluation | 27 | Small feasible adaptation; GPU-dependent execution explicitly conditional |
| AWS AgentCore, GCP ADK/Cloud Run/GKE, Azure Foundry | 28 | One deployment when available; three-cloud mapping core |
| Docker, health checks, IAM, CI/CD and rollback | 28 | Core container and deployment readiness |
| Kubernetes/Helm/HPA, sharding and distributed training | 12, 25, 27, 28 | Optional deepening of existing infrastructure skills |
| Enterprise examples | 22–24, 30 | Anthropic research system and Thomson Reuters; first-party claims labeled |
| Experiment design, architecture judgment and innovation | 29, 30 | Core evidence report and a second-use-case proposal |

## Five graph meanings

| Graph | Nodes/edges represent | First learn |
|---|---|---|
| Computation graph | Numerical operations and dependencies for differentiation | Day 4 |
| Attention visualization | Token-to-token computed interaction scores; not the whole model explanation | Day 7 |
| HNSW index graph | Nearby vectors used to navigate similarity search | Day 12 |
| Knowledge/property graph | Entities and semantically meaningful relations | Day 15 |
| LangGraph workflow | Executable nodes, state and control transitions | Day 19 |

## Things 'memory' can refer to

| Mechanism | What persists or is reused | Day |
|---|---|---|
| Model parameters | Learned weights from training | 4, 8 |
| Conversation context | Information supplied for a model call | 6, 10 |
| Workflow checkpoint | Execution state and progress | 19, 21 |
| Long-term application memory | Selected scoped information across sessions | 20 |
| RAG index | Searchable source documents/representations | 11–16 |
| Answer cache | Previously computed output under validity rules | 25 |
| Embedding cache | Vectors for identical content/model versions | 25 |
| Prompt-prefix/KV cache | Reused internal processing, not a user knowledge database | 25 |

## Framework and platform roles

- LangChain: model/tool integrations and prebuilt agents.
- LangGraph: lower-level stateful orchestration and durable execution.
- LangSmith: tracing/evaluation and related development operations.
- OpenAI Agents SDK, Claude Agent SDK, Gemini ADK and AWS Strands: alternative provider/ecosystem abstractions; compare after the raw loop.
- Hugging Face: model/data ecosystem and libraries, not one model.
- LlamaIndex/Haystack: optional retrieval/application frameworks; do not confuse library adoption with learning retrieval.
- Vector databases and Neo4j: storage/query choices; none automatically makes a system accurate.
- Vercel: the learning portal's web deployment target. The Python learner agent may need a different runtime.

Read the corresponding lesson/source records for current documentation. Optional alternatives are orientation, not blanket product recommendations.

## Advanced specialties to revisit within the same 30 units

Causal inference and experimentation; time-series forecasting; recommender systems; graph neural networks; speech/audio; robotics and control; multi-modal generation; large-scale distributed training; mechanistic interpretability; AI security/red teaming; fairness and privacy; data engineering and governance; formal verification of narrow components; advanced retrieval; inference optimization.

These are real specialties requiring additional practice. The course names their entry points so they are not invisible, but does not claim to teach each specialty in depth.

