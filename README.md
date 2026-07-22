
  # MedDiagnostic
An Intelligent Diagnostic Support System designed to assist healthcare specialists and patients by integrating multimodal medical data (medical imaging, clinical notes, laboratory results, and genetic histories) to generate real-time diagnostic insights.
The system leverages a hybrid diagnostic architecture combining clinical heuristics, Retrieval-Augmented Generation (RAG), and the LLaVA-Med vision-language model, with an arbitration layer to prioritize clinical safety and mitigate AI hallucinations.

# Key Features
* Multimodal Data Integration: Support for medical images (JPG, JPEG, PNG, DICOM up to 100MB), unstructured clinical notes (PDF, DOC, DOCX, TXT), and structured laboratory/genetic data.
* Three-Tier Hybrid Diagnostic Engine:
    * Tier 1 (Heuristic Anchor): Evaluates inputs against predefined disease patterns using regular expressions and negation handling to avoid false positives.
    * Tier 2 & 3 (RAG-Enhanced AI): Converts clinical notes to vector embeddings and queries a clinical guidelines database to ground the AI's reasoning.
* Hallucination Mitigation (Arbitration Module): A safety override layer that evaluates AI-generated outputs against banned phrases and weighs the heuristic match score against VLM confidence to determine the most reliable output.
* Reinforcement Learning from Human Feedback (RLHF) Loop: Allows verified clinicians to submit feedback, which is aggregated and used to trigger automated QLoRA fine-tuning of the LLaVA-Med model.
* Secure Timeline & Reporting: An activity timeline for patients and clinicians, with secure PDF report generation using jsPDF.

# System Architecture
The application adopts a modular Model-View-Controller (MVC) architecture separated into three primary layers:
1. Presentation Layer: A responsive React-based user interface tailored to "Healthcare Professionals" (diagnostic review, feedback submission) and "Patients" (data upload, history tracking).
2. Processing Layer: Managed by FastAPI and Django to coordinate data preprocessing, parallel execution of the heuristic anchor and RAG pipeline, and model inference.
3. Data Layer: Supabase-managed storage hosting patient cases, clinician feedback, and a PostgreSQL vector database (pgvector) storing embeddings for clinical context retrieval.

# Tech Stack
* Frontend: React, Tailwind CSS, Axios, jsPDF, jsPDF-AutoTable
* ackend Frameworks: FastAPI (with Uvicorn server), Django REST Framework
* Database & BaaS: Supabase (PostgreSQL, Row-Level Security, pgvector, Supabase Storage buckets)
* AI/ML: LLaVA-Med (7B Parameter Vision-Language Model), SentenceTransformers (miniLM-L6-v2 for embeddings), QLoRA (for model retraining)
* Compute Environment: RunPod (RTX A5000 GPU, 32GB VRAM for model hosting and training)

# Getting Started
**Prerequisites**
* Python 3.11+
* Node.js (v18+)
* Supabase account and active project
* GPU Cloud Instance (e.g., RunPod) to host the LLaVA-Med model




