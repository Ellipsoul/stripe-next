import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { supabaseAdmin } from "@/utils/supabaseServer";
import Stripe from "stripe";

// Listen to webhook events from Stripe
export async function POST(request: NextRequest) {
  try {
    // Retrieve the event text and Stripe signature
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    // Validate that the webhook came from stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Handle successful checkout
      if (event.type === "checkout.session.completed") {
        const session: Stripe.Checkout.Session = event.data.object;
        console.log(session);
        // Retrieve the Supabase user_id from the metadata
        const userId = session.metadata?.user_id;

        // Create or update the stripe_customer_id in the stripe_customers table
        const { error } = await supabaseAdmin.from("stripe_customers").upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          subscription_id: session.subscription,
          plan_active: true,
          plan_expires: null,
        });
        if (error) console.error(`Error updating Supabase records: ${error}`);
      }

      // When a customer cancels their subscription, their plan remains active until the
      // end of their billing cycle, and this webhook event is received
      if (event.type === "customer.subscription.updated") {
      }

      if (event.type === "customer.subscription.deleted") {
      }

      return NextResponse.json({ message: "success" });
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ message: "Webhook Error" }, { status: 400 });
    }

    //
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
