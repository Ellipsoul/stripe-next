import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";

// This route won't render a page, but the request can be hit
// from frontend code
export async function POST(request: Request) {
  try {
    // Retrieve fields from POST request
    const { priceId, email, userId } = await request.json();
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      metadata: {
        user_id: userId,
      },
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [{ price: priceId }],
      mode: "subscription",
      success_url: `${request.headers.get("origin")}/success`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
    });
    // Return the checkout session with the URL to redirect to
    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
