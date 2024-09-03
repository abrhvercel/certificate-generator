import { MailerSendResponse } from "@/shared/types/mailerSens.type";
import { PdfType } from "@/shared/types/pdf.type";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    canAccess:
      process.env.NEXT_ACCESS_CODE ===
      req.nextUrl.searchParams.get("accessCode"),
  });
}
