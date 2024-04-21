import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { supabaseAdmin } from "@/utils/supabaseServer";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    // Check if the user is logged in
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) throw "Missing auth token";

    // Retrieve the user using the jwt
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (!user || userError) {
      throw "Supabase auth error";
    }

    // Check the user's active_plan status in the stripe_customers table
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from("stripe_customers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Throw an error if the user is not logged in, or if not subscribed
    if (!customer || !customer.subscription_id || fetchError) {
      throw "Please subscribe to a plan to download the image.";
    }

    // Create a new record in the downloads table
    const { image } = await request.json();
    await supabaseAdmin.from("downloads").insert({ user_id: user.id, image });

    await supabaseAdmin
      .from("stripe_customers")
      .update({ total_downloads: customer.total_downloads + 1 })
      .eq("user_id", user.id);

    // Retrieve the first (and only) subscription item, then increment its usage
    const subscription = await stripe.subscriptions.retrieve(
      customer.subscription_id
    );
    console.log("Subscription", subscription);

    const subscriptionItem = subscription.items.data[0];
    console.log("Subscription Item", subscriptionItem);

    // Create a meter event
    const meterEventCreateParams: Stripe.Billing.MeterEventCreateParams = {
      event_name: "photo_downloaded",
      payload: {
        value: "1",
        stripe_customer_id: customer.stripe_customer_id,
      },
      timestamp: Math.floor(Date.now() / 1000),
    };
    const meterEvent = await stripe.billing.meterEvents.create(
      meterEventCreateParams
    );

    console.log(meterEvent);

    // Return message that usage has been correctly recorded
    return NextResponse.json(
      {
        message: "Usage record created successfully!",
        total_downloads: customer.total_downloads + 1,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
