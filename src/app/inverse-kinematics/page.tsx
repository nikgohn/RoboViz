
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function InverseKinematicsPage() {
  const { params, baseOrientation, setParams } = useDHParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [targetPosition, setTargetPosition] = useState({ x: 1, y: 1, z: 1 });
  const [targetOrientation, setTargetOrientation] = useState({ roll: 0, pitch: 0, yaw: 0 });

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    setTargetPosition(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
  };

  const handleOrientationChange = (axis: 'roll' | 'pitch' | 'yaw', value: string) => {
    setTargetOrientation(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
  };

  const handleCalculate = () => {
    toast({
        title: "Coming Soon",
        description: t('ikNotAvailable'),
    })
  }

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="ml-auto flex items-center space-x-4">
            <Tabs defaultValue="inverse-kinematics">
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
        <aside className="flex flex-col border-r bg-card p-6 space-y-6">
             <CardHeader className="p-0">
                <CardTitle className="font-headline">{t('ikSetup')}</CardTitle>
                <CardDescription>{t('ikSetupDescription')}</CardDescription>
            </CardHeader>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">{t('targetPosition')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="target-x">X</Label>
                            <Input id="target-x" type="number" value={targetPosition.x} onChange={e => handlePositionChange('x', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="target-y">Y</Label>
                            <Input id="target-y" type="number" value={targetPosition.y} onChange={e => handlePositionChange('y', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="target-z">Z</Label>
                            <Input id="target-z" type="number" value={targetPosition.z} onChange={e => handlePositionChange('z', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">{t('targetOrientation')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="target-roll">Roll (°)</Label>
                            <Input id="target-roll" type="number" value={targetOrientation.roll} onChange={e => handleOrientationChange('roll', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="target-pitch">Pitch (°)</Label>
                            <Input id="target-pitch" type="number" value={targetOrientation.pitch} onChange={e => handleOrientationChange('pitch', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="target-yaw">Yaw (°)</Label>
                            <Input id="target-yaw" type="number" value={targetOrientation.yaw} onChange={e => handleOrientationChange('yaw', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleCalculate}>
                {t('calculate')}
            </Button>
            
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={false} baseOrientation={baseOrientation} />
        </div>
      </main>
    </div>
  );
}
