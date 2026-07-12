# AssetFlow - Hackathon Implementation & Work Plan

This plan outlines the design, folder structures, database schema, and division of labor to deliver **AssetFlow** by the 5:00 PM hackathon deadline.

---

## Technical Start & Setup (Where to Start)

Since you have 7 hours, start with a parallel setup to ensure nobody is blocked:
1. **Initialize the Project**: Create a git repository with two main folders: `backend/` and `frontend/`.
2. **Database & ORM First (Backend Partner)**: Immediately spin up a MySQL database (local server or Docker), initialize Prisma, define the schema, and write a seed script with realistic mock data (departments, assets, categories, users). **Having a seeded database is the #1 cheat code for fast hackathon development.**
3. **Skeleton UI Setup (Frontend Developers)**: Initialize React (Vite) + Tailwind CSS, setup routing (React Router), and build the standard navigation layout (Sidebar, Top Navbar, Dark Mode toggle).
4. **Auth & Controllers (You - Team Leader)**: Create the Node.js Express server, connect Prisma, and implement the JWT-based signup and login system.

---

## Directory Structure

Here is the clean, modular folder structure recommended for this project:

### Backend Structure
```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   └── seed.js             # Mock data seeding script
├── src/
│   ├── modules/            # Domain-specific modules
│   │   ├── auth/           # Login, signup, token validation
│   │   ├── users/          # Employee directory, roles
│   │   ├── departments/    # Department CRUD
│   │   ├── categories/     # Category CRUD
│   │   ├── assets/         # Asset registration, scan, history
│   │   ├── allocation/     # Asset assignment, returns, transfers
│   │   ├── bookings/       # Resource scheduling & conflicts
│   │   ├── maintenance/    # Requests, technician workflows
│   │   └── reports/        # CSV generation & AI insights engine
│   ├── middleware/         # Auth, roles, error handlers
│   │   ├── auth.js         # JWT validation
│   │   ├── role.js         # Role enforcement
│   │   └── error.js        # Global error handler
│   ├── utils/              # Shared helper functions
│   │   ├── qr.js           # QR code generation utilities
│   │   └── ai.js           # AI rule engine helper
│   ├── app.js              # Express app setup (cors, json parser, routing)
│   └── server.js           # Server startup (port listener)
├── .env                    # Environment variables (PORT, DATABASE_URL, JWT_SECRET)
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/         # Reusable presentation components
│   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   ├── Navbar.jsx      # Top profile & mode navbar
│   │   ├── Table.jsx       # Generic dynamic data table with search
│   │   ├── Modal.jsx       # Standard overlay modals for forms
│   │   ├── Card.jsx        # Dashboard stat/KPI card
│   │   ├── Charts.jsx      # Recharts visualizations
│   │   └── Timeline.jsx    # Vertical asset event timeline
│   ├── pages/              # Routing entry points
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx   # Metrics, charts, notifications
│   │   ├── Departments.jsx
│   │   ├── Categories.jsx
│   │   ├── Employees.jsx
│   │   ├── Assets.jsx      # Asset list, details, QR code displays
│   │   ├── Allocation.jsx  # Assigning and requesting transfers
│   │   ├── Booking.jsx     # Booking resource calendar/form
│   │   ├── Maintenance.jsx # Maintenance tickets & statuses
│   │   ├── Reports.jsx     # Export triggers and static tables
│   │   └── Profile.jsx
│   ├── layouts/
│   │   └── AppLayout.jsx   # Outer container with sidebar/navbar
│   ├── routes/
│   │   └── AppRoutes.jsx   # Route configuration (protected/public)
│   ├── hooks/
│   │   ├── useAuth.js      # Local storage auth tracking
│   │   └── useFetch.js     # Unified axios data retrieval hook
│   ├── services/
│   │   └── api.js          # Pre-configured axios instance
│   ├── context/
│   │   ├── AuthContext.jsx # Global auth state (user details, tokens)
│   │   └── ThemeContext.jsx# Dark/light mode theme wrapper
│   ├── utils/
│   │   └── helpers.js      # Date formatters, string utilities
│   ├── index.css           # Tailwind direct imports & root colors
│   ├── main.jsx
│   └── App.jsx
```

---

## Database Schema (Prisma & MySQL)

Save this model into `backend/prisma/schema.prisma`. It represents all entity constraints and relationships needed for the core modules.

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  ASSET_MANAGER
  DEPARTMENT_HEAD
  EMPLOYEE
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum AssetCondition {
  NEW
  GOOD
  FAIR
  POOR
}

enum AssetStatus {
  AVAILABLE
  ALLOCATED
  RESERVED
  UNDER_MAINTENANCE
  LOST
  RETIRED
  DISPOSED
}

enum AllocationStatus {
  ACTIVE
  RETURNED
  TRANSFERRED
}

enum TransferStatus {
  PENDING
  APPROVED
  REJECTED
}

enum BookingStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum MaintenanceStatus {
  PENDING
  APPROVED
  TECHNICIAN_ASSIGNED
  IN_PROGRESS
  COMPLETED
}

model Department {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  status      UserStatus @default(ACTIVE)
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  assets      Asset[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id                   String               @id @default(uuid())
  email                String               @unique
  password             String
  name                 String
  role                 Role                 @default(EMPLOYEE)
  status               UserStatus           @default(ACTIVE)
  departmentId         String?
  department           Department?          @relation(fields: [departmentId], references: [id])
  allocations          AssetAllocation[]    @relation("EmployeeAllocations")
  allocatedBy          AssetAllocation[]    @relation("AllocatedByAdmin")
  bookings             Booking[]
  maintenanceRequests  MaintenanceRequest[] @relation("RaisedBy")
  approvedMaintenance  MaintenanceRequest[] @relation("ApprovedBy")
  notifications        Notification[]
  activityLogs         ActivityLog[]
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt
}

model Asset {
  id                  String               @id @default(uuid())
  assetTag            String               @unique // Auto-generated code, e.g. AST-001
  name                String
  categoryId          String
  category            Category             @relation(fields: [categoryId], references: [id])
  serialNumber        String               @unique
  acquisitionDate     DateTime
  acquisitionCost     Float
  condition           AssetCondition       @default(GOOD)
  location            String
  image               String?
  isSharedResource    Boolean              @default(false)
  status              AssetStatus          @default(AVAILABLE)
  allocations         AssetAllocation[]
  bookings            Booking[]
  maintenanceRequests MaintenanceRequest[]
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
}

model AssetAllocation {
  id             String           @id @default(uuid())
  assetId        String
  asset          Asset            @relation(fields: [assetId], references: [id])
  employeeId     String
  employee       User             @relation("EmployeeAllocations", fields: [employeeId], references: [id])
  allocatedById  String
  allocatedBy    User             @relation("AllocatedByAdmin", fields: [allocatedById], references: [id])
  allocatedAt    DateTime         @default(now())
  returnedAt     DateTime?
  status         AllocationStatus @default(ACTIVE)
  transferToId   String?
  transferStatus TransferStatus?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model Booking {
  id        String        @id @default(uuid())
  assetId   String
  asset     Asset         @relation(fields: [assetId], references: [id])
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  date      DateTime
  startTime DateTime
  endTime   DateTime
  status    BookingStatus @default(UPCOMING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model MaintenanceRequest {
  id             String            @id @default(uuid())
  assetId        String
  asset          Asset             @relation(fields: [assetId], references: [id])
  raisedById     String
  raisedBy       User              @relation("RaisedBy", fields: [raisedById], references: [id])
  approvedById   String?
  approvedBy     User?             @relation("ApprovedBy", fields: [approvedById], references: [id])
  technicianName String?
  cost           Float?
  description    String
  status         MaintenanceStatus @default(PENDING)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  message   String
  isRead    Boolean  @default(false)
  type      String?
  createdAt DateTime @default(now())
}

model ActivityLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  module    String
  details   String?
  createdAt DateTime @default(now())
}
```

---

## "Winning Worthy" Features for a Hackathon

To go beyond standard CRUD and impress the judges, build these high-impact, quick-to-implement features:

1. **Instant QR Code Generation & Scanning**:
   - **How it works**: For every asset registered, generate a QR Code containing its deep link (e.g. `/assets/AST-104`).
   - **Frontend Integration**: Display this QR code on the Asset details modal/page using `react-qr-code`. Add a "Scan QR Code" action button on the header/navbar that uses the device camera (using `html5-qrcode` or a simple input file capture mock) to search the system or request allocations instantly.
   - **Impact**: Hackathon judges *love* physical/real-world integrations. Demonstrating a scanning action on a phone is highly memorable.

2. **AI Asset Analytics & Health Predictor (Statistical Engine)**:
   - **How it works**: Instead of setting up a slow/costly LLM API call that might timeout, write a backend logic engine (`utils/ai.js`) that analyzes the database trends:
     - **Anomalies**: Flags employees allocated duplicate laptops.
     - **Retirement Alerts**: Pinpoints assets exceeding their standard lifespans (e.g., Laptops over 3 years old).
     - **Maintenance Forecast**: Flags assets with recurring maintenance requests (e.g., ">3 failures in 6 months -> Recommend retirement").
     - **Idle Waste Reduction**: Flags departments with high counts of unused "Available" assets while other departments have pending allocation requests.
   - **Frontend Integration**: Display these as a beautiful list of cards called "AI Insights Panel" on the admin dashboard with recommendations like: *"Suggest transferring 3 idle laptops from Sales to Engineering."*
   - **Impact**: Adds an automated, intelligent layer that mimics advanced enterprise prediction capabilities without complexity.

3. **Interactive Asset Lifecycle Timeline**:
   - **How it works**: Build a vertical timeline showing every status change of an asset. You query this by combining creation dates, allocations, maintenance, and returns chronologically.
   - **Impact**: Extremely clean visualization of asset custody, proving audit trails and security tracking are bulletproof.

---

## Division of Labor (4 Team Members)

To complete this by 5:00 PM, divide assignments precisely based on roles:

### Backend Team (You & Partner)

* **You (Team Leader)**:
  - Setup core Express.js structure and middlewares (Auth with JWT, role-based protection).
  - Implement complex logic endpoints: Allocation approval, Return workflows, booking overlap collision validation, and AI Analytics calculations.
  - Oversee backend-frontend routing mapping.
* **Partner**:
  - Run database, setup Prisma client and schemas, and write a robust seed script containing dummy departments, categories, assets, and users.
  - Implement CRUD APIs for categories, departments, and employees.
  - Add standard reporting endpoints (CSV export, activity logging tracking).

### Frontend Team (2 Frontend Specialists)

* **Developer A**:
  - Setup React framework, router configuration, layout contexts (Auth, Theme/Dark Mode).
  - Design general layouts: Dynamic Sidebar (changes menu items based on current user role), Navbar, and Profile pages.
  - Implement Auth pages (Login/Signup validation).
* **Developer B**:
  - Code visual pages: Admin Dashboard (integrating Recharts for allocation count & maintenance metrics), Asset Management Page (asset table, detail modals, QR generation).
  - Code operation modules: Booking page (calendar-like grid for slots), Maintenance request forms, and visual Timeline rendering.

---

## Hourly Execution Roadmap (10:00 AM - 5:00 PM)

* **10:00 AM - 11:00 AM | Infrastructure & Seeding**
  - Initialize git, backend folders, and React app.
  - Database schema run, migrations completed.
  - **Goal**: Database running with 20+ seed assets/users, backend starting on port 5000, frontend starting on port 5173.
* **11:00 AM - 12:30 PM | Authentication & Layout System**
  - Backend Auth routes + JWT validation done.
  - Frontend Routing, Sidebar, Dark Mode, and Auth Context active.
  - **Goal**: Users can signup, login, retrieve role permissions, and view a styled dashboard page shell.
* **12:30 PM - 2:00 PM | Assets & Booking Modules**
  - Backend: CRUD endpoints for assets + booking collision validation.
  - Frontend: Asset tables, add/edit asset dialogs, and booking creation calendar grids.
  - **Goal**: Assets can be registered, and shared meeting rooms or projectors booked without conflicts.
* **2:00 PM - 3:30 PM | Allocations & Maintenance Flows**
  - Backend: Handlers for asset allocation requests, transfers, returns, and maintenance cycles.
  - Frontend: Employee profile dashboards to request transfers or submit maintenance issues; Asset Managers see requests.
  - **Goal**: Full lifecycle workflow operating end-to-end.
* **3:30 PM - 4:30 PM | UI Analytics, AI engine & QR Integration**
  - Backend: Export reports to CSV, compile AI insights endpoints.
  - Frontend: Recharts integrations (Asset statuses, department distributions), QR code scanner interface, and AI warnings panel.
  - **Goal**: The "wow factor" assets are operational.
* **4:30 PM - 5:00 PM | Polish, Verification & Demo Prep**
  - Clean up console errors and verify edge-cases.
  - Run through a live presentation run-through (creating a user -> assigning a role -> registering asset -> allocating it -> scan and view -> raise maintenance request).
  - **Goal**: Safe, complete, bug-free presentation ready.

---

## Verification Plan

### Automated Tests
- Since this is a hackathon, run automated compilation test checks:
  ```bash
  # In backend:
  node --check src/server.js
  npx prisma db validate
  # In frontend:
  npm run build
  ```

### Manual Verification
- Execute the presentation flow:
  1. Signup `employee@test.com` (starts as employee role).
  2. Open database or login as Admin to promote `employee@test.com` to `ASSET_MANAGER`.
  3. Log back in as `employee@test.com` -> Asset Manager panel appears.
  4. Create a new Asset (e.g. MacBook Pro). QR code updates.
  5. Allocate that Asset to another user. Check that status moves to `ALLOCATED`.
  6. Attempt to allocate the same Asset to a second user -> verify it blocks the duplicate allocation.
  7. Raise a maintenance request for the asset -> verify status changes automatically to `UNDER_MAINTENANCE`.
  8. Click Resolve maintenance -> verify status returns to `AVAILABLE`.
  9. Export CSV report and verify fields are correct.
