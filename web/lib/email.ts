import nodemailer from "nodemailer";

export function registrationEmail(r: { name: string }) {
  return `
<div style="font-family: 'Hind Siliguri', Arial, sans-serif; line-height: 1.8; color: #2a1418; max-width: 600px;">
  <p><b>আসসালামু আলাইকুম ওয়া রহমাতুল্লাহি ওয়া বারাকাতুহু।</b></p>

  <p>প্রিয় ${escapeHtml_(r.name)},</p>

  <p>আলহামদুলিল্লাহ! যশোর বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (JUST) <b>ইসলামিক কালচারাল সোসাইটি</b> কর্তৃক আয়োজিত <i>ইর্তিকা’২১</i>-এ আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।</p>

  <h3>📅 প্রোগ্রামের বিস্তারিত</h3>
  <ul>
    <li><b>তারিখ:</b> ২৩ নভেম্বর ২০২৬, সোমবার</li>
    <li><b>সময়:</b> বাদ আসর থেকে রাত ১০টা পর্যন্ত</li>
    <li><b>স্থান:</b> কেন্দ্রীয় খেলার মাঠ, যবিপ্রবি</li>
  </ul>

  <p>ইনশাআল্লাহ, আপনার উপস্থিতি <i>ইর্তিকা’২১</i>-এর আয়োজনকে আরও প্রাণবন্ত ও সুন্দর করে তুলবে। আমরা আপনার সঙ্গে একটি আনন্দময় ও স্মরণীয় সময় কাটানোর অপেক্ষায় আছি।</p>

  <h3>📞 যোগাযোগ</h3>
  <p><b>ইসলামিক কালচারাল সোসাইটি, JUST</b><br>
  📧 icsocietyjust@gmail.com<br>
  📱 +8801935689238</p>

  <p>জাযাকাল্লাহু খাইরান।</p>

  <p><b>শুভেচ্ছান্তে,</b><br>
  আয়োজক কমিটি<br>
  <i>ইর্তিকা’২১ | ইসলামিক কালচারাল সোসাইটি, JUST</i></p>
</div>`;
}

function escapeHtml_(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendRegistrationEmail(to: string, name: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return { ok: false as const, reason: "no-credentials" };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `ইর্তিকা’২১ <${user}>`,
      to,
      subject: "ইর্তিকা’২১ — রেজিস্ট্রেশন সফলভাবে সম্পন্ন",
      html: registrationEmail({ name }),
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, reason: err instanceof Error ? err.message : "send-failed" };
  }
}
