import { MailerSendResponse } from "@/shared/types/mailerSens.type";
import { PdfType } from "@/shared/types/pdf.type";
import { NextResponse, NextRequest } from "next/server";
import fetchToCurl from "fetch-to-curl";

export async function POST(req: NextRequest) {
  try {
    const emailReplyTo = await req.nextUrl.searchParams.get("emailReplyTo");
    const nameReplyTo = await req.nextUrl.searchParams.get("nameReplyTo");
    const subject = await req.nextUrl.searchParams.get("subject");
    const message = await req.nextUrl.searchParams.get("message");

    const data: PdfType[] = await req.json();

    let emailBody: Object[] = [];

    data.forEach((pdf) => {
      // const emailTo = "pedro.phdois@gmail.com";
      const emailTo = pdf.filename.replace(".pdf", "");
      const pdfBody: any = {
        from: {
          email: process.env.MAILERSEND_EMAIL,
          name: process.env.MAILERSEND_NAME,
        },
        to: [
          {
            email: emailTo,
            name: emailTo,
          },
        ],
        subject: subject,
        text: message,
        attachments: [
          {
            filename: `${emailTo}.pdf`,
            content: pdf.base64,
            type: "application/pdf",
          },
        ],
      };

      if (emailReplyTo && nameReplyTo) {
        pdfBody.reply_to = {
          email: emailReplyTo,
          name: nameReplyTo,
        };
      }
      emailBody.push(pdfBody);
    });

    const url = `https://api.mailersend.com/v1/bulk-email`;
    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    };
    const response = await fetch(url, config);
    if (response.status === 202) {
      const responseData: MailerSendResponse = await response.json();
      return NextResponse.json(responseData);
    } else {
      return new Response(JSON.stringify({ message: response.statusText }), {
        status: response.status,
      });
    }
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Erro ao enviar o PDF." }), {
      status: 400,
    });
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
