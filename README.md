# JobSphere

**A peer-to-peer job sharing platform for students — built around communities, not cold feeds.**

Students spot job openings all the time in emails, WhatsApp groups, LinkedIn posts, career pages — and those openings usually stay locked in one inbox. JobSphere turns that into a shared resource: post an opening once, and everyone in your batch or friend circle sees it, with AI doing the busywork of extracting and structuring the listing.

🔗 **Live app:** [job-sphere-puce.vercel.app](https://job-sphere-puce.vercel.app)

---

## Why this exists

Most student job-portal clones stop at "post a job, list jobs, apply." JobSphere goes further by asking: *who should see this job, and how much manual work should a student have to do to share it well?* That's where the two central ideas come from — **Rooms** (who sees what) and **AI-assisted posting/matching** (how much typing is actually necessary).

---

## Core Features

### 🔐 Auth
- Email + password registration with OTP email verification (no fake/throwaway signups)
- JWT stored in an `httpOnly` cookie — never exposed to client-side JS

### 🏘️ Rooms — scoped job sharing
- Create **public** rooms (anyone can join instantly) or **private** rooms (join by request, owner approves/rejects)
- Each room has its own job feed, member list, and settings
- Room owners can manage membership requests, remove members, and edit room details
- Duplicate-job detection is scoped **per room** — the same opening can be legitimately cross-posted to multiple rooms (e.g. "Batch 2027" and "Batch 2028") without being falsely flagged, but can't be posted twice into the *same* room
- A job posted to multiple rooms at once is deduplicated back into a single card wherever feeds are merged (e.g. the main dashboard), so students don't see the same listing repeated

### 🤖 AI, used for actual leverage (not just a wrapper)
Three distinct AI pipelines, powered by Groq (Llama 3.3):
1. **Job auto-fill** — paste raw text *or* a job posting URL, and the form fills itself. URLs are scraped server-side, preferring structured `JSON-LD` data (the same schema.org markup sites use for Google job listings) with a fallback to cleaned page text.
2. **Resume parsing** — upload a PDF resume, and it pre-fills your profile (bio, education, experience, projects, skills) for review before saving.
3. **Match scoring** — for any job, see a percentage match against your profile with specific "what matches" / "what's missing" reasoning. A **recommendation feed** ("Jobs you might like") batches up to 25 jobs into a single LLM call rather than one call per job, and match results are **cached per user+job** and invalidated only when the profile changes — so scores stay consistent across the dashboard and detail pages instead of drifting on every refresh.

### 👤 Profiles
- Structured profile: bio, education, experience, projects, skills, links, resume
- Profile completion tracker with a progress ring, styled like Naukri/LinkedIn's "add missing details" prompts

### 📌 Jobs
- Post to multiple rooms at once (public + private) in a single flow
- Tag-based skills and eligibility/requirements input
- Optional application deadlines, with automated reminder notifications as they approach (via a daily cron job)
- Bookmark/save jobs for later
- Track applications you've made

### 🔔 Notifications
- In-app notification bell for: join requests, request approvals/rejections, new jobs posted in your rooms, and deadline reminders

### 📊 Room Analytics
- For room owners: member growth and jobs-posted trends over time (cumulative, via MongoDB aggregation pipelines), top contributors, and most-applied-to jobs

### 🛡️ Admin Panel
- Separate app for platform oversight: user/job/room management, role promotion, and platform-wide stats

---

## Tech Stack

**Frontend** — React, TypeScript, Tailwind CSS, Vite, Framer Motion, Recharts
**Backend** — Node.js, Express, TypeScript, MongoDB + Mongoose
**Auth** — JWT in httpOnly cookies, bcrypt password hashing
**AI** — Groq API (Llama 3.3) for job parsing, resume parsing, and match scoring
**File storage** — Cloudinary (resume PDFs)
**Scheduling** — node-cron (deadline reminders)
**Deployment** — Vercel (frontend + admin), Render (backend)

---

## Project Structure

This is a monorepo with three independently deployable apps:

```
JobSphere/
├── frontend/    # Student-facing React app (the main product)
├── backend/     # Express + MongoDB API, shared by frontend and admin
└── admin/       # Separate React app for platform administration
```

---

## Architecture Notes

A few decisions worth calling out, since they weren't the "default" easy path:

- **Duplicate detection is room-scoped, not global.** Comparing `title + company + normalized applyLink` *within a room* (rather than across the whole platform) means the same opening can correctly exist in multiple rooms without collateral false-positives.
- **One job document per room, not an array of rooms on one job.** Posting to multiple rooms creates separate `Job` documents — this keeps per-room analytics, applications, and duplicate checks clean and independent, at the cost of a small amount of data duplication.
- **AI match scores are cached, not recomputed on every view.** A `JobMatch` cache (keyed on user + job) is invalidated only when the profile's `updatedAt` moves past the cache's `computedAt` — this keeps recommendation and detail-page scores consistent with each other and avoids burning LLM calls on every page load.
- **URL-based job scraping prefers structured data over raw text.** Many company career pages embed `schema.org JobPosting` JSON-LD for SEO — reading that first (before falling back to scraped visible text) gives meaningfully more accurate auto-fill results.

---

## Getting Started (local development)

```bash
git clone https://github.com/durgesh-5699/JobSphere.git
cd JobSphere
```

**Backend**
```bash
cd backend
pnpm install
# create a .env file — see backend/.env.example if present, or the Environment Variables section below
pnpm run dev
```

**Frontend**
```bash
cd frontend
pnpm install
pnpm run dev
```

**Admin**
```bash
cd admin
pnpm install
pnpm run dev
```

### Environment Variables (backend)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

To create an initial admin account for testing, run the seed script:
```bash
cd backend
pnpm run seed:admin
```

---

## License

This project is open for learning and reference purposes.
