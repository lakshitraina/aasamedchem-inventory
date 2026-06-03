import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">
        AasaMedChem Inventory System
      </h1>

      <p>
        Inventory, Quotation & Order Management
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Login
        </Link>

        <Link
          href="/admin"
          className="border px-4 py-2 rounded"
        >
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}