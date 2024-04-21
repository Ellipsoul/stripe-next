import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { supabaseAdmin } from "@/utils/supabaseServer";
import Stripe from "stripe";

// Listen to webhook events from Stripe
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json(
        { statusCode: 400, message: "Webhook Error" },
        { status: 400 }
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session: Stripe.Checkout.Session = event.data.object;
      console.log(session);
      const userId = session.metadata?.user_id;

      // Create or update the stripe_customer_id in the stripe_customers table
      await supabaseAdmin.from("stripe_customers").upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        subscription_id: session.subscription,
        plan_active: true,
        plan_expires: null,
      });
    }

    // Update expires at time when user cancels subscription
    // The subscription remains active until the end of the user's billing period
    if (event.type === "customer.subscription.updated") {
      const subscription: Stripe.Subscription = event.data.object;
      console.log(subscription);
      // Update the plan_expires field in the stripe_customers table
      await supabaseAdmin
        .from("stripe_customers")
        .update({ plan_expires: subscription.cancel_at })
        .eq("subscription_id", subscription.id);
    }

    // Sets the plan active status to false when the user subscription is no longer active
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      console.log(subscription);

      await supabaseAdmin
        .from("stripe_customers")
        .update({ plan_active: false, subscription_id: null })
        .eq("subscription_id", subscription.id);
    }

    return NextResponse.json({ statusCode: 200, message: "success" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
