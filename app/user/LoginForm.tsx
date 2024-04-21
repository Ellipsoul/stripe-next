"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  // Signs the user in with a random email and password
  const handleSignUp = async () => {
    setLoading(true);

    const randomEmail = `${Math.random()
      .toString(36)
      .substring(7)}@example.com`;
    const password = "some_key_123";

    // Authenticate to the supabase backend
    const { data, error } = await supabase.auth.signUp({
      email: randomEmail,
      password,
    });

    if (error) {
      console.error(error);
      toast.error("Error creating user, check browser console");
    } else {
      console.log(`User created and logged in with: ${JSON.stringify(data)}`);
      toast.success("Successfully created user!");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleSignUp}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? "Signing up..." : "Sign up with random email and password"}
    </button>
  );
}
