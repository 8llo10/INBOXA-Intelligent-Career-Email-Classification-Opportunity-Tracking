# HireMail AI v2

Multi-user bilingual professional-opportunity email intelligence system. Each user creates an account, connects their own Gmail through OAuth, selects one or more professional fields (or All Fields), then the backend syncs Gmail, parses message bodies, classifies professional intent and field locally, stores results in PostgreSQL, and shows relevant messages in a dashboard.

## AI
No OpenAI, Gemini, Claude, or paid AI API is required. The classifier is implemented in TypeScript using a multinomial Naive Bayes model plus bilingual training examples and deterministic extraction helpers. User corrections are stored as additional training examples for later analysis.

## Backend features
- Multi-user account/session isolation
- Password hashing with Node `scrypt`
- Gmail OAuth per user
- AES-256-GCM encrypted Gmail refresh tokens
- Gmail MIME/HTML body parsing
- Professional intent classification
- Field classification across 18 broad fields
- User-configurable fields + All Fields
- Summary, company, role, required action, deadline extraction
- PostgreSQL persistence and unique email deduplication per user
- User-specific feedback/retraining data
- Manual sync + daily Vercel Hobby-compatible scheduled sync
- REST APIs and health endpoint
- Vercel cron route protected with `CRON_SECRET`

## Quick start
1. `cp .env.example .env.local`
2. Create PostgreSQL database and set `DATABASE_URL`.
3. Generate a 32-byte key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and set `ENCRYPTION_KEY`.
4. In Google Cloud create an OAuth Web application. Add `${APP_URL}/api/google/callback` as an authorized redirect URI. Enable Gmail API.
5. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. `npm install`
7. `npm run db:migrate`
8. `npm run dev`
9. Register, open Settings, connect Gmail, choose fields, then Sync.

See `SETUP-AR.md` for Arabic setup and test scenarios.
