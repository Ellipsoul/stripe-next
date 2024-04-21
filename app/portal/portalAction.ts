"use server";

import { stripe } from "@/utils/stripe";

// Server action which creates a Stripe portal session
export async function createPortalSession(customerId: string) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `http://localhost:3000`, // TODO: Change this when deploying
  });

  return { id: portalSession.id, url: portalSession.url };
}
