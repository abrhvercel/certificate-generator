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

  const data: PdfType[] = await req.json();

  let emailBody: Object[] = [];

  data.forEach((pdf) => {
    // const emailTo = "pedro.phdois@gmail.com";
    const emailTo = pdf.filename.replace(".pdf", "");
    emailBody.push({
      from: {
        email: "MS_RISCe9@gayubas.com",
        name: "MailerSend",
      },
      to: [
        {
          email: emailTo,
          name: emailTo,
        },
      ],
      subject: "CONARH 24 - Certificado de Participação.",
      text: `Olá, segue em anexo seu Certificado!`,
      attachments: [
        {
          filename: `${emailTo}.pdf`,
          content: pdf.base64,
          type: "application/pdf",
        },
      ],
    });
  });

  const response = await fetch(`https://api.mailersend.com/v1/bulk-email`, {
    method: "POST",
    headers: {
      Authorization:
        "Bearer mlsn.68e2b8ba1e1136abc20702627c5bba93bebe676c4d4481b634b304f57b18d716",
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
