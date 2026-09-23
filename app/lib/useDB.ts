"use client";

import { useEffect, useState } from "react";
import { DB } from "./types";

const DB_KEY = "bahikhata_data_v1";

function loadDB(): DB {
  if (typeof window === "undefined") return { customers: [] };
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt data, start fresh
  }
  return { customers: [] };
}

export function useDB() {
  const [db, setDB] = useState<DB>({ customers: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = loadDB();
    queueMicrotask(() => {
      setDB(initial);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      // storage full or unavailable; fail silently
    }
  }, [db, ready]);

  return { db, setDB, ready };
}
