"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const { users, login, refreshUsers } = useAuth();
  const toast = useToast();

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Welcome to Stay</h2>
        <div className="modal-body">
          <p className="muted">
            Authentication is mocked. Pick a demo guest or host — bookings and listings persist
            in SQLite.
          </p>
          {users.map((u) => (
            <button
              key={u.id}
              className="user-choice"
              onClick={async () => {
                await login(u.email);
                toast(`Signed in as ${u.name}`);
                onClose();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src={u.avatar_url} alt="" />
              <span>
                <strong>{u.name}</strong>
                <div className="muted">
                  {u.email} · {u.is_host ? (u.is_superhost ? "Superhost" : "Host") : "Guest"}
                </div>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
