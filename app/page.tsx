"use client";
import dynamic from "next/dynamic";

// Firebase requires browser APIs — disable SSR entirely for the whole app shell
const AppShell = dynamic(() => import("@/components/AppShell"), { ssr: false });

export default function Home() {
  return <AppShell />;
}
