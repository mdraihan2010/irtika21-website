/**
 * Irtika'21: Supabase → Google Sheet sync
 * Reads new rows from Supabase and appends them to the sheet.
 * The Secret key is read from Script Properties (never stored in code).
 */

const SUPABASE_URL = "https://vtpxrzrgbxyzofhefmwc.supabase.co";
const REG_SHEET = "Registrations";
const ORDER_SHEET = "Orders";

/** Main entry: sync both tables. Trigger this every 10 minutes. */
function syncAll() {
  syncTable_("registrations", REG_SHEET, [
    ["ref", "Reference"],
    ["created_at", "Created at"],
    ["category", "Category"],
    ["amount", "Amount"],
    ["name", "Name"],
    ["department", "Department"],
    ["session", "Session"],
    ["student_id", "Student ID"],
    ["designation", "Designation"],
    ["email", "Gmail"],
    ["whatsapp", "WhatsApp"],
    ["gift_wear", "Gift"],
    ["tshirt_size", "T-shirt size"],
    ["pay_method", "Payment method"],
    ["sender_number", "Sender number"],
    ["trx_id", "Transaction ID"],
    ["payment_status", "Payment status"],
    ["email_status", "Email status"],
    ["admin_note", "Admin note"],
  ]);

  syncTable_("orders", ORDER_SHEET, [
    ["ref", "Reference"],
    ["created_at", "Created at"],
    ["buyer_name", "Buyer name"],
    ["phone", "Phone"],
    ["items", "Items"],
    ["tshirt_size", "T-shirt size"],
    ["total", "Total"],
    ["pay_method", "Payment method"],
    ["sender_number", "Sender number"],
    ["trx_id", "Transaction ID"],
    ["payment_status", "Payment status"],
    ["order_status", "Order status"],
    ["admin_note", "Admin note"],
  ]);
}

/** Fetch rows newer than the last synced row, then append them to the sheet. */
function syncTable_(table, sheetName, columns) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) throw new Error("শিট পাওয়া যায়নি: " + sheetName);

  ensureHeader_(sheet, columns);

  const lastRef = getLastRef_(sheet);
  const rows = fetchRows_(table, lastRef);
  if (!rows.length) return;

  const values = rows.map((row) => columns.map(([key]) => formatCell_(row[key])));
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, columns.length).setValues(values);
}

/** Write the header row once, if the sheet is empty. */
function ensureHeader_(sheet, columns) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns.map(([, label]) => label)]);
    sheet.setFrozenRows(1);
  }
}

/** The reference of the last row already in the sheet, or null. */
function getLastRef_(sheet) {
  if (sheet.getLastRow() < 2) return null;
  return sheet.getRange(sheet.getLastRow(), 1).getValue();
}

/** Query Supabase REST API for rows created after lastRef. */
function fetchRows_(table, lastRef) {
  const key = PropertiesService.getScriptProperties().getProperty("SUPABASE_SECRET");
  if (!key) throw new Error("SUPABASE_SECRET Script Property সেট করা নেই।");

  let url = SUPABASE_URL + "/rest/v1/" + table + "?select=*&order=created_at.asc";
  if (lastRef) {
    const last = fetchOne_(table, "ref", lastRef);
    if (last && last.created_at) {
      url += "&created_at=gt." + encodeURIComponent(last.created_at);
    }
  }

  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { apikey: key, Authorization: "Bearer " + key },
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    throw new Error("Supabase ত্রুটি (" + res.getResponseCode() + "): " + res.getContentText());
  }
  return JSON.parse(res.getContentText());
}

/** Fetch a single row by a column value. */
function fetchOne_(table, column, value) {
  const key = PropertiesService.getScriptProperties().getProperty("SUPABASE_SECRET");
  const url =
    SUPABASE_URL + "/rest/v1/" + table +
    "?select=*&" + column + "=eq." + encodeURIComponent(value) + "&limit=1";
  const res = UrlFetchApp.fetch(url, {
    headers: { apikey: key, Authorization: "Bearer " + key },
    muteHttpExceptions: true,
  });
  const data = JSON.parse(res.getContentText());
  return Array.isArray(data) && data.length ? data[0] : null;
}

/** Make JSON values readable in a sheet. */
function formatCell_(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

/* ---------------- শিট থেকে পেমেন্ট স্ট্যাটাস Supabase-এ পাঠানো ---------------- */

const STATUS_ALLOWED = ["pending", "verified", "rejected"];

/** Main entry: push payment status from the sheet to Supabase. Trigger every 10 minutes. */
function pushStatus() {
  pushSheetStatus_("Registrations", "registrations");
  pushSheetStatus_("Orders", "orders");
}

function pushSheetStatus_(sheetName, table) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("শিট পাওয়া যায়নি: " + sheetName);
    return;
  }
  if (sheet.getLastRow() < 2) {
    Logger.log(sheetName + ": কোনো ডেটা সারি নেই");
    return;
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map((h) => String(h).trim());
  const refCol = headers.indexOf("Reference") + 1;
  const statusCol = headers.indexOf("Payment status") + 1;
  const noteCol = headers.indexOf("Admin note") + 1;
  Logger.log(sheetName + " কলাম: Reference=" + refCol + ", Payment status=" + statusCol + ", Admin note=" + noteCol);

  if (!refCol || !statusCol) {
    throw new Error(sheetName + " শিটে Reference বা Payment status কলাম নেই।");
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  data.forEach((row, i) => {
    const ref = String(row[refCol - 1] || "").trim();
    const status = String(row[statusCol - 1] || "").trim().toLowerCase();
    const note = noteCol ? String(row[noteCol - 1] || "") : "";

    Logger.log("সারি " + (i + 2) + ": ref=[" + ref + "] status=[" + status + "]");

    if (!ref || !STATUS_ALLOWED.includes(status)) return;
    patchRow_(table, ref, status, note);
  });
}

/** Update one row in Supabase, matched by its reference. */
function patchRow_(table, ref, status, note) {
  const key = PropertiesService.getScriptProperties().getProperty("SUPABASE_SECRET");
  if (!key) throw new Error("SUPABASE_SECRET Script Property সেট করা নেই।");

  const url = SUPABASE_URL + "/rest/v1/" + table + "?ref=eq." + encodeURIComponent(ref);
  const payload = { payment_status: status };
  if (note) payload.admin_note = note;

  const res = UrlFetchApp.fetch(url, {
    method: "patch",
    contentType: "application/json",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      Prefer: "return=representation",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = res.getResponseCode();
  const body = res.getContentText();
  Logger.log("PATCH " + table + " ref=" + ref + " → HTTP " + code + " | " + body);
}