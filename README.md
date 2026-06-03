# AasaMedChem Precision Inventory & Order Management System

Welcome to the **AasaMedChem Inventory & Order Management System**, a high-fidelity Next.js web application built for specialized chemical and pharmaceutical asset tracking. Designed with high-decimal numeric precision, dynamic multi-unit conversions, and robust role-based authentication.

---

## 🌟 Key Features

1. **Role-Based Authentication & Workspaces**:
   - **Admin Console**: Unified control panel for managing products, tracking live inventory asset values, and reviewing/verifying quotations.
   - **Seller/User Workspace**: Interactive product catalog, search filters, dynamic shopping cart, and personal quotation logs.
2. **Dynamic Unit Conversion Engine**:
   - Support for weight (`g`, `kg`), volume (`mL`, `L`), and count (`items`) dimensions.
   - Real-time conversion audit cards on both the frontend cart and admin verification modal.
3. **Atomic Stock Protection**:
   - Order approval automatically validates stock levels in a Prisma transaction, decrementing inventory to prevent over-selling.
4. **Rich & Modern Dark Aesthetics**:
   - Sleek responsive layouts, glowing background effects, card glassmorphism, indicators for low stock, and smooth fade/slide transitions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5.
- **Backend**: Next.js Route Handlers with custom JWT auth middleware.
- **Database & ORM**: PostgreSQL hosted on **Neon**, integrated via **Prisma ORM** (v7.8.0) using the **PrismaPg** driver adapter.
- **Hosting & Deployments**: **Vercel** for serverless edge scaling.

### System Interaction Workflow
```
[Client (Next.js SPA)] ──(HTTPS Requests + JWT)──> [Backend APIs (Next.js Route Handlers)]
         │                                                      │
         ▼                                                      ▼
 (Local Storage Cache)                                 [Prisma ORM + Pg Adapter]
                                                                │
                                                                ▼
                                                       [Neon PostgreSQL Database]
```

---

## 📊 Database Schema & Key Models

We utilize **Double Precision Floats (`double precision` / `Float` in Prisma)** for all quantities, prices, and rates. 

### Why Double Precision (`Float`)?
Double-precision floating-point numbers provide 53 bits of precision (approximately 15–17 decimal digits). This is more than sufficient for high-precision scientific measurements, currency subdivisions, and stock conversions, while allowing native JavaScript numeric operations without the bundle size and performance overhead of string-based decimal parsers.

### Core Tables & Models

#### `User`
- `id` (String, UUID, Primary Key)
- `name` (String)
- `email` (String, Unique Index)
- `password` (String, Bcrypt Hash)
- `role` (Enum: `ADMIN`, `USER`)
- `createdAt` (DateTime)

#### `Product`
- `id` (String, UUID, Primary Key)
- `name` (String)
- `sku` (String, Unique Index)
- `dimension` (Enum: `WEIGHT`, `VOLUME`, `COUNT`)
- `baseUnit` (String, e.g. `g`, `mL`, `items`)
- `category` (String, Optional)
- `description` (String, Optional)
- `stockQuantity` (Float, stored in `baseUnit`)
- `basePrice` (Float, rate per `baseUnit`)
- `createdAt` (DateTime)

#### `Order`
- `id` (String, UUID, Primary Key)
- `userId` (String, Foreign Key -> User)
- `status` (Enum: `PENDING`, `APPROVED`, `REJECTED`, default: `PENDING`)
- `totalAmount` (Float, Total INR value)
- `createdAt` (DateTime)

#### `OrderItem`
- `id` (String, UUID, Primary Key)
- `orderId` (String, Foreign Key -> Order)
- `productId` (String, Foreign Key -> Product)
- `orderedQuantity` (Float, input quantity by user)
- `orderedUnit` (String, e.g. `kg`, `L`)
- `convertedQuantity` (Float, quantity converted to product's `baseUnit`)
- `unitPrice` (Float, price per `orderedUnit`)
- `lineTotal` (Float, calculated item total)

---

## 🧮 Unit Storage & Conversion Strategy

To maintain absolute mathematical consistency:
1. **Base Unit Storage**: All database quantities (`stockQuantity`) and rates (`basePrice`) are stored in base units:
   - **Weight**: Grams (`g`)
   - **Volume**: Milliliters (`mL`)
   - **Count**: Items (`items`)
2. **Formula Calculations**:
   - **Conversion Factors**:
     - `1 kg = 1000 g` (Factor: 1000)
     - `1 L = 1000 mL` (Factor: 1000)
     - `1 items = 1 items` (Factor: 1)
   - **Converting Input Quantity to Database Base**:
     $$\text{convertedQuantity} = \text{orderedQuantity} \times \text{conversionFactor}$$
   - **Computing Target Unit Price**:
     $$\text{unitPriceInTargetUnit} = \text{basePricePerBaseUnit} \times \text{conversionFactor}$$
   - **Computing Line Total**:
     $$\text{lineTotal} = \text{unitPriceInTargetUnit} \times \text{orderedQuantity}$$
3. **Application Layer Logic**:
   - **Frontend Cart**: Dynamically computes and displays the target unit price and base unit conversion on input change.
   - **Backend API**: Re-evaluates all conversions in `POST /api/orders` to ensure users cannot spoof line totals.
   - **Admin Details Panel**: Displays a full conversion audit trail comparing ordered units vs. database stock units.

---

## 🚀 Setup & Local Installation

### Prerequisites
- Node.js 20.19.0 or higher
- Git

### Steps

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/lakshitraina/aasamedchem-inventory.git
   cd aasamedchem-inventory
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@ep-bitter-tooth-apzyzbxz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=verify-full"
   JWT_SECRET="your_jwt_secret_token_here"
   ```

3. **Prisma Generation & Migration**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Seed Database (Demo Accounts)**:
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Credentials & Walkthrough

Use these pre-seeded credentials to explore the system:

| Persona | Email | Password | Allowed Dashboards |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@aasamedchem.com` | `admin123` | `/admin`, `/dashboard` |
| **Seller/User** | `user@aasamedchem.com` | `user123` | `/dashboard` (Access denied to `/admin`) |

### Recommended Test Run

1. **Log in as Admin** (`admin@aasamedchem.com` / `admin123`).
2. Go to **Inventory Management** (`/admin/products/list`).
3. Click **Register Product** and create the following:
   - **Name**: `Paracetamol Powder`
   - **SKU**: `PCM-009`
   - **Category**: `API`
   - **Dimension**: `WEIGHT`
   - **Base Unit**: `g`
   - **Initial Stock**: `100000` (100,000 grams / 100 kg)
   - **Base Price**: `0.05` (₹0.05 per gram, i.e., ₹50.00 per kg)
4. **Log out** and **log in as User** (`user@aasamedchem.com` / `user123`).
5. Go to **New Quotation** (`/dashboard/order`).
6. Locate `Paracetamol Powder` in the catalog, click **Add to Quote**.
7. In the Cart, change the unit to **kg** and quantity to **5**.
   - Notice the live calculations:
     - Unit Price changes to `₹50.00 / kg`
     - Base Unit equivalent changes to `5,000 g`
     - Line Total changes to `₹250.00`
8. Click **Submit Quotation**.
9. **Log out** and **log in back as Admin**.
10. Go to **Quotations & Orders** (`/admin/orders`).
11. Click on the pending quotation you just placed. Verify the conversion equations.
12. Click **Approve & Deduct**.
13. Return to the **Inventory Management** list. You will see that the stock quantity for `Paracetamol Powder` has successfully decremented from `100000` to `95000`.

---

## ☁️ Deployment on Vercel

The application is configured for deployment on Vercel:

1. Push your changes to GitHub.
2. Link your repository in the **Vercel Dashboard**.
3. Add the following Environment Variables in Vercel project settings:
   - `DATABASE_URL` (Your Neon connection pooler URL)
   - `JWT_SECRET` (A secure random string)
4. Deploy! Vercel automatically runs the build and hosts your edge-ready serverless Next.js functions.
