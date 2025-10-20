
"use client";
import * as THREE from 'three';
import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeaderActions } from "@/components/header-actions";
import { RobotVisualizer } from '@/components/robot-visualizer';

export default function WorkspacePage() {
  const { params, baseOrientation } = useDHParams();
  const { t } = useLanguage();

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="ml-auto flex items-center space-x-4">
            <Tabs defaultValue="workspace">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                    <TabsTrigger value="matrices" asChild><Link href="/matrices">{t('matrices')}</Link></TabsTrigger>
                    <TabsTrigger value="analysis" asChild><Link href="/analysis">{t('analysis')}</Link></TabsTrigger>
                    <TabsTrigger value="workspace" asChild><Link href="/workspace">{t('workspace')}</Link></TabsTrigger>
                    <TabsTrigger value="inverse-kinematics" asChild><Link href="/inverse-kinematics">{t('ik')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
       <main className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r bg-card p-6">
             <CardHeader className="p-0">
                <CardTitle className="font-headline">{t('workspaceVisualization')}</CardTitle>
                <CardDescription>{t('workspaceVisualizationDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0 mt-6">
                <div className="text-center text-muted-foreground">
                    <p>Workspace visualization coming soon.</p>
                </div>
            </CardContent>
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={false} baseOrientation={baseOrientation} />
        </div>
      </main>
    </div>
  );
}
