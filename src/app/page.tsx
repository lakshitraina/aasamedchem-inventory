import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-border relative z-10">
        <div className="flex items-center gap-2">
          <span className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl tracking-wider">
            A
          </span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AasaMedChem
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            id="header-login-btn"
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            id="header-dashboard-btn"
            href="/login"
            className="text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/85 border border-border px-4 py-2 rounded-lg transition-all duration-300"
          >
            Launch System
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center relative z-10 flex flex-col items-center justify-center flex-grow">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 uppercase tracking-wider animate-pulse">
          Active Recruitment Assignment
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-foreground via-slate-100 to-slate-500 bg-clip-text text-transparent leading-none">
          Precision Inventory &<br />
          Order Management
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
          Manage specialized chemical assets, configure high-precision unit conversions (grams, kilograms, liters, milliliters, items), and streamline quotation workflows in one integrated terminal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            id="hero-login-btn"
            href="/login"
            className="w-full sm:w-auto text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-14 flex items-center justify-center rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:-translate-y-0.5"
          >
            Access Portal
          </Link>
          <Link
            id="hero-admin-btn"
            href="/login"
            className="w-full sm:w-auto text-base font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 px-8 h-14 flex items-center justify-center rounded-xl transition-all duration-300"
          >
            Admin Dashboard
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-accent-foreground/10 transition-colors duration-300">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">High-Precision Scaling</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Handles multi-decimal quantities and prices natively to accurately measure valuable pharmaceutical and chemical batches.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-accent-foreground/10 transition-colors duration-300">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Dynamic Conversions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Input orders in kg, g, L, mL, or count. Prices and inventories automatically translate using configured conversion rates.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-accent-foreground/10 transition-colors duration-300">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Role-Based Dashboard</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dedicated interfaces for Admins (products, orders, approvals) and Users/Sellers (catalog, live quotes, cart).
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-6 text-center text-xs text-muted-foreground relative z-10">
        <p>© 2026 AasaMedChem Recruitment System. Powered by Next.js & Neon PostgreSQL.</p>
      </footer>
    </main>
  );
}