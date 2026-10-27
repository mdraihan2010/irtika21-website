import { handleSubmission } from "@/lib/server/submit";
import { parseRegistration } from "@/lib/validation";

export async function POST(request: Request) {
  return handleSubmission(request, "registrations", parseRegistration);
}
