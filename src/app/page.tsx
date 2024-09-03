"use client";

import Input from "@components/Input";
import Button from "@components/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const navigator = useRouter();
  const [authCode, setAuthCode] = useState<string>("");

  return (
    <div className="flex w-screen h-screen justify-center items-center">
      <div className="box flex flex-col items-center gap-4 p-4 rounded-lg w-72">
        <h1 className="text-xl text-center">Gerador de Certificados</h1>
        <Input
          label="Código de Acesso"
          type="password"
          className="max-w-52"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
        />
        <Button
          onClick={() => {
            localStorage.setItem("accessCode", authCode);
            navigator.push("/sistema");
          }}
        >
          Acessar
        </Button>
      </div>
    </div>
  );
}
