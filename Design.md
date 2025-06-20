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

**Frontend UI Specification:**
- The login screen is presented as a centered card with a clean, modern design.
- At the top, a circular blue icon with the letter "T" represents the ToolTracker app.
- Below the icon:
  - Title: **ToolTracker Login** (bold, large font)
  - Subtitle: "Enter your credentials to access the system" (smaller, lighter font)
- **Username field:**
  - Input with a user icon on the left
  - Placeholder: "Enter username"
  - Accessible label for screen readers
- **Password field:**
  - Input with a lock icon on the left
  - Placeholder: "Enter password"
  - Eye icon on the right to toggle password visibility
  - Accessible label for screen readers
- **Sign In button:**
  - Large, high-contrast, full-width button labeled "Sign In"
  - Keyboard accessible (Enter key submits form)
- **Demo credentials section:**
  - Shown below the button in smaller text
  - Example: "Demo credentials: Admin: admin / password, User: user / password"
- The card has rounded corners, subtle shadow, and padding for a modern look.
- The layout is responsive and mobile-friendly, with all elements centered vertically and horizontally.
- All fields and buttons have clear focus states for accessibility.
- Error messages (e.g., invalid login) are shown below the fields in a clear, accessible manner.

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

### 4.3 Dashboard Layout (Mobile & Desktop)

The dashboard provides a clear, at-a-glance overview of tool activity and user status, matching the provided UI screenshot. The layout and features are as follows:

**Header:**
- Top bar with:
  - App icon (blue circle with "T") and app name ("ToolTracker") on the left
  - Welcome message with current user and role (e.g., "Welcome, admin (admin)")
  - Centered search bar labeled "Search tools..." for quick filtering
  - Notification bell with badge (shows count of new notifications)
  - Settings (gear), user profile, and logout/share icons on the right

**Summary Section:**
- Row of summary cards, each with an icon and key metric:
  - Checked Out (count, box icon)
  - Overdue (>24h) (count, warning icon, red highlight if nonzero)
  - Repeat Offenders (count, user/group icon, orange highlight)
  - Logged Today (count, checkmark icon, green highlight)
  - Top Area (site name, location pin icon, purple highlight, with tool count)
  - Returns Today (count, box/return icon)
- Cards are visually distinct, spaced, and use color to highlight status (e.g., red for overdue)
- All cards are horizontally scrollable on mobile

**Action Buttons:**
- Directly below the summary tiles, display three large, high-contrast, touch-friendly buttons:
  1. **Loan Tool** – Navigates to the tool checkout flow (`/checkout` route)
  2. **Return Tool** – Navigates to the tool check-in flow (`/checkin` route)
  3. **Record Lost Time** – Navigates to the lost time logging flow (`/lost-time` route)
- Buttons are full-width on mobile, spaced apart, and keyboard accessible
- Each button is clearly labeled and uses color to indicate its action (e.g., blue for loan, green for return, orange/red for lost time)
- Buttons are connected to the corresponding navigation/actions in the codebase

**Checked Out Tools Table:**
- Below the action buttons, a card/table labeled "Currently Checked Out Tools" with a box icon
- Table columns:
  - Tool (name and ID)
  - User (name, user icon)
  - Location (site/area, location pin icon)
  - Time Out (time, clock icon)
  - Duration (elapsed time since checkout)
  - Status ("Active" in blue, "Overdue" in red for tools out >24h)
- Each row shows a tool currently checked out, with all relevant details and icons
- Status is color-coded for quick scanning

**Other UI/UX Details:**
- Clean, modern, card-based layout with clear separation between summary and detail
- Responsive design: summary cards, buttons, and table adapt to mobile and desktop
- All icons are visually descriptive and accessible
- Notification and user actions are always visible in the header
- Search bar is prominent and easy to use
- Table rows and cards have hover/focus states for accessibility

**Implementation Reference:**
- See `client/src/pages/Dashboard.jsx` and `client/src/styles/Dashboard.css` for the current implementation
- The dashboard is the main landing page after login for all roles

**Note:**
- This spec supersedes previous dashboard layout descriptions and should be used as the single source of truth for UI/UX and engineering

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
   * `