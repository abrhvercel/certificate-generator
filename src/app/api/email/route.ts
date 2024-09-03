import { MailerSendResponse } from "@/shared/types/mailerSens.type";
import { PdfType } from "@/shared/types/pdf.type";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // const data = await req.json();
  // const response = await fetch(`https://api.mailersend.com/v1/bulk-email`, {
  //   method: "POST",
  //   headers: {
  //     Authorization:
  //       "Bearer mlsn.68e2b8ba1e1136abc20702627c5bba93bebe676c4d4481b634b304f57b18d716",
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // });

  // return NextResponse.json(await response.json());

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

  const response = await fetch(`https://api.mailersend.com/v1/bulk-email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailBody),
  });
  const responseData: MailerSendResponse = await response.json();

  // const responseData: MailerSendResponse = {
  //   bulk_email_id: new Date().getTime().toString(),
  //   message: "The bulk email is being processed.",
  // };

  try {
    // await sleep(2000);
    return NextResponse.json(responseData);
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro ao enviar o PDF." }), {
      status: 400,
    });
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
