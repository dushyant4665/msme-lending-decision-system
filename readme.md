# MSME Lending Decision System

A loan approval system for small businesses. Fill a form, get a credit score and decision in real-time.

## What it does

- Business owner submits their details and loan request
- System calculates a credit score (300-900 range)
- Approves or rejects based on revenue, loan amount, and risk factors
- Shows the decision with reason codes

## Tech used

**Backend:**
- Express.js API
- PostgreSQL (business and loan data)
- Redis + BullMQ (async decision processing)
- Prisma ORM

**Frontend:**
- React + Vite
- Basic form and result display

## Decision logic

The scoring engine looks at:
- Monthly revenue vs loan amount
- EMI to revenue ratio
- Loan tenure (3-60 months acceptable)
- Business consistency checks

Score of 600+ = approved (unless flagged for data issues)

## Setup

**Prerequisites:**
- Node.js
- Docker (for PostgreSQL and Redis)

**1. Start databases:**
```bash
cd backend
docker-compose up -d
```

**2. Setup backend:**
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev          # starts API server on port 5000
```

**3. Start worker (in new terminal):**
```bash
cd backend
npm run worker       # processes loan decisions
```

**4. Setup frontend:**
```bash
cd frontend
npm install
npm run dev          # starts on port 5173
```

Open http://localhost:5173

## API endpoints

```
POST   /api/business              - Create business profile
POST   /api/loan                  - Submit loan application
POST   /api/decision/:loanId      - Trigger decision (queued)
GET    /api/decision/:loanId/status - Check decision result
```

## How it works

1. User fills form → creates Business record
2. Creates LoanApplication linked to business
3. Triggers decision job → goes to Redis queue
4. Worker picks up job → runs scoring engine
5. Saves Decision record → updates loan status
6. Frontend polls until decision is ready

## Reason codes you might see

- `GOOD_REVENUE` - Monthly revenue ≥ ₹1L
- `LOW_RISK` - Loan amount ≤ 2x monthly revenue
- `HIGH_LOAN_RATIO` - EMI > 50% of revenue
- `LOW_REVENUE` - Revenue < ₹20k
- `TENURE_RISK` - Unusual loan tenure
- `DATA_INCONSISTENCY` - Loan > 10x revenue (auto-reject)

## Database schema

```
Business (owner, PAN, type, revenue)
  ↓
LoanApplication (amount, tenure, purpose, status)
  ↓
Decision (approved, creditScore, reasonCodes)
```

AuditLog tracks all actions.

---

Built with Node.js, React, PostgreSQL, and Redis.