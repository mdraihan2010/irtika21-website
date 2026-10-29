import { insertRow } from "./db";
import { sendRegistrationEmail } from "@/lib/email";

type Parsed =
  | { ok: false; errors: Record<string, string | undefined> }
  | { ok: true; record: { ref: string; pay_method: string; trx_id: string } & Record<string, unknown> };

/** Shared POST logic for registrations and orders */
export async function handleSubmission(
  request: Request,
  table: "registrations" | "orders",
  parse: (body: unknown) => Parsed,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field; bots often do.
  if ((body as Record<string, unknown>)?.website) {
    return Response.json({ ok: true, ref: "IRT-IGNORED" });
  }

  const parsed = parse(body);
  if (!parsed.ok) {
    return Response.json({ ok: false, error: "invalid", fields: parsed.errors }, { status: 422 });
  }

  const result = await insertRow(table, parsed.record);
  switch (result.status) {
    case "created": {
      // নতুন রেজিস্ট্রেশন সফল: শুধু রেজিস্ট্রেশনে কনফার্মেশন ইমেইল যাবে
      if (table === "registrations") {
        const r = parsed.record as { email?: string; name?: string };
        if (r.email && r.name) {
          const mail = await sendRegistrationEmail(r.email, r.name);
          if (!mail.ok) console.warn(`[${table}] email not sent:`, mail.reason);
        }
      }
      return Response.json({ ok: true, ref: parsed.record.ref });
    }
    case "duplicate_ref": // same submission sent twice (double tap / retry), treat as success
      return Response.json({ ok: true, ref: parsed.record.ref });
    case "duplicate_trx":
      return Response.json({ ok: false, error: "trx_used" }, { status: 409 });
    case "not_configured":
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[${table}] Supabase not configured, submission NOT saved:`, parsed.record);
        return Response.json({ ok: true, ref: parsed.record.ref, demo: true });
      }
      console.error(`[${table}] Supabase environment variables are missing`);
      return Response.json({ ok: false, error: "server" }, { status: 503 });
    default:
      console.error(`[${table}] insert failed:`, result.detail);
      return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
}
