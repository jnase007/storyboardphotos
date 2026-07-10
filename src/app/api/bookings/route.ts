import { NextRequest, NextResponse } from "next/server";
import { bookingApiSchema } from "@/lib/validations";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasRealSupabase } from "@/lib/storybook/supabase-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!hasRealSupabase()) {
      console.error("Supabase keys not configured");
      return NextResponse.json(
        {
          error:
            "Booking is temporarily unavailable. Please call (949) 637-2226.",
        },
        { status: 503 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...parsed.data,
        special_requests: parsed.data.special_requests ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json(
        { error: "Failed to save booking. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
