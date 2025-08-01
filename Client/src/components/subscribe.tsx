"use client";
import React from 'react';
import { useState } from 'react';

// TODO: Style the input; make it wider and taller, add margin
// TODO: Add responsiveness to the input and button size
export default function Subscribe() {
    const [email, setEmail] = useState("");

    const handleInput = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            return; // prevent empty email 
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/save-email`, { // placeholder API endpoint for Next
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: email}),
        });

        const data = await response.json();

        if (response.ok) { // currently throws an error when the form is sent 
            setEmail("");
        } else {
            console.log("Error sending response", data.error);
        }
    };

    // NOTE: Ignore img warning, Image does not optimize svg 
    return (
        <form onSubmit={handleInput} className="flex flex-row items-center justify-center gap-x-1 w-[300px] md:w-[500px] h-[40px]">
            <input type="email" placeholder="Enter your email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-white placeholder-gray-500 border rounded-full text-black/50 w-full h-full text-lg px-2">
            </input>
            <button type="submit">
                <img src="/Send.svg" className="w-8 h-8 transition-transform duration-150 hover:scale-110" alt="Send email" />
            </button>
        </form>
    );
}