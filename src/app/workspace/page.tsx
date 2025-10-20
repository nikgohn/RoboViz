
"use client";
import * as THREE from 'three';
import React, { useState, useMemo, useEffect } from 'react';
import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeaderActions } from "@/components/header-actions";
import { RobotVisualizer } from '@/components/robot-visualizer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DHParams } from '@/types';

type VariableParam = {
  qIndex: number;
  linkIndex: number;
  type: 'theta' | 'd';
  min: number;
  max: number;
};

export default function WorkspacePage() {
  const { params, baseOrientation, workspaceLimits, setWorkspaceLimits } = useDHParams();
  const { t } = useLanguage();

  const variableParams = useMemo((): Omit<VariableParam, 'min' | 'max'>[] => {
    let qIndexCounter = 1;
    const vars: Omit<VariableParam, 'min' | 'max'>[] = [];
    params.forEach((param, linkIndex) => {
      if (!param.thetaIsFixed) {
        vars.push({ qIndex: qIndexCounter, linkIndex: linkIndex, type: 'theta' });
        qIndexCounter++;
      }
      if (param.dIsVariable) {
        vars.push({ qIndex: qIndexCounter, linkIndex: linkIndex, type: 'd' });
        qIndexCounter++;
      }
    });
    return vars;
  }, [params]);

  useEffect(() => {
    const newLimits = { ...workspaceLimits };
    let hasChanged = false;
    variableParams.forEach(v => {
      if (!newLimits[v.qIndex]) {
        hasChanged = true;
        if(v.type === 'theta') {
          newLimits[v.qIndex] = { min: -180, max: 180 };
        } else {
          newLimits[v.qIndex] = { min: -5, max: 5 };
        }
      }
    });
    if(hasChanged) {
        setWorkspaceLimits(newLimits);
    }
  }, [variableParams, workspaceLimits, setWorkspaceLimits]);


  const handleLimitChange = (qIndex: number, type: 'min' | 'max', value: string) => {
    setWorkspaceLimits(prev => ({
      ...prev,
      [qIndex]: {
        ...prev[qIndex],
        [type]: parseFloat(value) || 0
      }
    }));
  };

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
                    <TabsTrigger value="ik-solution" asChild><Link href="/ik-solution">{t('ikSolution')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
       <main className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r bg-card overflow-hidden">
            <div className="flex flex-col h-full">
                <CardHeader className="p-6">
                    <CardTitle className="font-headline">{t('workspaceVisualization')}</CardTitle>
                    <CardDescription>{t('workspaceVisualizationDescription')}</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="space-y-4 pb-6 px-6">
                        {variableParams.map((v) => (
                        <Card key={v.qIndex}>
                            <CardHeader className="p-4">
                            <CardTitle className="text-base font-mono">
                                q<sub>{v.qIndex}</sub> ({v.type === 'theta' ? `θ${v.linkIndex + 1}` : `d${v.linkIndex + 1}`})
                            </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <Label htmlFor={`q${v.qIndex}-min`}>Min</Label>
                                <Input
                                    id={`q${v.qIndex}-min`}
                                    type="number"
                                    value={workspaceLimits[v.qIndex]?.min ?? ''}
                                    onChange={(e) => handleLimitChange(v.qIndex, 'min', e.target.value)}
                                />
                                </div>
                                <div>
                                <Label htmlFor={`q${v.qIndex}-max`}>Max</Label>
                                <Input
                                    id={`q${v.qIndex}-max`}
                                    type="number"
                                    value={workspaceLimits[v.qIndex]?.max ?? ''}
                                    onChange={(e) => handleLimitChange(v.qIndex, 'max', e.target.value)}
                                />
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                        ))}
                        {variableParams.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                <p>{t('noVariableParameters')}</p>

                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={false} baseOrientation={baseOrientation} />
        </div>
      </main>
    </div>
  );
}
