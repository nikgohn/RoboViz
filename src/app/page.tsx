"use client";

import { useState } from "react";
import type { DHParams } from "@/types";
import { nanoid } from "nanoid";
import { DhPanel } from "@/components/dh-panel";
import { RobotVisualizer } from "@/components/robot-visualizer";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/icons";

const initialParams: DHParams[] = [
  {
    id: nanoid(),
    a: 0,
    alpha: 90,
    d: 1,
    theta: 0,
  },
  {
    id: nanoid(),
    a: 1.5,
    alpha: 0,
    d: 0,
    theta: 0,
  },
  {
    id: nanoid(),
    a: 1,
    alpha: 0,
    d: 0,
    theta: 0,
  },
];


export default function Home() {
  const [params, setParams] = useState<DHParams[]>(initialParams);

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
