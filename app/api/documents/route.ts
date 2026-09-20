import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    if (userAuth?.user) {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userAuth.user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ documents: data });
      }
    }

    // Return mock documents if offline/demo
    return NextResponse.json({ documents: MOCK_DOCUMENTS });
  } catch (err: any) {
    return NextResponse.json({ documents: MOCK_DOCUMENTS });
  }
}
