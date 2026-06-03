"use client";

export default function TestPage() {
    const testLogin = async () => {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "admin@aasamedchem.com",
                password: "admin123",
            }),
        });

        const data = await res.json();

        console.log(data);
        alert(JSON.stringify(data, null, 2));
    };

    return (
        <div className="p-10">
            <button
                onClick={testLogin}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Test Login
            </button>
        </div>
    );
}