# 🧠 MedBrain Flashcards

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.x-FF4B4B.svg)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4.svg)

MedBrain is an AI-powered, multi-user flashcard application designed to help medical students (and learners of all kinds) study more efficiently. By simply uploading a photo of handwritten notes or a PDF of a lecture, MedBrain automatically extracts the most important information and converts it into active-recall Question & Answer flashcards.

## ✨ Core Features

- **🤖 AI-Powered Note Extraction:** Upload Images (JPG/PNG) or PDFs. Google's Gemini 1.5 Flash multimodal AI scans the document and automatically generates Q&A flashcards.
- **👥 Multi-User Profiling:** Built-in session management allows multiple users to log in using a unique username. Each user has their own isolated deck of cards, study progress, and streaks.
- **🔄 Spaced Repetition System (SRS):** An intelligent algorithm that schedules cards based on user feedback (`Know`, `Hard`, `Easy`), ensuring maximum retention.
- **🔥 Daily Streak Tracker:** Gamifies the learning experience by tracking daily study streaks to keep users motivated.
- **☁️ Cloud-Native:** Fully hosted on Streamlit Community Cloud with a persistent PostgreSQL database via Supabase.

---

## 🚧 Architectural Challenges & Solutions

### 1. The Ephemeral State Problem
* **Problem:** The MVP used a local SQLite database (`db.sqlite3`). When deployed to Streamlit Community Cloud, the app worked perfectly—until the server rebooted, wiping the ephemeral container and deleting all user flashcards. 
* **Solution:** Ripped out the local database and migrated to a persistent **PostgreSQL** instance via **Supabase**. Rewrote local SQL queries using the Supabase Python Client to handle cloud-native state management.

### 2. Transitioning to a Multi-Tenant Architecture
* **Problem:** The original app was single-user. When shared, all users were writing to the same flashcard deck, ruining each other's Spaced Repetition (SRS) intervals.
* **Solution:** Redesigned the database schema, introducing a `username` primary identifier across all tables. Implemented Streamlit's `st.session_state` to isolate queries, ensuring users only retrieve and modify their own isolated data.

### 3. Multimodal Parsing vs. Heavy OCR
* **Problem:** Extracting text from uploaded PDFs typically requires heavy OCR libraries (like PyPDF2), which bloat the container and slow down processing.
* **Solution:** Bypassed third-party parsers entirely by leveraging Gemini 1.5 Flash's native multimodal API. The app passes the raw byte stream directly to the LLM, significantly reducing dependencies and processing time.

---

## 🚀 Roadmap

- [ ] **Deck Sharing:** Introduce a unique invite-code system allowing users to share specific flashcard decks with classmates (requires relational DB updates).
- [ ] **Data Visualization:** Integrate `plotly` to provide users with visual analytics of their learning curves, recall rates, and daily activity.
- [ ] **OAuth Authentication:** Replace the simple username login with a robust Row Level Security (RLS) and OAuth system via Supabase Auth.

---

## 💻 Local Setup & Installation

If you want to run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/med-brain.git
   cd med-brain
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Secrets:**
   Create a `.streamlit/secrets.toml` file in the root directory and add your API keys:
   ```toml
   GEMINI_API_KEY = "your_google_gemini_api_key"
   SUPABASE_URL = "your_supabase_project_url"
   SUPABASE_KEY = "your_supabase_anon_key"
   ```

4. **Run the app:**
   ```bash
   streamlit run flashcards.py
   ```

---
