# Tool Tracker - Design Specification Document

## 1. Overview

This document outlines the **technical, UX, and interaction design** for the Tool Tracker application as described in the Product Requirements Document (PRD). It bridges the gap between product goals and implementation, providing guidance for engineering and UI/UX development.

---

## 2. Design Principles

* **Touch-first UX:** All interfaces must be optimised for large buttons, gesture-safe areas, and mobile-first breakpoints.
* **Feedback-rich interactions:** Every key action (scan, log, error) must be confirmed both **visually** and **audibly**.
* **Offline-first architecture:** Ensure usability in low-connectivity environments with sync reconciliation logic.
* **Zero-training interface:** All core user flows should require no prior technical training to complete.
* **Secure Entry Point:** The application must load directly to the **Login screen** as the first user interaction.

---

## 3. Application Architecture

**Frontend:** React PWA (via Vite or Create React App)

* Mobile-optimised design
* Camera access via `@zxing/library` or equivalent
* IndexedDB/localStorage caching for offline support
* Service workers for sync

**Backend:** Node.js REST API

* Authentication via JWT
* Role-based middleware for access control
* PostgreSQL via pgAdmin for persistence
* RESTful endpoint structure, built with Express

**Hosting:** Private on-prem server

* Secure local access only

---

## 4. UX Flows

### 4.0 Login Flow (Mandatory Entry Point)

```text
1. On app load → Redirect to /login route

2. Enter credentials (username, password or scan ID if configured)
   └─ [Visual Feedback] Invalid or Success

3. On success:
   ├─ Save JWT to local storage
   └─ Redirect user to Dashboard or Check-in screen (based on role)
```

### 4.1 Tool Check-In / Check-Out Flow

```text
1. Scan Personnel ID (Code-128 barcode from hardhat sticker)
   └─ [Success Sound + Visual ✅: "Welcome, Tom"]

2. Scan Tool (Code-128 barcode from tool body)
   └─ [Success Sound + Visual ✅: "Tool recognised: Impact Driver"]

3. Select Location of Use
   ├─ Dropdown list of predefined areas
   ├─ Searchable list with autocomplete
   └─ (Optional) Interactive site map where user can drop a pin on intended location

4. Confirm Log
   └─ Summary screen with [Confirm] and [Undo]

5. Loop to next entry or [End Session]
```

**Check-In Flow mirrors this** with additional validation:
* **Rule:** Same user must check tool back in
* **Storeperson Override:** Storeperson may override in exceptional cases
* **Ownership Verification:** System verifies tool was checked out by the scanning personnel

### 4.2 Lost Time Logging Flow

```text
1. Tap [Log Lost Time] button (available if waiting/searching >10 minutes)

2. Scan or enter Tool ID manually (optional)

3. Select Reason from dropdown:
   ├─ Tool missing
   ├─ Wrong tool issued
   ├─ Battery/charger unavailable
   └─ Other

4. Enter Minutes Lost

5. (Optional) Comment Field

6. Submit
   └─ Confirmation with timestamp, log ID
```

### 4.3 Dashboard Layout (Mobile)

* **Top Section:** Summary tiles (scrollable left-right)
  * All currently checked-out tools
  * Overdue tools (>24 hours)
  * Repeat late return offenders
  * Total tools logged today
  * Area with most tool usage
  * Tool returns count
  * Tools missing >24 hours
  * Total time lost due to tooling issues

* **Middle Section:** Graph widgets
  * Usage by area
  * Time lost graph (bar, daily)
  * Missing tools count
  * Top offenders

* **Bottom Section:** Lost time logs, overdue list (expandable list views)

**Implementation Notes:**
- The dashboard frontend fetches all metrics from the backend via the `/api/dashboard/summary` endpoint.
- The backend aggregates and returns all required metrics in a single API call.
- The frontend displays a loading indicator while fetching data.
- If the backend is unavailable, the dashboard falls back to mock data for demonstration purposes.
- The dashboard is mobile-first, touch-friendly, and visually clear, as per design principles.

### 4.4 User Management Flow

* **Add New Users:** Via barcode scanning and dashboard form
* **Auto-deactivation:** Users deactivated after 30 days of inactivity
* **Role-based Access:**
  * **Admin:** Full access, create/edit/delete users and tools, access all reports
  * **Storeperson:** Can log tools in/out, access all reports
  * **Worker:** Can log tools in/out, view personal tool history, receive notifications

### 4.5 Reservation System Flow

* Users can reserve tools for specific days
* Prevents others from checking out reserved tools
* Reservation management interface for storepersons

---

## 5. Key UI Components

### 5.1 Scanner Module

* Uses device camera, full screen modal
* Live barcode preview with crosshair
* Real-time feedback (green overlay on successful scan)
* Support for Code-128 standard
* Camera access through PWA to scan tool and personnel

### 5.2 Interactive Site Map

* SVG-based map, loaded from backend
* Tap-to-drop pin UX with draggable pin
* Confirm button anchors location to transaction
* Visual representation of tool locations across site

### 5.3 Dropdowns and Forms

* Use native HTML5 elements for max mobile compatibility
* Implement debounce on search bar input
* Predefined areas: Site Office, Main Workshop, Electrical Room, Mechanical Room, Storage Area, Construction Zone A, Construction Zone B, Outdoor Work Area

### 5.4 Reporting Interface

* Exportable CSV reports:
  * Personnel with overdue tools
  * Tool usage by user (7-day, 30-day windows)
  * Lost tooling time incidents
  * Late tool returns (frequency)
* Interactive graphs and charts
* Filterable data views

---

## 6. Database Schema Summary (with Checklist for pgAdmin Setup)

All table creation should occur in pgAdmin using either SQL scripts or the GUI interface.

### ✅ Required Tables:

1. **users**
   * `user_id` (PK, serial)
   * `barcode_id` (text, unique)
   * `name` (text)
   * `phone` (text)
   * `role` (enum: Admin, Storeperson, Worker)
   * `active` (boolean, default: true)
   * `last_active_at` (timestamp)

2. **tools**
   * `tool_id` (PK, serial)
   * `barcode_id` (text, unique)
   * `description` (text)
   * `type` (enum: Hand Tool, Power Tool, etc.)
   * `status` (enum: available, checked_out, overdue, reserved)
   * `last_user_id` (FK → users.user_id)
   * `home_location` (text)

3. **tool_transactions**
   * `transaction_id` (PK, serial)
   * `tool_id` (FK → tools.tool_id)
   * `user_id` (FK → users.user_id)
   * `checkout_time` (timestamp)
   * `checkin_time` (timestamp, nullable)
   * `location_used` (text)
   * `return_photo_url` (text, nullable)

4. **lost_time_logs**
   * `log_id` (PK, serial)
   * `user_id` (FK → users.user_id)
   * `tool_id` (FK → tools.tool_id, nullable)
   * `reason` (enum: tool_missing, wrong_tool, battery_issue, other)
   * `time_lost_minutes` (integer)
   * `comment` (text, nullable)
   * `timestamp` (timestamp)

5. **reservations**
   * `reservation_id` (PK, serial)
   * `user_id` (FK → users.user_id)
   * `tool_id` (FK → tools.tool_id)
   * `reserved_date` (date)

6. **audit_logs** (for compliance)
   * `log_id` (PK, serial)
   * `user_id` (FK → users.user_id)
   * `action` (text)
   * `details` (jsonb)
   * `timestamp` (timestamp)

> If you're only using pgAdmin for table management, this structure is appropriate and performant. However, **do not rely solely on the GUI** for relationship constraints — use explicit `ALTER TABLE ... ADD CONSTRAINT` statements or check the Constraints tab to avoid orphan records.

If the database grows or scales beyond one site, **consider moving to a migration tool like Sequelize (Node)** or **SQLAlchemy (Python)** to better version and manage your schema.

---

## 7. REST API Endpoints (High-Level)

### Authentication
* `POST /auth/login` – Returns JWT

### Tools
* `GET /tools/:id`
* `POST /tools/checkout`
* `POST /tools/checkin`
* `GET /tools/checked-out`
* `GET /tools/locations`
* `POST /tools/verify-ownership/:barcode`

### Users
* `GET /users/:id`
* `POST /users/new`
* `GET /user/current`

### Transactions
* `GET /transactions/active`
* `GET /transactions/overdue`
* `POST /transactions`

### Lost Time
* `POST /lost-time`
* `GET /lost-time/report`

### Dashboard
* `GET /dashboard/summary`

### Reservations
* `POST /reservations`
* `GET /reservations`
* `DELETE /reservations/:id`

---

## 8. Offline Mode Strategy

* All tool/user scans stored in `IndexedDB`
* Queued transactions marked with `syncPending = true`
* Background sync attempts via service worker with exponential backoff
* Sync status badge shows pending count (red bubble)
* Local caching for tool/user scan data
* Synchronise once back online

---

## 9. Accessibility & Compliance

* WCAG 2.1 AA standard for mobile (contrast, tap target size, audio cues)
* No reliance on fine motor interaction (swipe gestures optional, not required)
* Support for screen reader labels on all interactive elements
* Auditory + visual feedback for all scan actions

---

## 10. Security Requirements

* HTTPS enforced
* JWT token authentication
* Input validation (client and server side)
* Audit logs of all user actions
* PII protection for user name and phone
* Role-based access control

---

## 11. Future UI Components (Planned)

* Tool request system: workers request tools for pickup
* Messaging: notify storeperson of tool need
* Photo capture of returned tools
* Supervisor dashboard: compliance heatmap + top offenders list
* Component library documentation for internal design system
* Maintenance scheduling interface
* Notifications system:
  * Reminders for overdue tools
  * Supervisor alerts for lost tooling time
  * Peer notifications if tool needed is not returned

---

## 12. Design Assets

* Tool icons: .svg pack (hammer, drill, spanner etc.)
* Pin-drop icons for site map: SVG
* Font: Roboto (Google Fonts)
* Colour scheme: Yellow (#FFC107), Deep Grey (#212121), White (#FAFAFA)

---

## 13. Performance Requirements

* **Speed:** All logic must assume quick access and fast operation at a physical tool counter
* **Efficiency:** Interface clarity critical to user adoption
* **Mobile Optimization:** Responsive design for mobile devices
* **Offline Capability:** PWA will support installation and offline use

---

## 14. Final Notes

This design spec reflects a first-release version aligned with construction field usability. Emphasis is placed on **speed**, **simplicity**, and **traceability**.

**Key Success Metrics:**
* Reduce tool loss rate
* Ensure tool check-in/out is traceable to individual personnel
* Track tool usage and location
* Reduce lost time waiting for tools
* Improve audit trail and compliance

Ongoing feedback from storepersons and foremen will guide iterative refinement.

> Document owner: UX Designer, Tool Tracker Project
> Last updated: June 2025
