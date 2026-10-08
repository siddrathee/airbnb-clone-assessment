"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "./types";
import { api } from "./api";

type Auth = {
  user: User | NoneUser;
  users: User[];
  login: (email: string) => Promise<User>;
  logout: () => void;
  refreshUsers: () => Promise<void>;
};

type NoneUser = User | null;

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = useCallback(async () => {
    try {
      setUsers(await api.users());
    } catch {
      /* backend may still be starting */
    }
  }, []);

  useEffect(() => {
    refreshUsers();
    const id = localStorage.getItem("stay_user_id");
    const cached = localStorage.getItem("stay_user");
    if (cached) setUser(JSON.parse(cached));
    if (!id) return;
  }, []);

  const login = async (email: string) => {
    const next = await api.login(email);
    localStorage.setItem("stay_user_id", String(next.id));
    localStorage.setItem("stay_user", JSON.stringify(next));
    setUser(next);
    return next;
  };

  const logout = () => {
    localStorage.removeItem("stay_user_id");
    localStorage.removeItem("stay_user");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, users, login, logout, refreshUsers }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth");
  return ctx;
}
