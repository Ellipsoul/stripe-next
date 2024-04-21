import Stripe from "stripe";

// Re-use this Stripe object in other files
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);