"use client";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import React, { useEffect, useRef, useState } from "react";
import Editor from "@/shared/components/Editor";
import { generateZipWithPDFs, readSheet } from "@/shared/utils/file";
import { processHTML } from "@/shared/utils/html";
import { PersonType } from "@/shared/types/person.type";
import { sheetToPeople } from "@/shared/utils/person";
import { createPortal } from "react-dom";
import { Image as ImageJS } from "image-js";
import { jsPDF } from "jspdf";
import dynamic from "next/dynamic";

// import rasterizeHTML from "rasterizehtml";

const useRasterizeHTML = () => {
  const [rasterizeHTML, setRasterizeHTML] = useState<any>(null);

  useEffect(() => {
    const loadRasterizeHTML = async () => {
      const _module = await import("rasterizehtml");
      setRasterizeHTML(_module);
    };

    loadRasterizeHTML();
  }, []);

  return rasterizeHTML;
};

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
  const rasterizeHTML = useRasterizeHTML();

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

  const imageOnCanvas = async (
    _image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    base64: string
  ) => {
    let image = await ImageJS.load(base64);

    if (image.width > 1920) {
      image = image.resize({ width: 1920 });
    }

    const imageCanvas = image.getCanvas();

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Redimensionar canvas para o tamanho da imagem
        canvas.width = imageCanvas.width;
        canvas.height = imageCanvas.height;
        // Desenhar a imagem no canvas
        ctx.drawImage(imageCanvas, 0, 0);
      }
    }

    return true;
  };

  const textOnCanvas = (
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    base64: string,
    html: string
  ) => {
    return new Promise((resolve) => {
      const fullHtml = `
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: ${canvas.height}px;
          "
        >
          <div style="width: 80%; height: 45%; font-family: Arial, Helvetica, sans-serif;">
            ${html}
          </div>
        </div>
      `;

      imageOnCanvas(image, canvas, base64).then(() => {
        if (typeof window === "undefined") {
          // Se não estiver no cliente, não executar a função
          return resolve(false);
        } else {
          rasterizeHTML.drawHTML(fullHtml, canvas, {}).then(() => {
            resolve(true);
          });
        }
      });
    });
  };

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

  const getPdfs = async (
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
      pdfFiles.push(pdf.output("blob"));
      console.log("ADICIONOU NO ARRAY");
    }

    return pdfFiles;
  };

  const generatePDFs = async () => {
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
                      generatePDFs();
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
