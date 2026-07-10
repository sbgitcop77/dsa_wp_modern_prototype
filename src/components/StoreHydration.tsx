"use client";
import { useEffect } from "react";
import { useAppStore } from "@/data/store/useAppStore";

export default function StoreHydration() {
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);
  return null;
}
