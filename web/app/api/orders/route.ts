import { handleSubmission } from "@/lib/server/submit";
import { parseOrder } from "@/lib/validation";

export async function POST(request: Request) {
  return handleSubmission(request, "orders", parseOrder);
}
