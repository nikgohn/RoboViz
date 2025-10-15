
"use client";

import { useState } from "react";
import type { DHParams } from "@/types";
import { DhPanel } from "@/components/dh-panel";
import { RobotVisualizer } from "@/components/robot-visualizer";
import { Logo } from "@/components/icons";
import { useDHParams } from "@/context/dh-params-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";


export default function EditorPage() {
  const { params, setParams } = useDHParams();
  const [showAxes, setShowAxes] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex h-dvh flex-col font-sans">
       <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="flex items-center space-x-4 ml-6">
            <Tabs defaultValue="editor">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </header>
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r bg-card overflow-hidden">
          <DhPanel 
            params={params} 
            setParams={setParams} 
            showAxes={showAxes}
            setShowAxes={setShowAxes}
          />
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={showAxes} />
        </div>
      </main>
    </div>
  );
}
