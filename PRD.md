# Product Requirements Document (PRD)
## SehatHub — Telehealth Engineering Platform

**Version:** 1.1  
**Author:** Faqih (Engineering)  
**Status:** In Development  
**Last Updated:** June 2026  

---

## 1. Overview

### 1.1 Background

SehatHub is a telehealth company based in South Tangerang, Indonesia, serving tourists and expats who need access to doctors, prescriptions, medical support, and healthcare services. The current goal is to build an internal engineering platform that covers CRM workflows, doctor/admin dashboards, booking and payment flows, WhatsApp automations, and AI-powered tools for healthcare operations.

### 1.2 Objective

Build a scalable, maintainable full-stack web platform that enables SehatHub staff (admins, doctors) and patients to manage healthcare interactions end-to-end — from booking a consultation to receiving a prescription — with automated communication and AI assistance.

### 1.3 Scope

- Web-based platform (admin + doctor + patient portals)
- REST API backend
- WhatsApp automation for notifications and workflows
- Payment processing (IDR + international)
- AI-powered features for triage, FAQs, and record summaries
- Internal CRM for lead and patient management

---

## 2. Users & Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Full system access, user management, analytics |
| **Admin** | Manages bookings, patients, CRM, payments |
| **Doctor** | Views appointments, writes prescriptions, accesses patient history |
| **Patient** | Books appointments, pays, receives prescriptions and follow-ups |

---

## 3. Tech Stack

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **React Query** (server state management)
- **Zustand** (client state)

### Backend
- **Node.js** + Express.js or NestJS + TypeScript
- **PostgreSQL** + Prisma ORM
- **Redis** (session, cache, job queues)
- **BullMQ** (background jobs / scheduled tasks)

### AI / Automation
- **Claude API** or OpenAI API (AI features)
- **LangChain** (optional, for RAG/agents)
- **n8n** or custom webhook system (workflow automation)

### WhatsApp
- **Meta Cloud API** (WhatsApp Business API) — primary
- **Baileys** (fallback, self-hosted option)

### Payments
- **Midtrans** (IDR, local Indonesian payment methods)
- **Stripe** (international / expat users)

### DevOps
- **Vercel** (frontend)
- **Railway** or **Render** (backend + workers)
- **Docker** (local dev + production parity)
- **GitHub Actions** (CI/CD)

---

## 4. Modules & Features

---

### Module 1: Authentication & Role Management

**Priority:** P0 (must-have before anything else)

#### Features
- Email + password authentication with JWT
- Role-based access control (RBAC): Super Admin, Admin, Doctor, Patient
- Secure session management with refresh tokens
- Password reset via email
- Doctor onboarding invite flow (admin sends invite link)
- Patient self-registration

#### Acceptance Criteria
- [x] Admin can create/invite doctor accounts
- [x] Each role sees only their permitted pages/data
- [x] JWT refresh token rotation implemented
- [x] Password reset email delivers within 60s

---

### Module 2: Patient Management

**Priority:** P0

#### Features
- Patient profile: name, contact, nationality, passport/ID, medical history notes
- Search and filter patients by name, date, status
- Patient activity timeline (bookings, payments, prescriptions)
- Notes and tags for admin use
- Patient import (CSV bulk upload)

#### Acceptance Criteria
- [x] Admin can create, edit, and view patient profiles
- [x] Search returns results within 500ms for up to 10,000 records
- [x] Patient timeline shows all interactions chronologically
- [ ] Patient import via CSV bulk upload

---

### Module 3: Doctor Management

**Priority:** P0

#### Features
- Doctor profile: name, specialization, availability schedule, bio
- Availability calendar (set working hours, block days off)
- Doctor dashboard: today's appointments, upcoming schedule
- Performance metrics: consultations completed, average rating

#### Acceptance Criteria
- [x] Doctor can set/update their own weekly availability
- [x] Admin can view all doctors and their schedules
- [x] Doctor dashboard loads within 2s
- [ ] Performance metrics: consultations completed, average rating

---

### Module 4: Booking & Appointment System

**Priority:** P0

#### Features
- Patient-facing booking flow: select service → select doctor → select time slot → confirm
- Real-time availability check (no double-booking)
- Appointment statuses: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`
- Admin booking creation on behalf of patient
- Cancellation and reschedule with configurable window (e.g. >2h notice)
- Appointment reminders (24h before, 1h before) via WhatsApp + email
- Doctor can mark appointment as completed and add consultation notes

#### Data Model (simplified)
```
Appointment {
  id, patientId, doctorId, serviceId,
  scheduledAt, status, type (in_person | teleconsult),
  notes, cancellationReason, createdAt, updatedAt
}
```

#### Acceptance Criteria
- [x] Double-booking is prevented at the database level
- [x] Reminders fire automatically via scheduled jobs (24h + 1h BullMQ worker)
- [ ] Patient receives confirmation via WhatsApp within 30s of booking
- [x] Admin can view all bookings with filter/sort by date, doctor, status
- [x] Admin can create bookings on behalf of patient (with slot picker)
- [x] Doctor can mark appointment complete and add consultation notes
- [ ] Patient self-booking UI in patient portal
- [ ] Cancellation time-window enforcement (>2h rule)

---

### Module 5: Services & Pricing

**Priority:** P0

#### Features
- Service catalog: name, description, duration, price (IDR + USD)
- Service categories (General Consultation, Emergency, Prescription, Lab Test, etc.)
- Admin CRUD for services
- Pricing rules: standard, expat rate, promo/discount codes

#### Acceptance Criteria
- [x] Admin can add/edit/deactivate services
- [x] Prices shown correctly in both IDR and USD
- [ ] Promo codes apply correctly at checkout (backend exists, no patient-facing UI)

---

### Module 6: Payment & Invoicing

**Priority:** P0

#### Features
- Midtrans integration (GoPay, OVO, DANA, BCA, Mandiri, credit cards)
- Stripe integration (international cards)
- Invoice auto-generation on payment success (PDF)
- Payment statuses: `pending`, `paid`, `failed`, `refunded`
- Admin manual payment recording (for cash/offline payments)
- Refund processing (admin-triggered)
- Payment history per patient

#### Acceptance Criteria
- [x] Payment webhook handles all Midtrans/Stripe events correctly
- [ ] Invoice PDF auto-sent to patient email on payment success
- [x] Admin can record and reconcile offline payments (cash/bank transfer)
- [x] Payment history list with status filter
- [ ] Refund processing UI and WhatsApp notification to patient

---

### Module 7: Prescription Management

**Priority:** P1

#### Features
- Doctor creates prescription during/after consultation
- Prescription items: medication name, dosage, frequency, duration, notes
- Prescription PDF generation (branded SehatHub template)
- Prescription history per patient
- Admin can view all prescriptions
- Optional: pharmacy integration (future scope)

#### Data Model (simplified)
```
Prescription {
  id, appointmentId, patientId, doctorId,
  items: [{ medication, dosage, frequency, duration }],
  notes, issuedAt, pdfUrl
}
```

#### Acceptance Criteria
- [x] Doctor can create a prescription post-consultation
- [x] PDF generated and downloadable; admin/patient/doctor can download
- [x] Patient can access prescription history in their portal
- [ ] PDF auto-sent to patient via WhatsApp on creation

---

### Module 8: WhatsApp Automation

**Priority:** P1

#### Features

**Notification triggers (automated):**
- Booking confirmation
- Appointment reminder (24h + 1h before)
- Payment received / payment failed
- Prescription ready
- Follow-up message (24h post-consultation)
- Cancellation/reschedule confirmation

**Interactive flows (bot):**
- FAQ bot: "How do I book?", "What's your address?", "Do you accept insurance?"
- Appointment status check: patient types booking ID → gets status
- Human handoff: "Talk to admin" escalates to live agent

**Campaign broadcast (admin):**
- Send bulk messages to segmented patient lists
- Schedule broadcast campaigns
- Track delivery/read rates

#### Acceptance Criteria
- [ ] All booking lifecycle events trigger correct WhatsApp messages
  - [x] Appointment reminder 24h before (BullMQ worker)
  - [x] Appointment reminder 1h before (BullMQ worker)
  - [ ] Booking confirmation on appointment create
  - [ ] Payment confirmation on payment success
  - [ ] Prescription ready notification
- [x] Admin can view message log and send manual messages
- [x] Inbound webhook handler receives and stores messages
- [ ] Interactive FAQ bot flow (inbound message → AI answer via WhatsApp)
- [ ] Broadcast campaign UI with delivery reporting
- [ ] Unsubscribe/opt-out respected and logged

---

### Module 9: CRM & Lead Management

**Priority:** P1

#### Features
- Lead pipeline: `new_lead → contacted → converted → lost`
- Lead source tracking (WhatsApp, website, referral, walk-in)
- Follow-up task assignment to admin staff
- Lead notes and activity log
- Conversion analytics: leads → patients rate
- Contact deduplication

#### Acceptance Criteria
- [x] Admin can move leads through pipeline stages (5-stage kanban-style)
- [x] Lead detail page with activity log (call, email, WhatsApp, note, meeting)
- [x] Lead source tracking (WhatsApp, website, referral, walk-in, social)
- [ ] Follow-up task assignment and reminders to assigned admin
- [ ] Conversion funnel visible in analytics dashboard

---

### Module 10: Admin Dashboard & Analytics

**Priority:** P1

#### Features
- Overview metrics: bookings today/week/month, revenue, active patients
- Booking calendar view (day/week/month)
- Revenue breakdown by service, doctor, payment method
- Patient demographics (nationality, source)
- Doctor utilization report
- Export to CSV/Excel

#### Acceptance Criteria
- [x] Dashboard loads within 3s with real data (stat cards, 7-day revenue chart, recent appointments)
- [ ] Date range filter works across all metrics
- [ ] Booking calendar view (day/week/month)
- [ ] Revenue breakdown by service, doctor, payment method
- [ ] CSV export includes all visible columns

---

### Module 11: AI Features

**Priority:** P2

#### Feature 11.1 — Triage Bot
- Patient describes symptoms via WhatsApp or web chat
- AI suggests appropriate service type (General Consultation, Emergency, Specialist)
- Hands off to booking flow

#### Feature 11.2 — Consultation Summary
- Doctor pastes consultation notes → AI generates structured summary
- Output: chief complaint, diagnosis, treatment plan, follow-up instructions
- Saved to appointment record

#### Feature 11.3 — Prescription Explainer
- Patient can ask AI: "What is this medication for?"
- AI explains in plain language (English + Bahasa Indonesia)

#### Feature 11.4 — FAQ Knowledge Base
- Admin uploads docs (clinic policies, service info)
- AI answers patient questions from knowledge base (RAG)

#### Acceptance Criteria
- [x] Triage bot categorizes symptoms into emergency / urgent / routine / self-care (bilingual EN/ID)
- [x] Consultation summary generates from appointment notes (admin + doctor UI)
- [x] FAQ RAG chatbot answers patient questions from seeded knowledge base (14 bilingual items)
- [x] AI responses include disclaimer; graceful stub when API key not configured
- [ ] Feature 11.3: Prescription explainer ("What is this medication for?")
- [ ] Triage hands off to booking flow after categorization

---

## 5. Non-Functional Requirements

### Performance
- API response time < 500ms for 95th percentile under normal load
- Dashboard page load < 3s
- WhatsApp message delivery < 30s after trigger

### Security
- All data encrypted in transit (HTTPS/TLS)
- PHI (Patient Health Information) encrypted at rest
- RBAC enforced at API middleware level (not just frontend)
- Rate limiting on all public endpoints
- Audit log for admin actions (who changed what, when)

### Reliability
- 99.5% uptime target (excluding planned maintenance)
- Background jobs retry on failure (max 3 retries with backoff)
- Database backups daily (7-day retention)

### Compliance
- Comply with Indonesian data privacy law (UU PDP)
- Patient consent recorded before data collection
- Opt-out mechanism for WhatsApp communications

---

## 6. Milestones & Timeline

| Month | Milestone | Key Deliverables |
|-------|-----------|-----------------|
| Month 1 | Foundation | Auth, DB schema, doctor/admin dashboard shell, CI/CD setup |
| Month 2 | Core Features | Booking flow, payment (Midtrans + Stripe), appointment management |
| Month 3 | Automation & CRM | WhatsApp notifications, CRM pipeline, broadcast module |
| Month 4 | AI Features | Triage bot, consultation summary, FAQ RAG |
| Month 5 | Buffer & Polish | Bug fixes, security audit, performance tuning, docs, handoff |

---

## 7. Out of Scope (v1)

- Mobile app (iOS/Android)
- Telemedicine video call (Zoom/Agora integration)
- Insurance billing integration
- Multi-clinic / multi-location support
- Pharmacy inventory management
- Lab results integration

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which WhatsApp API provider is preferred? (Meta Cloud vs third-party like Wati/Respond.io) | Ba / SehatHub | **Decided: Meta Cloud API** (Baileys as fallback) |
| 2 | Is Stripe needed for v1 or can we start with Midtrans only? | Ba / SehatHub | **Decided: Both** — Midtrans (IDR), Stripe (international) |
| 3 | Are there existing patient records to migrate? | Ba / SehatHub | Open |
| 4 | What languages does the patient-facing UI need? (EN only, or EN + ID) | Ba / SehatHub | **Decided: Both** — bilingual EN/ID throughout |
| 5 | Are there existing doctor accounts/data to seed? | Ba / SehatHub | Open |
| 6 | Is there a design system or brand guideline to follow? | Ba / SehatHub | **Decided: Custom** — defined in DESIGN.md (brand pink #E0004D, Inter font) |

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Scope creep from stakeholder requests | High | High | Pin down MVP in week 1, use this PRD as contract |
| WhatsApp API approval delays (Meta) | Medium | High | Start approval process on day 1; use Baileys as fallback |
| Healthcare data compliance gaps | Medium | High | Involve legal/compliance review before launch |
| Single developer bottleneck | Medium | Medium | Prioritize modular architecture; document as you go |
| Third-party API rate limits | Low | Medium | Implement queuing and retry logic from the start |

---

## 10. Appendix

### A. Environment Variables (Draft)
```env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_API_URL=
```

### B. Suggested Folder Structure
```
sehathub/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express/NestJS backend
├── packages/
│   ├── db/           # Prisma schema + migrations
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
├── workers/          # BullMQ job processors
├── docs/             # Additional documentation
└── docker-compose.yml
```

### C. Key Database Entities
- `users` (all roles)
- `doctors` (extends users)
- `patients` (extends users)
- `services`
- `appointments`
- `prescriptions`
- `prescription_items`
- `payments`
- `invoices`
- `leads`
- `crm_activities`
- `whatsapp_messages`
- `broadcasts`
- `audit_logs`