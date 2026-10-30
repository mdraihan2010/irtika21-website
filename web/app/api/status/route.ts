import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!/^IRT-[RS][A-Z0-9]{8}$/.test(ref)) {
    return Response.json({ ok: false, error: "bad_ref" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // IRT-S... হলে শপের অর্ডার, IRT-R... হলে রেজিস্ট্রেশন
  const table = ref.startsWith("IRT-S") ? "orders" : "registrations";

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from(table)
    .select("payment_status")
    .eq("ref", ref)
    .maybeSingle();

  if (!data) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  return Response.json({ ok: true, status: data.payment_status });
}
