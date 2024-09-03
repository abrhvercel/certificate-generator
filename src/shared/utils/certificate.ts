import { jsPDF } from "jspdf";
import { PersonType } from "../types/person.type";
import { imageOnCanvas, textOnCanvas } from "./canvas";
import { processHTML } from "./html";

export const getPdfs = async (
  html: string,
  base64: string,
  people: PersonType[],
  multiplier: number
) => {
  const pdfFiles: Blob[] = [];

  console.log(people.length);
  const canvas = document.createElement("canvas");

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const image = new Image();

    console.log("\n\nPESSOA ----> ", person.name);
    await imageOnCanvas(image, canvas, base64);
    console.log("ADICIONOU IMAGEM NO CANVAS");
    await textOnCanvas(
      image,
      canvas,
      base64,
      processHTML(html.replace(/{{NOME}}/g, person.name), multiplier)
    );
    console.log("ADICIONOU TEXTO NO CANVAS");

    const pdf = new jsPDF(
      "landscape",
      "px",
      [canvas.width, canvas.height],
      true
    );

    console.log("CRIOU PDF");
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    console.log("ADICIONOU IMAGEM NO PDF");
    // const pdfBase64 = await blobToBase64(pdf.output("blob"));
    console.log("CONVERTEU PDF PRA BASE64");
    pdfFiles.push(pdf.output('blob'));
    console.log("ADICIONOU NO ARRAY");
  }

  return pdfFiles;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(blob);
  });
}
