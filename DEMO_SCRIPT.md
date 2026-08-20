# DEMO_SCRIPT.md — Judge Presentation Click-Through Sequence (< 4 Minutes)

This script provides the exact demo flow to present **Career DNA (AI Career Twin)** for SIH25094 judges in under 4 minutes.

---

## ⏱️ Minute 0:00 – 0:45: Sign In & Student Digital Twin Onboarding
1. **Open Demo App** at `http://localhost:3000` (or deployed Vercel URL).
2. Click **"Get Started"** or **"Sign In"** to authenticate via Supabase Auth (or Google OAuth).
3. Land on **Student Profile Builder (`/onboarding`)**:
   - Step 1: Input Name & Degree (e.g. `Alex Johnson`, `B.Tech Computer Science & Engineering`).
   - Step 2: Select Target Role (e.g. `Full-Stack Web Developer`).
   - Step 3: Select Self-Reported Skills (e.g. `JavaScript`, `React`, `Git`).
4. Click **"Complete Profile"** to land on the Digital Twin Dashboard.

---

## ⏱️ Minute 0:45 – 1:30: Resume Upload & ATS Completeness Analyzer
1. Click **"Resume"** in top navbar.
2. Drag & drop a sample PDF or DOCX resume into the dropzone.
3. Watch the extraction engine parse the document in real time:
   - Highlight the **ATS Completeness Score Gauge** (e.g., `85%`).
   - Show the **Extracted Skills Pills** automatically merged into the Skill Graph.
   - Point to the **Flagged ATS Gaps & Actionable Recommendations Panel** (e.g. missing quant metrics or links).

---

## ⏱️ Minute 1:30 – 2:15: GitHub Project Quality Score Analyzer
1. Click **"GitHub"** in top navbar.
2. Enter a public GitHub username (e.g. `octocat` or team member username).
3. Click **"Fetch Stats & Merge Skills"**:
   - Showcase the computed **Project Quality Score** (e.g. `80%`).
   - Show repository stats (Total Stars, Forks, Top Languages).
   - Point out how languages and repository topic tags are extracted and added to the skill graph.

---

## ⏱️ Minute 2:15 – 3:00: Interactive Skill Graph & AI Roadmap Generator
1. Return to **Dashboard (`/dashboard`)**:
   - Showcase the **Placement Readiness Composite Score** (weighted composite of Resume ATS + GitHub Quality + Skill Gap Closure).
   - Show the **Interactive Aggregated Skill Graph** clustering skills from all 3 sources (Resume: Emerald, GitHub: Purple, Self-Reported: Indigo).
2. Click **"Roadmap"** in top navbar:
   - Click **"Re-Generate AI Roadmap"**.
   - Show the **Sequenced Milestone Timeline** diffing current skills vs target role standards.
   - Expand **"Why this recommendation?"** to show plain-language AI explainability.
   - Point out curated **Recommended Course Links** (Coursera/Udemy).

---

## ⏱️ Minute 3:00 – 3:50: Grounded RAG AI Mentor Chat
1. Click **"AI Mentor"** in top navbar.
2. Highlight the **"AI Grounded Memory"** sidebar showing the judges that the AI is grounded in the student's real profile JSON.
3. Click a prompt chip: *"What are my biggest skill gaps for my target role?"*.
4. Show the AI mentor's response citing the student's exact resume and GitHub skills while providing hyper-personalized advice.

---

## 🏆 Minute 3:50 – 4:00: Closing Pitch Summary
- *"Career DNA transforms generic career advice into an active Digital Twin powered by real data, automated ATS scoring, and grounded AI mentoring."*
