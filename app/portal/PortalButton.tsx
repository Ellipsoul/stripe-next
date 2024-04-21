"use client";

import { createPortalSession } from "./portalAction";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Redirects the user to a Stripe-hosted portal to manage subscriptions
export default function PortalButton() {
  const router = useRouter();

  const handleClick = async () => {
    try {
      // Retrieve the customer data from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw "Please log in to manage your billing";

      const { data: customer } = await supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();

      // Redirect the user to the portal URL
      const { url } = await createPortalSession(customer?.stripe_customer_id);
      router.push(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create billing portal session:");
    }
  };

  return (
    <>
      <h2>Manage Billing</h2>
      <p>Clicking this button create a new Stripe Billing Portal session</p>
      <button
        className="btn btn-primary btn-outline my-3"
        onClick={handleClick}
      >
        Manage Billing
      </button>
    </>
  );
}
