"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import Button from "@/shared/components/Button";
import { PdfType } from "@/shared/types/pdf.type";
import { MailerSendResponse } from "@/shared/types/mailerSens.type";
import CountdownTimer from "@/shared/components/ContdownTimer";
import Input from "@/shared/components/Input";

const BULK_INTERVAL_SECONDS = 30;
const BULK_SIZE = 20;

const SenEmails: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetCounterKey, setResetCounterKey] = useState<number>(0);
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [sendingBulk, setSendingBulk] = useState<boolean>(false);
  const [currentBulkIndex, setCurrentBulkIndex] = useState<number>(0);
  const [emailReplyTo, setEmailReplyTo] = useState<string>("");
  const [nameReplyTo, setNameReplyTo] = useState<string>("");
  const [subject, setSubject] = useState<string>(
    "CONARH 24 - Certificado de Participação."
  );
  const [message, setMessage] = useState<string>(
    "Olá, segue em anexo seu Certificado!"
  );

  const handleFileChange = async (event: any) => {
    const files = event.target.files;
    const pdfArray: PdfType[] = [];

    for (let file of files) {
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        try {
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);
          const pdfPromises: Promise<boolean>[] = [];

          // Percorre todos os arquivos no ZIP
          zipContent.forEach((relativePath, file) => {
            if (relativePath.endsWith(".pdf")) {
              const pdfPromise = file.async("blob").then((blob) => {
                return new Promise<boolean>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Data = (reader.result as string).split(",")[1]; // Remove o prefixo `data:application/pdf;base64,`
                    pdfArray.push({
                      filename: relativePath,
                      base64: base64Data,
                    });
                    resolve(true);
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(blob); // Converte o blob em Base64
                });
              });
              pdfPromises.push(pdfPromise);
            }
          });

          // Aguarda todos os PDFs serem extraídos
          await Promise.all(pdfPromises);
        } catch (error) {
          console.error("Erro ao processar o arquivo ZIP:", error);
        }
      } else {
        console.warn(`Arquivo ignorado: ${file.name} (não é um ZIP)`);
      }
    }

    setPdfFiles(pdfArray);
  };

  const sendPdfToBackend = async (
    pdfs: PdfType[],
    statusArray: string[],
    index: number
  ) => {
    try {
      setBulkIds([]);
      setCurrentBulkIndex(index);
      setSendingBulk(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT}/api/email?emailReplyTo=${emailReplyTo}&nameReplyTo=${nameReplyTo}&subject=${subject}&message=${message}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pdfs.slice(index, index + BULK_SIZE)),
        }
      );

      const data: MailerSendResponse = await response.json();
      if (data.bulk_email_id) {
        statusArray.push(data.bulk_email_id);
      } else if (data.message) {
        statusArray.push(data.message);
      }
    } catch (error) {
      statusArray.push(`Erro ao enviar o PDF`);
    } finally {
      if (index + BULK_SIZE < pdfs.length) {
        setSendingBulk(false);
        setCurrentBulkIndex(index + BULK_SIZE);
        setTimeout(() => {
          sendPdfToBackend(pdfs, statusArray, index + BULK_SIZE);
        }, BULK_INTERVAL_SECONDS * 1000);
      } else {
        setCurrentBulkIndex(pdfs.length);
        setTimeout(() => {
          setLoading(false);
          setBulkIds(statusArray);
        }, 2000);
      }
    }
  };

  const sendAllPdfs = async () => {
    setLoading(true);
    sendPdfToBackend(pdfFiles, [], 0);
  };

  return (
    <>
      {loading ? (
        createPortal(
          <div className="fixed top-0 left-0 bg-[#000000BB] z-10 w-screen h-screen flex justify-center items-center">
            <div className="bg-[#111] px-7 py-4 rounded flex flex-col items-center gap-2">
              <span>ENVIANDO EMAILS</span>
              <span>
                Serão enviados {pdfFiles.length} emails em{" "}
                {Math.ceil(pdfFiles.length / BULK_SIZE)} pacotes
              </span>
              <span>{(currentBulkIndex / pdfFiles.length) * 100}%</span>
              <span>Tempo para envio do próximo pacote:</span>
              {sendingBulk ? (
                <span>
                  {currentBulkIndex === pdfFiles.length
                    ? "Finalizado"
                    : "Enviando..."}
                </span>
              ) : (
                <CountdownTimer
                  initialTime={BULK_INTERVAL_SECONDS}
                  key={resetCounterKey}
                  onEnd={() => {}}
                />
              )}
            </div>
          </div>,
          document.body
        )
      ) : (
        <></>
      )}
      <div className="flex w-screen h-screen justify-center items-center">
        <div className="box flex flex-col w-[90vw] h-[90vh] p-4 items-center gap-4">
          <h1>Importar Arquivos ZIP com PDFs</h1>
          <input type="file" multiple onChange={handleFileChange} />
          <h2>PDFs Encontrados: {pdfFiles.length}</h2>
          <Input
            className="max-w-96"
            label={"Email de Resposta"}
            value={emailReplyTo}
            onChange={(e) => setEmailReplyTo(e.target.value)}
          />
          <Input
            className="max-w-96"
            label={"Nome de Resposta"}
            value={nameReplyTo}
            onChange={(e) => setNameReplyTo(e.target.value)}
          />
          <Input
            className="max-w-96"
            label={"Assunto"}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Input
            className="max-w-96"
            label={"Mensagem"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={sendAllPdfs}>Enviar PDFs</Button>
          <ul>
            {bulkIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SenEmails;
