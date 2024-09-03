"use client";

import Button from "@/shared/components/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigate = useRouter();
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_ROOT
        }/api/auth?accessCode=${localStorage.getItem("accessCode")}`
      );
      const data = await response.json();
      setCanAccess(data.canAccess);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 h-screen">
        <span>Carregando</span>
      </div>
    );
  }

  return (
    <div>
      {canAccess ? (
        children
      ) : (
        <div className="flex flex-col justify-center items-center gap-2 h-screen">
          <span>
            Você não tem acesso, volte para o início e insira o código
          </span>
          <Button onClick={() => navigate.replace("/")}>
            Voltar ao início
          </Button>
        </div>
      )}
    </div>
  );
}
