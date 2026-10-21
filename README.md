# 🌱 SereneMind — Mental Health Journal & Dynamic ML Platform

> An enterprise-grade full-stack web application designed for mindful journaling, emotional tracking, and real-time mood prediction powered by user-trainable Machine Learning models.

---

## 📋 Table of Contents
1. [Overview & Core Architecture](#overview--core-architecture)
2. [Complete 13-Phase Roadmap Implementation](#complete-13-phase-roadmap-implementation)
3. [Technology Stack](#technology-stack)
4. [Machine Learning Workflow](#machine-learning-workflow)
5. [REST API Contracts](#rest-api-contracts)
6. [Database Schema (ER Structure)](#database-schema-er-structure)
7. [Getting Started & Local Setup](#getting-started--local-setup)
8. [Demo Accounts](#demo-accounts)

---

## 🌟 Overview & Core Architecture

SereneMind bridges personal mental wellness with advanced Machine Learning. Rather than relying on rigid, pre-baked sentiment models, the platform features a **Dynamic ML Training Subsystem**:
- Administrators and trainers can upload any standard CSV dataset with arbitrary column names.
- Map text columns and mood/emotion target labels interactively.
- Automatic text cleaning, n-gram TF-IDF vectorization, and model training across multiple algorithms:
  - **Logistic Regression** (Optimized with L2 penalty and calibrated probability estimation)
  - **Multinomial Naive Bayes** (Fast discrete feature classifier)
  - **Support Vector Machine (Linear SVM)** (Calibrated hyperplanes for multiclass emotion analysis)
- Comprehensive evaluation metrics: **Accuracy, Precision, Recall, F1-Score, and interactive Confusion Matrix heatmaps**.
- Model version registry (`v1.0`, `v2.0`, etc.) with **one-click activation** to instantly power live predictions across user journal entries.
- Real-time inference upon journal entry creation: predicts mood (e.g. *Joy, Sadness, Anger, Anxiety, Calm, Neutral*), sentiment polarity (*Positive, Neutral, Negative*), and generates comforting therapeutic reflection prompts.
- Rich user analytics: streak tracking, mood trends, emotion frequencies, and visual monthly mood calendar.

```
                           ┌────────────────────────────────────────┐
                           │      React.js + Tailwind CSS UI        │
                           │   (Dashboard, Editor, ML Studio)       │
                           └──────────────────┬─────────────────────┘
                                              │ HTTP / JWT
                                              ▼
                           ┌────────────────────────────────────────┐
                           │     Java Spring Boot REST Backend      │
                           │  (Security, JWT, JPA, Business Logic)  │
                           └──────────────┬──────────────────┬──────┘
                                          │                  │
                         Spring Data JPA  │                  │ HTTP REST / Multipart
                                          ▼                  ▼
                           ┌──────────────────┐    ┌────────────────────────┐
                           │  MySQL 8.0 / H2  │    │  Python FastAPI ML     │
                           │     Database     │    │  Scikit-Learn TF-IDF   │
                           └──────────────────┘    └────────────────────────┘
```

---

## 🛠️ Complete 13-Phase Roadmap Implementation

- **Phase 1 — Project Planning & UI Design**: Architecture diagrams, database ER design, REST contracts, and modern calming UI design.
- **Phase 2 — Spring Boot Backend Foundation**: Maven structure, JPA Hibernate entities (`User`, `JournalEntry`, `MoodAnalysis`, `MLDataset`, `MLModelVersion`), repositories, services, DTOs, and global exception handlers.
- **Phase 3 — Dataset Upload Module**: Secure multipart upload handling for arbitrary CSV datasets.
- **Phase 4 — Dataset Validation & Preprocessing**: Dynamic text and label column mapping, missing value/duplicate detection, whitespace and URL stripping, and class distribution verification.
- **Phase 5 — ML Model Training**: Multi-algorithm trainer (Logistic Regression, Naive Bayes, Linear SVM) with configurable test split.
- **Phase 6 — Model Evaluation**: Test-set performance evaluation with quantitative metrics (Accuracy, Precision, Recall, F1) and interactive Confusion Matrix.
- **Phase 7 — Model Saving & Versioning**: Version tag generation, artifact serialization (`joblib`), metadata persistence, and one-click active model activation.
- **Phase 8 — ML Prediction API**: Real-time inference endpoint returning predicted mood, sentiment, confidence scores, emotion probabilities, and therapeutic reflection prompts.
- **Phase 9 — Journal Module**: Complete journal lifecycle (Create, Read, Update, Delete) with automatic trigger of ML mood analysis.
- **Phase 10 — Analytics Dashboard**: Daily/weekly/monthly mood trends, sentiment breakdown donut chart, emotion bar chart, journal streak counter, and interactive monthly mood calendar.
- **Phase 11 — Advanced Insights**: Reflection-oriented questions, frequently occurring emotions, non-clinical supportive wellness guidance.
- **Phase 12 — Security & Testing**: Spring Security + BCrypt password hashing, stateless JWT Bearer token authentication, user-isolated data queries.
- **Phase 13 — Deployment & Documentation**: Setup instructions, environment configurations, and sample datasets.

---

## 💻 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Java 21+, Spring Boot 3.3.4, Spring Web, Spring Security, Spring Data JPA |
| **Authentication** | JSON Web Tokens (JJWT 0.12.5), BCrypt |
| **Database** | MySQL 8.0 (Primary) / H2 (Fallback & Offline Dev) |
| **ML Engine** | Python 3.10+, FastAPI, Scikit-Learn, Pandas, NumPy, Joblib |
| **Build & Tooling** | Maven 3.9+, Node.js 20+, npm |

---

## 🧠 Machine Learning Workflow

```
Admin/Trainer 
     │
     ▼
[Upload CSV] ──► [Inspect Rows & Columns] ──► [Select Text & Label Columns]
     │
     ▼
[Validate & Preprocess] ──► [TF-IDF Feature Extraction] ──► [Select Algorithm]
     │
     ▼
[Train Classifier] ──► [Evaluate Test Set (Accuracy, F1, Confusion Matrix)]
     │
     ▼
[Save Version Tag (e.g. v2.0)] ──► [Click 'Activate Model'] 
     │
     ▼
[Powers Live Journal Mood Prediction in Spring Boot!]
```

---

## 📡 REST API Contracts

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user or trainer (`ROLE_USER` or `ROLE_ADMIN`).
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Journal Entries (`/api/journals`)
- `POST /api/journals` — Create journal entry; triggers instant ML mood prediction.
- `GET /api/journals` — Paginated list of user journals; supports keyword search & mood filtering.
- `GET /api/journals/{id}` — Get single entry with full emotional spectrum and reflection insight.
- `PUT /api/journals/{id}` — Edit entry and automatically re-analyze updated content.
- `DELETE /api/journals/{id}` — Delete entry.

### Analytics (`/api/analytics`)
- `GET /api/analytics/overview` — Streak days, total journals, dominant mood, sentiment breakdown.
- `GET /api/analytics/trends` — Daily mood score progression for area charts.
- `GET /api/analytics/calendar` — Monthly mood calendar mapping.

### ML Training & Inference (`/api/ml`)
- `POST /api/ml/datasets/upload` — Upload CSV dataset.
- `GET /api/ml/datasets` — List available datasets and detected schemas.
- `POST /api/ml/datasets/{name}/validate` — Validate custom text and label columns.
- `POST /api/ml/train` — Train Logistic Regression, Naive Bayes, or SVM model.
- `GET /api/ml/models` — List all trained model versions.
- `POST /api/ml/models/{id}/activate` — Set active model for live predictions.
- `POST /api/ml/predict` — Real-time inference on arbitrary text.

---

## 🚀 Getting Started & Local Setup

### 1. Start Python ML Microservice (Port 8000)
```bash
cd app
python run.py
```
*Health check at `http://localhost:8000/health` or interactive docs at `http://localhost:8000/docs`.*

### 2. Start Spring Boot Backend (Port 8080)
```bash
cd backend
mvn spring-boot:run
```
*(Optionally run with `--spring.profiles.active=h2` if running without local MySQL).*

### 3. Start React Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
*Access web interface at `http://localhost:5173`.*

---

## 👤 Demo Accounts

The application automatically seeds demonstration accounts upon first startup:

| Role | Username | Password | Access |
|---|---|---|---|
| **Regular User** | `user` | `user123` | Dashboard, Writing Journals, History, Analytics |
| **Admin / Trainer** | `admin` | `admin123` | ML Studio, Dataset Upload, Training, Activation |
