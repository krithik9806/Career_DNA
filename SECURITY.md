# SECURITY.md - Career DNA Security & Data Privacy Policy

## 1. Overview
Career DNA (AI Career Twin) handles student profile data, resumes, GitHub repository statistics, and AI mentor conversations. Privacy and row-level security are built into the architecture.

---

## 2. Data Storage & Isolation

- **Authentication**: Powered by Supabase Auth (JWT tokens). Every API request requires a valid `Authorization: Bearer <token>` header.
- **Database Security**: All student data tables (`students`, `resumes`, `github_profiles`, `skill_graph`, `roadmap_items`, `chat_history`) have PostgreSQL **Row Level Security (RLS)** enabled:
  ```sql
  CREATE POLICY "Students manage own data" ON public.table_name FOR ALL USING (auth.uid() = student_id);
  ```
- **Resume Files Privacy**: Resume documents are strictly accessible only by the owning student user ID via Supabase Storage policies.

---

## 3. Third-Party AI Provider Privacy

- **Minimal Context Policy**: No full database dumps or unneeded raw data are ever sent to LLM providers (Gemini / Anthropic).
- Only relevant text snippets (skills list, target role name, ATS score) required to answer the student's specific prompt are passed in the prompt context.
- API keys (`LLM_API_KEY`, `GITHUB_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) reside exclusively server-side in `.env` and are never exposed to the frontend browser.
