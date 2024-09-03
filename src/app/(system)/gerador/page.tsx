"use client";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import React, { useEffect, useRef, useState } from "react";
import Editor from "@/shared/components/Editor";
import { imageOnCanvas, textOnCanvas } from "@/shared/utils/canvas";
import {
  downloadFile,
  generateZipWithPDFs,
  readSheet,
} from "@/shared/utils/file";
import { processHTML } from "@/shared/utils/html";
import { PersonType } from "@/shared/types/person.type";
import { sheetToPeople } from "@/shared/utils/person";
import { getPdfs } from "@/shared/utils/certificate";
import { createPortal } from "react-dom";

const Generator: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(new Image());
  const imageUpload = useRef<HTMLInputElement>(null);
  const sheetUpload = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [multiplier, setMultiplier] = useState<number>(2.5);
  const [html, setHtml] = useState<string>("");
  const [people, setPeople] = useState<PersonType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSlice, setCurrentSlice] = useState<number>(0);

  // useEffect(() => {
  //   fetch("cert.jpg")
  //     .then((response) => response.blob())
  //     .then((blob) => {
  //       const blobReader = new FileReader();
  //       blobReader.onload = (e) => {
  //         setOriginalImage(e.target?.result as string);
  //       };
  //       blobReader.readAsDataURL(blob);
  //     });
  // }, []);

  useEffect(() => {
    if (originalImage) {
      imageOnCanvas(
        image.current,
        canvas.current as HTMLCanvasElement,
        originalImage
      );
    }
  }, [originalImage]);

  const processCertificates = async (sliceCurrent: number) => {
    const sliceSize = 100;
    const slicePeople = people.slice(sliceCurrent, sliceCurrent + sliceSize);
    const pdfs = await getPdfs(html, originalImage, slicePeople, multiplier);

    let sliceEnd = sliceSize + sliceCurrent;

    if (sliceEnd > people.length) {
      sliceEnd = people.length;
    }

    await generateZipWithPDFs(
      pdfs,
      slicePeople.map((p) => p.email),
      `${sliceCurrent + 1}-${sliceEnd}`
    );

    if (sliceCurrent + sliceSize < people.length) {
      setTimeout(() => {
        setCurrentSlice(sliceCurrent + sliceSize);
        processCertificates(sliceCurrent + sliceSize);
      }, 500);
    } else {
      console.log(new Date());
      alert("DONE");
      setLoading(false);
    }
  };

  const sendCertificates = async () => {
    setCurrentSlice(0);
    setLoading(true);
    setTimeout(() => {
      console.log(new Date());
      processCertificates(0);
    }, 10);
  };

  return (
    <>
      {loading ? (
        createPortal(
          <div className="fixed top-0 left-0 bg-[#000000BB] z-10 w-screen h-screen flex justify-center items-center">
            <div className="bg-[#111] px-7 py-4 rounded flex flex-col items-center">
              <span>GERANDO PDFS</span>
            </div>
          </div>,
          document.body
        )
      ) : (
        <></>
      )}
      <div className="flex w-screen h-screen justify-center items-center">
        <div className="box flex flex-col w-[90vw] h-[90vh] p-4 items-center gap-4">
          {originalImage ? (
            <div className="flex flex-col justify-center items-center w-full h-full gap-4">
              <div className="w-full h-1/2">
                <Editor onChange={(_html) => setHtml(_html)} />
              </div>
              <div className="grid grid-cols-[3fr_1fr] gap-4 w-full h-1/2">
                <div className="h-full">
                  <div className="box rounded-xl w-full grow flex justify-center items-center">
                    <canvas
                      ref={canvas}
                      className="w-auto h-auto max-w-[100%] max-h-[calc(100vh-550px)]"
                      id="canvas"
                    />
                  </div>
                </div>
                <div className="box rounded-xl flex flex-col items-center justify-center h-full gap-4 p-4">
                  {people.length ? (
                    <span>{people.length} pessoas!</span>
                  ) : (
                    <></>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => {
                      sheetUpload.current?.click();
                    }}
                  >
                    Enviar planilha
                  </Button>
                  <input
                    type="file"
                    ref={sheetUpload}
                    accept=".xls,.xlsx"
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files) {
                        const file = event.target.files[0];
                        readSheet(file).then((sheet) => {
                          setPeople(sheetToPeople(sheet));
                        });
                        event.target.value = "";
                      }
                    }}
                  />

                  <Button
                    className="w-full"
                    onClick={() => {
                      textOnCanvas(
                        image.current,
                        canvas.current as HTMLCanvasElement,
                        originalImage,
                        processHTML(html, multiplier)
                      );
                    }}
                  >
                    Inserir texto no certificado
                  </Button>
                  <Input
                    label="Multiplicador"
                    type="number"
                    className="w-full"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Number(e.target.value))}
                  />
                  <Button
                    className="w-full"
                    onClick={() => {
                      sendCertificates();
                    }}
                  >
                    Gerar PDFs
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center w-full h-full gap-4">
              <h1 className="text-2xl">
                Envie uma imagem de modelo para o certificado
              </h1>
              <Button
                onClick={() => {
                  imageUpload.current?.click();
                }}
              >
                Clique aqui para selecionar
              </Button>
              <input
                type="file"
                ref={imageUpload}
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) {
                    const file = event.target.files[0];
                    const reader = new FileReader();

                    reader.onload = (e) => {
                      setOriginalImage(e.target?.result as string);
                    };

                    if (file) {
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Generator;
