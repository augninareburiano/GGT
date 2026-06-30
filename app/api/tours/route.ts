import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, verifyAdmin } from "@/lib/firebase.admin";
import { getTours } from "@/lib/tours.server";

export const runtime = "nodejs";

const addOnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

const tourSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only."),
  name: z.string().min(1),
  base: z.number().nonnegative(),
  min: z.number().int().min(1),
  order: z.number().int().optional(),
  addOns: z.array(addOnSchema).default([]),
});

/** GET — public: list tours (falls back to seed data). */
export async function GET() {
  const tours = await getTours();
  return NextResponse.json({ tours });
}

/** PUT — admin only: upsert a tour by id. */
export async function PUT(req: Request) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const parsed = tourSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid tour." },
      { status: 422 },
    );
  }

  const { id, ...rest } = parsed.data;
  await adminDb().collection("tours").doc(id).set(rest, { merge: true });
  return NextResponse.json({ ok: true, id });
}

/** DELETE — admin only: remove a tour by ?id=. */
export async function DELETE(req: Request) {
  const admin = await verifyAdmin(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  await adminDb().collection("tours").doc(id).delete();
  return NextResponse.json({ ok: true });
}
