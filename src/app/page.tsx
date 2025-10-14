"use client";

import { useState, useEffect } from "react";
import type { DHParams } from "@/types";
import { DhPanel } from "@/components/dh-panel";
import { RobotVisualizer } from "@/components/robot-visualizer";
import { Logo } from "@/components/icons";

const initialParams: Omit<DHParams, "id">[] = [
  {
    a: 0,
    alpha: 90,
    d: 1,
    thetaOffset: 0,
    theta: 0,
  },
  {
    a: 1.5,
    alpha: 0,
    d: 0,
    thetaOffset: 0,
    theta: 0,
  },
  {
    a: 1,
    alpha: 0,
    d: 0,
    thetaOffset: 0,
    theta: 0,
  },
];

const LOCAL_STORAGE_KEY = 'robot-dh-params';

export default function Home() {
  const [params, setParams] = useState<Omit<DHParams, "id">[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedParams) {
        setParams(JSON.parse(storedParams));
      } else {
        setParams(initialParams);
      }
    } catch (error) {
      console.error("Failed to parse params from localStorage", error);
      setParams(initialParams);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(params));
    }
  }, [params, isLoaded]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
      </header>
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r bg-card">
          <DhPanel params={params} setParams={setParams} />
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} />
        </div>
      </main>
    </div>
  );
}
