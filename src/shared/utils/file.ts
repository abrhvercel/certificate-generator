import * as XLSX from "xlsx";
import { PersonType } from "../types/person.type";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export const downloadFile = (content: string, filename: string) => {
  const a = document.createElement("a");
  a.href = content;
  a.download = filename;
  a.click();
};

export const readSheet = async (
  file: File
): Promise<Array<{ [key: string]: string }>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      resolve(
        XLSX.utils.sheet_to_json(sheet, {
          raw: true,
        })
      );
    };

    reader.readAsBinaryString(file);
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};

export function blobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      // `result` é uma string com prefixo 'data:[<mediatype>];base64,'
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob); // Lê o Blob como uma URL de dados
  });
}

export async function generateZipWithPDFs(
  pdfs: Blob[],
  fileNames: string[],
  zipFileName: string
) {
  const zip = new JSZip();

  // Adiciona cada PDF ao ZIP
  for (let i = 0; i < pdfs.length; i++) {
    const pdfBlob = pdfs[i];
    zip.file(`${fileNames[i]}.pdf`, pdfBlob);
  }

  // Gera o arquivo ZIP e faz o download
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${zipFileName}.zip`);
  });
}
