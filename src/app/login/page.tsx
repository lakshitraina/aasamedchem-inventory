"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);

            if (data.user.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] border p-6 rounded-xl">
                <h1 className="text-2xl font-bold mb-4">
                    Login
                </h1>

                <input
                    className="border w-full p-2 mb-3"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    type="password"
                    className="border w-full p-2 mb-3"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button
                    onClick={login}
                    className="bg-black text-white px-4 py-2 rounded w-full"
                >
                    Login
                </button>
            </div>
        </div>
    );
}