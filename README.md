# MSME Cashflow

A specialized Cashflow Management System designed to help Micro, Small, and Medium Enterprises (MSMEs) streamline their invoicing, track payments, and manage customer follow-ups effectively.

## 🚀 Features

*   **Role-Based Access Control**: Secure access for different team members (Owner, Accounts, Sales).
*   **Customer Management**: Maintain detailed customer profiles including credit terms and contact information.
*   **Invoice Tracking**: Real-time status tracking of invoices (Unpaid, Partially Paid, Paid, Overdue).
*   **Follow-up System**: Log and track payment follow-ups (Calls, generic messages, visits) with next follow-up scheduling.
*   **Dashboard**: Overview of outstanding amounts and cashflow status.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Database**: PostgreSQL
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: NextAuth.js
*   **Styling**: Tailwind CSS
*   **Language**: TypeScript

## 📦 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   PostgreSQL database

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd msme-cashflow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/msme_cashflow?schema=public"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Setup**
    Run the Prisma migrations to create the database tables:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the application**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/`: Reusable UI components.
*   `prisma/`: Database schema and configuration.
*   `lib/`: Utility functions and shared logic.
*   `types/`: TypeScript type definitions.

## 🧠 Logic Flow & Architecture

### 1. Authentication Flow
- **Framework**: `NextAuth.js` with Credentials Provider.
- **Process**: Users log in via `/login`. The system verifies email/password against the `User` table using `bcrypt` for hash comparison.
- **Session**: On success, a JWT session is created containing `userId` and `role`. Protected pages check this session via `getServerSession`.

### 2. Invoice Lifecycle
- **Creation**: Users create invoices linked to a `Customer`. Due dates are auto-calculated based on the customer's `creditTerms`.
- **Status Updates**:
    - **UNPAID**: Default status on creation.
    - **PARTIAL**: When `paidAmount > 0` but `< invoiceAmount`.
    - **PAID**: When `outstandingAmount === 0`.
    - **OVERDUE**: Calculated dynamically if `today > dueDate` and `outstandingAmount > 0`.

### 3. Collection Strategy (Smart Queue)
The `FollowupsQueuePage` (`/followups`) acts as the central hub for collections.
- **Priority**:
    1.  **Overdue Invoices**: Always shown at the top.
    2.  **Scheduled Follow-ups**: Items with a `nextFollowUpOn` date within the next 7 days.
    3.  **High Value**: Ties are broken by the highest outstanding amount.
- **Deduplication**: Only the latest actionable follow-up per invoice is shown.

### 4. Database Schema
- **User**: System users (Owners, Staff).
- **Customer**: Clients with credit terms.
- **Invoice**: Financial records linked to Customers.
- **PaymentEntry**: Records of payments made against invoices.
- **FollowUp**: Logs of interactions (Calls, Visits) regarding an invoice.

## 🧪 Test Users (Seeded)

Run `npx prisma db seed` to populate the database with these users:

| Role | Email | Password |
|------|-------|----------|
| Owner (Admin) | test@email.com | password123 |
| Accounts | accounts@msme.com | password123 |
| Sales | sales@msme.com | password123 |



