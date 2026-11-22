# WedPlan — Wedding Planning Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout_%26_Webhooks-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-JWT_%26_Roles-FF4081?style=for-the-badge)](https://www.better-auth.com/)

**WedPlan** is a role-based, end-to-end wedding planning marketplace designed to seamlessly connect engaged couples with top-tier wedding professionals. Inspired by modern platforms like *The Knot* and *Zola*, WedPlan enables couples to browse vetted vendor services, filter by category and location, request bespoke bookings, and manage reservations within an elegant planning hub.

Vendors can showcase multi-photo packages, monitor incoming requests, manage date availability, and upgrade to a **Premium Membership** via Stripe Checkout for unlimited listings. Platform administrators maintain quality standards through active user auditing, service moderation, and transaction logs.

---

## 🔗 Live Application & Repositories

| Resource | Link |
| :--- | :--- |
| 🌐 **Live Website** | [https://wedplan-client.vercel.app](https://wedplan-client.vercel.app) |
| 🖥️ **Client Repository** | [https://github.com/christinapenheiro/wedplan-client](https://github.com/christinapenheiro/wedplan-client) |
| ⚙️ **Server Repository** | [https://github.com/christinapenheiro/wedplan-server](https://github.com/christinapenheiro/wedplan-server) |

---

## 📸 Key Features by Role

### 👰 Customer Capabilities
- **Explore & Browse**: Filter active vendor packages by category (Photography, Venues, Floral, Catering, Makeup, Fashion, Music, Planners), search keywords, and filter by city/region.
- **Dynamic Sorting**: Real-time database sorting by price (Low to High, High to Low), creation date (Newest, Oldest), and alphabetical titles.
- **Service Details**: Full gallery photo lightbox, comprehensive package deliverables, transparent pricing, and vendor details.
- **Booking Request Pipeline**: Submit dates, event venues, and custom event notes directly to business owners with automated duplicate submission protection.
- **Customer Dashboard**: Real-time status tracking for all booking requests (`Pending`, `Accepted`, `Rejected`, `Cancelled`) with one-click cancellation on pending requests.

### 🏪 Vendor Capabilities
- **Business Profile Management**: Register with business credentials and manage public store details.
- **Service Catalog Management**: Create, edit, and delete wedding listings with multi-photo uploads powered by ImgBB.
- **Moderation Workflow**: View live status badges (`Pending`, `Approved`, `Declined`) as administrators audit submissions.
- **Booking Order Processing**: Receive structured inquiries with customer contacts and choose to `Accept` or `Reject` in real time.
- **Freemium Tier & Stripe Integration**:
  - *Free Tier*: Publish up to 3 active packages.
  - *Premium Tier*: Upgrade via Stripe Checkout ($99 for 90 days) for unlimited listings, instant activations via verified Stripe webhooks, and a verified badge.

### 🛡️ Admin Capabilities
- **Overview Analytics Console**: Real-time stats cards for Total Registered Users, Total Vendors, Total Customers, Total Services, Pending Services, and Total Stripe Transactions.
- **User Moderation**: Filter user directory by role, search by name/email/business, view accounts, and block/unblock compromised users.
- **Service Auditing & Moderation**: Inspect all submitted vendor packages, approve pending listings into the public directory, reject low-quality packages, or delete inappropriate services.
- **Financial Audit Log**: Monitor Stripe transaction histories with vendor details, Stripe session IDs, amounts, and statuses.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Styling & Components** | [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first theme), [Shadcn UI](https://ui.shadcn.com/) (`base-nova`), [Lucide React](https://lucide.dev/) |
| **Animations** | [Motion](https://motion.dev/) (Framer Motion) for carousels & micro-interactions |
| **Authentication** | [Better Auth](https://www.better-auth.com/) (Email/Password, Google OAuth, JWT cookies, role-based metadata) |
| **Backend API** | [Express.js 5](https://expressjs.com/) (RESTful endpoints, ES Modules) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) via official Node.js Driver |
| **Payments** | [Stripe Checkout](https://stripe.com/) & Cryptographically Verified Webhooks |
| **Media Storage** | [ImgBB REST API](https://api.imgbb.com/) for multi-image uploads |

---

## 🏛️ Database Architecture

WedPlan maintains a normalized MongoDB architecture within the `wedplan` database:

```
wedplan (Database)
├── user (Better Auth Managed + Custom Fields)
│   ├── _id, name, email, image, role, isBlocked
│   └── businessName (Vendor), subscriptionPlan ("free" | "premium"), subscriptionExpiresAt
│
├── services
│   ├── _id, title, category, description, price, location
│   ├── imageUrls: string[]
│   ├── vendorId, vendorEmail, vendorName
│   ├── status: "pending" | "active" | "declined"
│   └── isAvailable: boolean, createdAt, updatedAt
│
├── bookings
│   ├── _id, serviceId, serviceTitle, serviceLocation
│   ├── vendorId, vendorEmail, vendorName
│   ├── customerId, customerName, customerEmail
│   ├── eventDate, eventLocation, additionalMessage
│   ├── bookingStatus: "pending" | "accepted" | "rejected" | "cancelled"
│   └── createdAt, updatedAt
│
└── transaction
    ├── _id, userId, userEmail, plan ("premium"), amount (99)
    ├── currency ("usd"), status ("unpaid" | "paid" | "failed")
    ├── sessionId, paymentIntent, paidAt, subscriptionExpiresAt, createdAt
```

---

## 🔒 Security & Route Protection

1. **Role-Based Server Guards**: All private Express APIs enforce `verifyToken`, `verifyUser`, and role checkers (`verifyAdmin`, `verifyVendor`, `verifyCustomer`). The server re-verifies ownership of bookings and services before any mutation occurs.
2. **Next.js Middleware Route Protection**: Segment-level guards redirect unauthenticated traffic from `/dashboard/*` and `/browse-services/:id/*` to `/sign-in`.
3. **Stripe Webhook Idempotency**: Premium subscription activation is triggered strictly upon receipt of signed `checkout.session.completed` events using raw request body validation (`express.raw()`). Frontend redirects are never trusted for payment validation.
4. **Environment Isolation**: No production secrets, tokens, or credentials are hardcoded or tracked in Git (`.env` is excluded in `.gitignore`).

---

## ⚙️ Environment Variables

### 1. Client Environment (`wedplan_client/.env`)
Create a `.env` file in the `wedplan_client` directory:

```env
# Better Auth Configuration
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_32_character_better_auth_secret_here

# MongoDB Database URI (for Better Auth Mongo Adapter)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wedplan?retryWrites=true&w=majority

# Google OAuth Credentials (Optional)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# ImgBB API Key for Client-Side Avatar & Service Image Uploads
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# Cross-Service URLs
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
```

### 2. Server Environment (`wedplan_server/.env`)
Create a `.env` file in the `wedplan_server` directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wedplan?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000

# Stripe Secret & Webhook Keys (Test Mode)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/) account or local MongoDB instance
- [Stripe Account](https://stripe.com/) in Test Mode
- [ImgBB API Key](https://api.imgbb.com/)

### 1. Clone Repositories
```bash
git clone https://github.com/christinapenheiro/wedplan-client
git clone https://github.com/christinapenheiro/wedplan-server
```

### 2. Configure & Run Backend Server
```bash
cd wedplan-server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env # or create .env with variables listed above

# Run development server
npm run dev
# Server will start on http://localhost:8000
```

### 3. Configure & Run Frontend Client
```bash
cd ../wedplan-client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env # or create .env with variables listed above

# Run Next.js Turbopack development server
npm run dev
# Application will run on http://localhost:3000
```

---

## 📜 Available Scripts

### Client (`wedplan_client`)
- `npm run dev`: Runs Next.js with Turbopack on `http://localhost:3000`
- `npm run build`: Builds the production bundle with React Compiler
- `npm run start`: Runs the compiled production server
- `npm run lint`: Executes ESLint checks across all TypeScript files

### Server (`wedplan_server`)
- `npm run dev`: Starts the Node.js server with native hot reload (`node --watch index.js`)
- `npm start`: Starts production server (`node index.js`) on Port 8000

---

## 🤝 Acknowledgments & Credits
- [Next.js](https://nextjs.org) & [Vercel](https://vercel.com)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- UI inspiration from [The Knot](https://www.theknot.com/) and [Zola](https://www.zola.com/)

---

## License

Distributed under the MIT License. See LICENSE for more information.

## Contact

Name: Christina Penheiro – alizacyndi@gmail.com
Project Link: https://github.com/christinapenheiro/wedplan-client
Live Link: https://wedplan-client-three.vercel.app
