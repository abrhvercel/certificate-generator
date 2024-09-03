"use client";

import { useRouter } from "next/navigation";
import React from "react";

const Generator: React.FC = () => {
  const navigator = useRouter();

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center gap-10">
      <h1 className="text-4xl">Gerador de Certificados</h1>
      <div className="flex items-center gap-10">
        <div
          onClick={() => {
            navigator.push("/gerador");
          }}
          className="w-48 h-48 text-xl shadow-[5px_5px_rgba(0,_98,_90,_0.4),_10px_10px_rgba(0,_98,_90,_0.3),_15px_15px_rgba(0,_98,_90,_0.2),_20px_20px_rgba(0,_98,_90,_0.1),_25px_25px_rgba(0,_98,_90,_0.05)] flex justify-center items-center rounded-2xl cursor-pointer hover:scale-105 active:scale-100 transition-all duration-100 bg-[#111]"
        >
          Gerar PDFs
        </div>
        <div
          onClick={() => {
            navigator.push("/enviar-emails");
          }}
          className="w-48 h-48 text-xl shadow-[5px_5px_rgba(0,_98,_90,_0.4),_10px_10px_rgba(0,_98,_90,_0.3),_15px_15px_rgba(0,_98,_90,_0.2),_20px_20px_rgba(0,_98,_90,_0.1),_25px_25px_rgba(0,_98,_90,_0.05)] flex justify-center items-center rounded-2xl cursor-pointer hover:scale-105 active:scale-100 transition-all duration-100 bg-[#111]"
        >
          Enviar emails
        </div>
      </div>
    </div>
  );
};

export default Generator;
