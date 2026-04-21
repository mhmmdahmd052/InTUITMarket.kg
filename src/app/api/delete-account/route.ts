import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendDeleteAccountEmail } from "@/lib/email";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.email;
    const userId = user.id;

    // Use admin client to delete the user
    const supabaseAdmin = getSupabaseAdmin();
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("[DELETE_ACCOUNT] Failed to delete user from Supabase Auth:", deleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // Attempt to send confirmation email
    if (email) {
      try {
        await sendDeleteAccountEmail(email);
      } catch (emailErr) {
        console.error("[DELETE_ACCOUNT] Failed to send deletion email:", emailErr);
        // We continue anyway since the account is already deleted
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE_ACCOUNT] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
