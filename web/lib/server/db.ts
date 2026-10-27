// Server-only: talks to Supabase (Postgres) through its REST API.
// Never import this file from a "use client" component — it uses the secret key.

type InsertResult =
  | { status: "created" }
  | { status: "duplicate_ref" }
  | { status: "duplicate_trx" }
  | { status: "not_configured" }
  | { status: "error"; detail: string };

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

const headers = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
});

/** Is this Transaction ID already used in either table? */
async function trxTaken(table: "registrations" | "orders", payMethod: string, trx: string) {
  const c = config();
  if (!c) return false;
  const q = `${c.url}/rest/v1/${table}?select=ref&pay_method=eq.${encodeURIComponent(payMethod)}&trx_id=eq.${encodeURIComponent(trx)}&limit=1`;
  const res = await fetch(q, { headers: headers(c.key), cache: "no-store" });
  if (!res.ok) throw new Error(`lookup ${table} ${res.status}`);
  const rows = (await res.json()) as { ref: string }[];
  return rows.length > 0 ? rows[0].ref : false;
}

export async function insertRow(
  table: "registrations" | "orders",
  row: { ref: string; pay_method: string; trx_id: string } & Record<string, unknown>,
): Promise<InsertResult> {
  const c = config();
  if (!c) return { status: "not_configured" };
  try {
    // Same Transaction ID in the other table? (inside one table a UNIQUE index guards it)
    const other = table === "registrations" ? "orders" : "registrations";
    if (await trxTaken(other, row.pay_method, row.trx_id)) return { status: "duplicate_trx" };

    const res = await fetch(`${c.url}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers(c.key), Prefer: "return=minimal" },
      body: JSON.stringify(row),
      cache: "no-store",
    });
    if (res.ok) return { status: "created" };
    const body = await res.text();
    if (res.status === 409 || body.includes("23505")) {
      // Unique violation: was it the reference (a retry of the same submission) or the Transaction ID?
      if (body.includes("_ref_key")) return { status: "duplicate_ref" };
      if (body.includes("trx")) {
        const ownerRef = await trxTaken(table, row.pay_method, row.trx_id);
        return ownerRef === row.ref ? { status: "duplicate_ref" } : { status: "duplicate_trx" };
      }
    }
    return { status: "error", detail: `${res.status} ${body.slice(0, 300)}` };
  } catch (err) {
    return { status: "error", detail: String(err) };
  }
}
