# Event Registration & Ticket Management System

A simple, readable, and interview-friendly backend system for managing event registrations and tickets. Built with Node.js, TypeScript, Express.js, MySQL, and Sequelize ORM.

## Architecture

This project follows a clean **Controller -> Service -> Model** architecture.
- **Controllers**: Handle HTTP request parsing, status code selection, and response formatting.
- **Services**: Enforce all domain business rules, transaction logic, database operations, and data aggregations.
- **Models**: Define Sequelize schemas, data types, indexes, and database associations.

## Database Design

### 1. Events Table (with Paranoid Soft Deletion)
- `id` (Primary Key, Auto-increment)
- `eventName` (String, unique composite index with `eventDate`)
- `location` (String)
- `eventDate` (DateOnly)
- `capacity` (Integer)
- `availableSeats` (Integer)
- `ticketPrice` (Decimal)
- `status` (Enum: `ACTIVE`, `INACTIVE`)
- `createdAt` & `updatedAt`
- `deletedAt` (Soft delete timestamp)

### 2. Registrations Table
- `id` (Primary Key, Auto-increment)
- `registrationNumber` (String, unique, format: `REG-YYYYMMDD-XXXX`)
- `eventId` (Foreign Key referencing `events.id`)
- `fullName` (String)
- `email` (String)
- `tickets` (Integer)
- `totalAmount` (Decimal)
- `status` (Enum: `REGISTERED`, `CANCELLED`, `WAITLIST`)
- `createdAt` & `updatedAt`

### 3. Audit Logs Table
- `id` (Primary Key, Auto-increment)
- `registrationId` (Foreign Key referencing `registrations.id` with CASCADE delete)
- `oldStatus` (Enum: `REGISTERED`, `CANCELLED`, `WAITLIST`, null on creation)
- `newStatus` (Enum: `REGISTERED`, `CANCELLED`, `WAITLIST`)
- `changedAt` (Timestamp)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### Installation

1. Clone or extract the project repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file (or copy `.env.example` to `.env`) in the root directory. This project supports both **MySQL** and **SQLite** (perfect if you don't have MySQL installed locally):

```env
PORT=3000
NODE_ENV=development

# Set to 'sqlite' for zero-configuration, or 'mysql' to use a MySQL server
DB_DIALECT=sqlite

# MySQL Configs (only required if DB_DIALECT=mysql)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=event_management
```

*For MySQL, ensure the database specified in `DB_NAME` exists on your server before running migrations. For SQLite, the database file `database.sqlite` will be automatically created in the root folder.*

### Database Initialization

You can run the migrations and seeders to set up and populate the database:

1. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```
2. **Seed Sample Data**:
   ```bash
   npm run db:seed
   ```
3. **Undo Migrations** (if needed):
   ```bash
   npm run db:undo
   ```

*(Alternatively, starting the server in `development` mode automatically runs `sequelize.sync({ alter: true })` to bootstrap the schema immediately)*.

### Run the Application

- **Development Mode** (with hot reload):
  ```bash
  npm run dev
  ```
- **Production Mode** (build and start):
  ```bash
  npm run build
  npm start
  ```

---

## API Endpoints

### 1. Events
- **Create Event**: `POST /events`
  - Validates uniqueness of name on the same date, future date restriction, and default status to `ACTIVE`.
- **List Events**: `GET /events`
  - Supports: searching by `eventName` and `location`, filtering (date, location, status, price range), sorting (name, date, price, createdAt), and pagination.
- **Event Summary**: `GET /events/:id/summary`
  - Calculates `registeredSeats`, `availableSeats`, and `totalRevenue` in real-time.

### 2. Registrations
- **Register For Event**: `POST /registrations`
  - Uses database transactions with locking. If seats are insufficient, creates a registration with `WAITLIST` status.
- **Cancel Registration**: `PATCH /registrations/:id/cancel`
  - Uses transactions. Restores available seats (if status was `REGISTERED`) and logs status transitions.
- **List Registrations**: `GET /registrations`
  - Supports searching (number, name, email), filtering (event, status, date), sorting, and pagination.

### 3. Dashboard
- **Dashboard Stats**: `GET /dashboard`
  - Optimized aggregate metrics containing total events, active events, registrations counts, total revenue, and top 5 events by tickets sold.

---

## API Documentation

Interactive API documentation is generated using Swagger. Start the server and navigate to:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Verification & Testing

### Automated Tests
To execute unit tests covering registration success, capacity validation, waitlisting, and cancellations:
```bash
npm run test
```
*Tests use mock Sequelize transactions and models to ensure fast, compile-free execution on all environments.*

### Manual Verification
- A **Postman Collection** is included in the project root: `Event_Registration_System.postman_collection.json`. Import it into Postman to instantly test all endpoints.
