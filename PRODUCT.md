# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Staff of a Philippine multi-purpose cooperative (sample co-op: Bayanihan MPC, Cebu City), in three roles: co-op admin, credit manager, and membership officer. They use Fundo Admin at a desk (and sometimes on a phone during branch visits) to work the queue of loan applications members send from the Fundo member app.

## Product Purpose
Fundo Admin is the co-op side of the Fundo app. Staff review loan applications, check documents, approve and release loans, and keep member and staff records. Success means applications get a fair, documented decision quickly and members are paid out without paperwork round-trips.

## Positioning
Applications arrive already filled in from the member's phone, with documents attached, and the admin checks them against the co-op's own loan rules (share-capital multiples, pay-ratio limits, co-maker requirements) in plain sentences with real peso figures.

## Operating Context
- Loan products: Salary, Emergency, Livelihood, Starter, each with its own rate, multiple, cap, co-maker and document rules.
- Documents: valid ID (e.g. PhilSys), proof of income, certificate of employment, business permit and the like.
- Release goes out by GCash or Maya, with a reference recorded.
- Roles gate actions: admins manage staff; credit managers decide loans and verify documents; membership officers edit members.

## Capabilities and Constraints
- Static prototype (index.html, app.js, styles.css) for GitHub Pages; sample data is seeded and saved in the browser's localStorage.
- Sign-in is a prototype account picker, not real authentication; real staff accounts must be connected before going live.
- The front door is a staff sign-in screen (same pattern as the member app: lime brand panel + plain sign-in). It does not sell or explain the product.

## Brand Commitments
Name "Fundo" with its lime logo mark; "Fundo Admin" for the staff side. Plain, warm, direct copy in sentence case.

## Evidence on Hand
None beyond the product itself. This is a prototype: no real customer co-ops, usage figures, testimonials, or pricing. Future work must not invent them.

## Product Principles
- The queue is the job: every surface points staff at decisions waiting on them.
- Show the reasoning: checks are plain sentences with real numbers, not scores.
- Role-aware, not role-hidden: say why an action is locked instead of removing it.
- Honest about being a prototype until it is connected to real accounts.
