"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { User } from "@supabase/supabase-js";
import LoginForm from "./LoginForm";

export default function UserProfile() {
  // Track the supabase User object
  const [user, setUser] = useState<User | null>(null);
  // Track the Stripe customer object
  const [stripeCustomer, setStripeCustomer] = useState<any>(null);

  // Retrieve and update the user and Stripe customer object state
  useEffect(() => {
    // Fetch currently authenticated user from Supabase
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Do not fetch for an unauthenticated user
      if (!user) return;

      // Fetch Stripe customer object
      const { data: stripeCustomerData, error } = await supabase
        .from("stripe_customers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("No stripe customer data found");
      } else {
        setStripeCustomer(stripeCustomerData);
      }
    };

    fetchUser();

    // Listen to changes in the user authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Update the user object if we sign in
        if (event === "SIGNED_IN" && session) setUser(session.user);
        // Remove the user and Stripe Customer object when we sign out
        if (event === "SIGNED_OUT") {
          setUser(null);
          setStripeCustomer(null);
        }
      }
    );

    // Remove the event listener when the component is destroyed
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Simple Supabase sign out logic
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <h2>User Data</h2>
      {user ? (
        <>
          <p>
            Signed in with email: <strong>{user.email}</strong>
          </p>
          <p>
            Supabase User ID: <strong>{user.id}</strong>
          </p>
          <div>
            <button
              className="btn btn-secondary my-3 btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <h2>Stripe Customer Data</h2>
          {stripeCustomer ? (
            <>
              <p>This data lives in the stripe_customers table in Supabase</p>
              <div className="mockup-code">
                <pre>
                  <code>{JSON.stringify(stripeCustomer, null, 2)}</code>
                </pre>
              </div>
            </>
          ) : (
            <div>
              <p className="text-yellow-500">
                Stripe customer data not created yet. Buy a plan!
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <p>No user logged in.</p>
          <LoginForm />
        </>
      )}
    </div>
  );
}
