import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, verifyAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["new", "handled"]),
});

/** PATCH — admin only: update an enquiry's status. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body." }, { status: 422 });
  }

  await adminDb().collection("enquiries").doc(id).update({
    status: parsed.data.status,
  });

  return NextResponse.json({ ok: true });
}
