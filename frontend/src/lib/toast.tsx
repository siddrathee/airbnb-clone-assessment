"use client";

import { createContext, useContext, useState } from "react";

const Ctx = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const toast = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2800);
  };
  return (
    <Ctx.Provider value={toast}>
      {children}
      {msg ? <div className="toast">{msg}</div> : null}
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
