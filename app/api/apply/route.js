import { NextResponse } from "next/server";
import { submitApplication } from "@/lib/sheets";

export async function POST(req) {
  try {
    const body = await req.json();

    // 최소 유효성 검사
    const required = ["campaign_slug", "name", "phone", "address"];
    for (const k of required) {
      if (!body[k] || !String(body[k]).trim()) {
        return NextResponse.json(
          { ok: false, error: `missing field: ${k}` },
          { status: 400 }
        );
      }
    }

    const result = await submitApplication(body);
    if (!result.ok) {
      return NextResponse.json(result, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/apply] error:", e);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 }
    );
  }
}
