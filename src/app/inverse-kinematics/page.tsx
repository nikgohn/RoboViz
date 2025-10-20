
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { solveIK } from '@/lib/ik';

export default function InverseKinematicsPage() {
  const { params, baseOrientation, setParams, workspaceLimits, getQIndexForParam } = useDHParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [targetPosition, setTargetPosition] = useState({ x: 1, y: 1, z: 1 });
  const [targetOrientation, setTargetOrientation] = useState({ roll: 0, pitch: 0, yaw: 0 });
  const [tolerance, setTolerance] = useState(0.1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    setTargetPosition(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
  };

  const handleOrientationChange = (axis: 'roll' | 'pitch' | 'yaw', value: string) => {
    setTargetOrientation(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
        const target = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
        const solution = await solveIK(params, baseOrientation, target, workspaceLimits, getQIndexForParam, 30, tolerance);
        
        if (solution) {
             setParams(solution);
             toast({
                title: "IK Solution Found",
                description: "The robot parameters have been updated.",
            })
        } else {
            toast({
                variant: "destructive",
                title: "IK Failed",
                description: "Could not find a solution. The target might be unreachable or outside defined limits.",
            })
        }

    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "IK Error",
            description: "An unexpected error occurred during calculation.",
        })
    }
    setIsCalculating(false);
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
        <aside className="flex flex-col border-r bg-card p-6 space-y-6 overflow-y-auto">
             <CardHeader className="p-0">
                <CardTitle className="font-headline">{t('ikSetup')}</CardTitle>
                <CardDescription>{t('ikSetupDescription')}</CardDescription>
            </CardHeader>
            
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">{t('endEffectorPosition')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    {currentPosition ? (
                        <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
                            <div>
                                <div className="text-muted-foreground">X</div>
                                <div>{currentPosition.x.toFixed(3)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Y</div>
                                <div>{currentPosition.y.toFixed(3)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Z</div>
                                <div>{currentPosition.z.toFixed(3)}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center">-</div>
                    )}
                </CardContent>
            </Card>

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
                            <Input id="target-roll" type="number" value={targetOrientation.roll} onChange={e => handleOrientationChange('roll', e.target.value)} disabled />
                        </div>
                        <div>
                            <Label htmlFor="target-pitch">Pitch (°)</Label>
                            <Input id="target-pitch" type="number" value={targetOrientation.pitch} onChange={e => handleOrientationChange('pitch', e.target.value)} disabled />
                        </div>
                        <div>
                            <Label htmlFor="target-yaw">Yaw (°)</Label>
                            <Input id="target-yaw" type="number" value={targetOrientation.yaw} onChange={e => handleOrientationChange('yaw', e.target.value)} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">IK Solver Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                     <div>
                        <Label htmlFor="target-tolerance">Tolerance</Label>
                        <Input id="target-tolerance" type="number" value={tolerance} step={0.01} onChange={e => setTolerance(parseFloat(e.target.value) || 0)} />
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleCalculate} disabled={isCalculating}>
                {isCalculating ? t('calculating') : t('calculate')}
            </Button>
            
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={false} baseOrientation={baseOrientation} ikTarget={new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z)} onPositionUpdate={setCurrentPosition}/>
        </div>
      </main>
    </div>
  );
}
