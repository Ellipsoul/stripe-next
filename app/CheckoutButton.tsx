"use client";

import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/utils/supabaseClient";
import toast from "react-hot-toast";

export default function CheckoutButton() {
  const handleCheckout = async () => {
    const { data } = await supabase.auth.getUser();

    // Check that a user is authenticated with Supabase
    if (!data?.user) {
      toast.error("Please log in to create a Stripe checkout session");
      return;
    }
    // Load in the Stripe object from the frontend
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const stripe = await stripePromise;
    // Make a request to the checkout endpoint
    const requestBody = {
      priceId: "price_1P7wKeLv47BbxKR8dhPvZywz",
      userId: data.user?.id,
      email: data.user?.email,
    };
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Redirect the user to the checkout session URL
    const session = await response.json();
    await stripe?.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div>
      <h1>Sign Up for a Plan</h1>
      <p>Clicking this button creates a new Stripe Checkout session</p>
      <button className="btn btn-accent" onClick={handleCheckout}>
        Buy Now
      </button>
    </div>
  );
}
