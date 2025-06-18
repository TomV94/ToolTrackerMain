# Tool Tracker - Product Requirements Document (Updated)

## 1. Overview

Tool Tracker is a camera-enabled, barcode-driven Progressive Web Application (PWA) designed for use on construction sites to manage and track tools in real time. The primary goal is to reduce tool loss and improve accountability. Designed for users with low technical literacy, it offers a touch-friendly, offline-capable experience tailored for mobile devices used on-site.

## 2. Users & Environment

* **Target Environment:** Construction sites with mobile internet access.
* **Primary User Role:** Storeperson (trade assistant level), Workers, Admins.
* **Tech Access:** All users will use mobile phones. PWA will support installation.

## 3. Goals & Success Metrics

* Reduce tool loss rate
* Ensure tool check-in/out is traceable to individual personnel
* Track tool usage and location
* Reduce lost time waiting for tools
* Improve audit trail and compliance

## 4. Core Functional Features

### 4.1 Tool Check-In / Check-Out Flow

* Storeperson and Technician roles both initiate check-in and check-out
* Triggered by "Log Out" or "Log In" button
* **Step 1:** User (Storeperson or Technician) scans personnel barcode (Code-128)
* **Step 2:** System shows success visually and with sound
* **Step 3:** User scans tool barcode
* **Step 4:** System confirms visually and with sound
* **Step 5:** Prompt to enter intended tool usage area using one of the following:

  * Dropdown menu of predefined areas
  * Searchable list
  * **Interactive site map where user can drop a pin on intended location of tool use**
* **Step 6:** System confirms tool is checked out and loops to allow next entry
* **Rule:** Same user must check tool back in. Storeperson may override in exceptional cases

### 4.2 Barcode Scanning

* Support for Code-128 standard
* Camera access through PWA to scan tool and personnel
* Personnel barcodes affixed on laminated hardhat stickers
* Tool barcodes laminated and stuck to tool bodies

### 4.3 Dashboard

* Summary windows:

  * All currently checked-out tools
  * Overdue tools (>24 hours)
  * Repeat late return offenders
  * Total tools logged today
  * Area with most tool usage
  * Tool returns count
  * Tools missing >24 hours
  * Total time lost due to tooling issues (manual log input)
* **Log Lost Time Button:**

  * User can click if waiting/searching >10 minutes
  * Prompts for tool (scan or write-in), minutes lost, reason (dropdown), optional comment
  * Data logged and visible in reports

### 4.4 User Management

* Roles:

  * **Admin:** Full access, create/edit/delete users and tools, access all reports
  * **Storeman:** Can log tools in/out, access all reports
  * **Worker:** Can log tools in/out, view personal tool history, receive notifications
* Add new users or tools via barcode scanning and dashboard form
* Auto-deactivate users after 30 days of inactivity

### 4.5 Tool Data Structure

* Tool ID
* Barcode ID (Code-128)
* Description
* Type (e.g. Hand Tool, Power Tool)
* Status (available, checked out, overdue, reserved)
* Last user
* Location used
* Home location (Commissioning Store or Mech Container)
* Timestamps for check-in/out

### 4.6 Reporting

* Exportable CSV reports:

  * Personnel with overdue tools
  * Tool usage by user (7-day, 30-day windows)
  * Lost tooling time incidents
  * Late tool returns (frequency)
* Graphs:

  * Total tool usage by area
  * Missing tools count
  * Top offenders
  * Time lost waiting/searching for tools

### 4.7 Reservation System

* Users can reserve tools for specific days
* Prevents others from checking out reserved tools

### 4.8 Offline Support

* Local caching for tool/user scan data
* Synchronise once back online

### 4.9 Notifications (Planned)

* Reminders for overdue tools
* Supervisor alerts for lost tooling time
* Peer notifications if tool needed is not returned

### 4.10 Optional Future Enhancements

* Tool request system: workers request tools for pickup
* Messaging: notify storeperson of tool need
* Photo capture of returned tools
* Supervisor dashboards for tool usage accountability
* Maintenance scheduling

## 5. Technical Requirements

### 5.1 Frontend

* React-based Progressive Web App
* Responsive design for mobile
* Touch-optimised UI
* Camera access using `@zxing/library` or equivalent
* Service workers for offline capability

### 5.2 Backend

* Node.js with RESTful API architecture
* PostgreSQL database managed via pgAdmin
* Auth: JWT-based authentication
* Role-based access control
* Data validation (tool and user entries)
* Transactional logging (check-in/check-out)
* REST preferred for simplicity and performance under current scope

  * Easier for mobile clients to consume
  * Better caching and statelessness
  * Widely supported, simpler than GraphQL

### 5.3 Security

* HTTPS enforced
* JWT token authentication
* Input validation (client and server side)
* Audit logs of all user actions
* PII protection for user name and phone

## 6. Database Tables (Summary)

### users

* user\_id (PK)
* barcode\_id
* name
* phone
* role (Admin, Storeman, Worker)
* active (boolean)
* last\_active\_at

### tools

* tool\_id (PK)
* barcode\_id
* description
* type
* status
* last\_user\_id (FK)
* home\_location

### tool\_transactions

* transaction\_id (PK)
* tool\_id (FK)
* user\_id (FK)
* checkout\_time
* checkin\_time
* location\_used
* return\_photo\_url (optional)

### lost\_time\_logs

* log\_id (PK)
* user\_id (FK)
* reason
* time\_lost\_minutes
* tool\_id (FK, optional)
* comment (optional)
* timestamp

### reservations

* reservation\_id (PK)
* user\_id (FK)
* tool\_id (FK)
* reserved\_date

## 7. Deployment

* Privately hosted on-site server
* PostgreSQL backend managed via pgAdmin
* Access restricted to local network only

## 8. Language Support

* English (AU) only

## 9. Final Notes

* Application designed for storepersons and technicians with minimal tech skills
* Auditory + visual feedback for all scan actions
* All logic must assume quick access and fast operation at a physical tool counter
* Efficiency and clarity of interface are critical to user adoption
