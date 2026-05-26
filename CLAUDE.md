# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SehatHub is a telehealth engineering platform for a clinic in South Tangerang, Indonesia, serving tourists and expats. It covers CRM, doctor/admin dashboards, booking and payment flows, WhatsApp automations, and AI healthcare tools.

**Status:** Pre-development — see `PRD.md` for full product requirements and `DESIGN.md` for the design system.

---

## Planned Tech Stack

### Monorepo Structure
```
sehathub/
├── apps/
│   ├── web/          # Next.js 14 (App Router) + TypeScript frontend
│   └── api/          # NestJS + TypeScript backend
├── packages/
│   ├── db/           # Prisma schema + migrations
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
├── workers/          # BullMQ job processors
└── docker-compose.yml
```

### Frontend (`apps/web`)
- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + shadcn/ui
- **React Query** for server state, **Zustand** for client state

### Backend (`apps/api`)
- **NestJS** + TypeScript
- **PostgreSQL** + Prisma ORM
- **Redis** for sessions, cache, and BullMQ job queues

### Integrations
- **Midtrans** — IDR payments (GoPay, OVO, DANA, bank transfer)
- **Stripe** — international/expat payments
- **Meta Cloud API** — WhatsApp Business (Baileys as fallback)
- **Claude API** (Anthropic) — AI features: triage, consultation summary, FAQ RAG
- **Resend** — transactional email

### DevOps
- Vercel (frontend), Railway/Render (backend + workers)
- Docker for local dev parity
- GitHub Actions CI/CD

---

## Key Domain Modules

Modules are prioritized P0 → P2 (see PRD.md for full acceptance criteria):

| Priority | Module |
|----------|--------|
| P0 | Auth & RBAC (Super Admin, Admin, Doctor, Patient) |
| P0 | Patient Management |
| P0 | Doctor Management + Availability |
| P0 | Booking & Appointment System |
| P0 | Services & Pricing |
| P0 | Payment & Invoicing |
| P1 | Prescription Management |
| P1 | WhatsApp Automation |
| P1 | CRM & Lead Management |
| P1 | Admin Dashboard & Analytics |
| P2 | AI Features (triage bot, consultation summary, FAQ RAG) |

### Core Data Entities
`users`, `doctors`, `patients`, `services`, `appointments`, `prescriptions`, `prescription_items`, `payments`, `invoices`, `leads`, `crm_activities`, `whatsapp_messages`, `broadcasts`, `audit_logs`

### Appointment Status Flow
`pending → confirmed → in_progress → completed | cancelled | no_show`

### Payment Status Flow
`pending → paid | failed | refunded`

---

## Security Requirements

- RBAC enforced at **API middleware level** (not just frontend)
- PHI encrypted at rest; HTTPS/TLS in transit
- Rate limiting on all public endpoints
- Audit log for all admin actions
- JWT with refresh token rotation
- Comply with Indonesian UU PDP data privacy law

---

## Environment Variables

```env
DATABASE_URL=postgresql://sehathub:sehathub@localhost:5433/sehathub_dev
DIRECT_URL=postgresql://sehathub:sehathub@localhost:5433/sehathub_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=noreply@sehathub.id
NEXT_PUBLIC_API_URL=
FRONTEND_URL=http://localhost:3000
```

---

## Design System

Defined in `DESIGN.md`. Key rules for all UI work:

### Colors
- **Primary CTA:** `#E0004D` (Brand Pink) — all primary action buttons, no exceptions
- **Error:** `#E0004D` / `#F44336`
- **Success:** `#A8DAB5` (Mint); success containers use `#E6F3EF` bg + `#045136` border/text
- **Body text:** `#333333` on `#FFFFFF` backgrounds
- **Borders/dividers:** `#E5E7EB`
- **Alt surface:** `#FAFAFA`

### Typography (Inter font)
- H1: 26px / 700 weight
- H2: 18px / 700 weight
- H3: 14px / 600 weight
- Body: 12–16px / 500 weight; minimum 12px
- Buttons/labels: 16px / 700 weight

### Spacing
4px base unit. Only use: 4, 8, 12, 16, 20, 24, 32, 40, 48, 52, 72, 100px — no arbitrary values.

### Components
- **Primary buttons:** `#E0004D` bg, `#FFFFFF` text, `4px` radius, `8px 16px` padding, 40px height
- **Inputs:** 40px height, `1px solid #E5E7EB` border, `4px` radius, focus ring `rgba(224,0,77,0.1)`
- **Elevated cards:** `#FFFFFF`, `1px solid #E5E7EB`, `8px` radius, shadow `0px 2px 8px rgba(0,0,0,0.08)`
- **Nav active state:** `#E0004D` bottom border `2px solid`, no background change

### Layout
- Max container width: `1408px`
- 12-column grid; breakpoints: mobile (`<600px`), tablet (`600–999px`), desktop (`1000px+`)
- Minimum touch target: `40×40px`
