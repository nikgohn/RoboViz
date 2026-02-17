
"use client";

import { useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { RobotVisualizer } from "@/components/robot-visualizer";
import { Logo } from "@/components/icons";
import { useDHParams } from "@/context/dh-params-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import type { DHParams } from "@/types";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeaderActions } from "@/components/header-actions";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { solveIK } from "@/lib/ik";
import type { WorkspaceLimits } from '@/context/dh-params-context';

function ForwardKinematicsController({ param, index, onUpdate }: { param: Omit<DHParams, "id">, index: number, onUpdate: (field: keyof Omit<DHParams, "id">, value: number) => void }) {
    const { t } = useLanguage();
    const { workspaceLimits, getQIndexForParam } = useDHParams();

    if (param.dIsVariable) {
        const qIndex = getQIndexForParam(index, 'd');
        const limits = qIndex && workspaceLimits[qIndex] ? workspaceLimits[qIndex] : { min: -5, max: 5 };
        return (
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label htmlFor={`d-${index}`}>d{index+1} ({t('offset')})</Label>
                    <span className="text-sm text-muted-foreground font-mono">{param.d.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        id={`d-${index}`}
                        min={limits.min}
                        max={limits.max}
                        step={0.1}
                        value={[param.d]}
                        onValueChange={([val]) => onUpdate('d', val)}
                        className="flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onUpdate('d', 0)}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }
    if (!param.thetaIsFixed) {
        const qIndex = getQIndexForParam(index, 'theta');
        const limits = qIndex && workspaceLimits[qIndex] ? workspaceLimits[qIndex] : { min: -180, max: 180 };
        return (
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <Label htmlFor={`theta-${index}`}>θ{index+1} ({t('rotation')})</Label>
                    <span className="text-sm text-muted-foreground font-mono">{param.theta.toFixed(0)}°</span>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        id={`theta-${index}`}
                        min={limits.min}
                        max={limits.max}
                        step={1}
                        value={[param.theta]}
                        onValueChange={([val]) => onUpdate('theta', val)}
                        className="flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onUpdate('theta', 0)}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }
    return null;
}

export default function KinematicsPage() {
  const { params, setParams, baseOrientation, workspaceLimits, setWorkspaceLimits, getQIndexForParam } = useDHParams();
  const [activeTab, setActiveTab] = useState('forward');
  const [showAxes, setShowAxes] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [endEffectorPosition, setEndEffectorPosition] = useState<THREE.Vector3 | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  // === State for IK ===
  const [targetPosition, setTargetPosition] = useState({ x: 1, y: 1, z: 1 });
  const [tolerance, setTolerance] = useState(0.01);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // === Logic for Forward Kinematics ===
  const updateParam = (index: number, field: keyof Omit<DHParams, "id">, value: number) => {
    setParams(prevParams => {
        const newParams = [...prevParams];
        newParams[index] = { ...newParams[index], [field]: value };
        return newParams;
    });
  };
  const variableParamsFK = params.filter(p => p.dIsVariable || !p.thetaIsFixed);

  // === Logic for Workspace ===
   const variableParamsWorkspace = useMemo(() => {
    let qIndexCounter = 1;
    const vars: any[] = [];
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
  
  const resetLimits = () => {
    const newLimits: WorkspaceLimits = {};
    variableParamsWorkspace.forEach(v => {
        if(v.type === 'theta') {
          newLimits[v.qIndex] = { min: -180, max: 180 };
        } else {
          newLimits[v.qIndex] = { min: -5, max: 5 };
        }
    });
    setWorkspaceLimits(newLimits);
  }

  useEffect(() => {
    const newLimits = { ...workspaceLimits };
    let hasChanged = false;
    variableParamsWorkspace.forEach(v => {
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
  }, [variableParamsWorkspace, workspaceLimits, setWorkspaceLimits]);


  const handleLimitChange = (qIndex: number, type: 'min' | 'max', value: string) => {
    setWorkspaceLimits(prev => ({
      ...prev,
      [qIndex]: {
        ...prev[qIndex],
        [type]: parseFloat(value) || 0
      }
    }));
  };

  // === Logic for IK ===
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    setTargetPosition(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
  };

  const handleCalculateIK = async () => {
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
        <nav className="flex items-center space-x-4 ml-auto">
            <Tabs defaultValue="kinematics">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                    <TabsTrigger value="analysis" asChild><Link href="/analysis">{t('analysis')}</Link></TabsTrigger>
                    <TabsTrigger value="matlab" asChild><Link href="/matlab-code">{t('matlabCode')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r bg-card">
             <div className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline">{t('kinematics')}</CardTitle>
                            <CardDescription>{t('kinematicsControlDescription')}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 pt-1">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="show-axes" className="text-sm">{t('showAxes')}</Label>
                                <Switch id="show-axes" checked={showAxes} onCheckedChange={setShowAxes} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="show-coords" className="text-sm">{t('showCoordinates')}</Label>
                                <Switch id="show-coords" checked={showCoordinates} onCheckedChange={setShowCoordinates} />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{t('endEffectorPosition')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {endEffectorPosition ? (
                                <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
                                    <div>
                                        <div className="text-muted-foreground">X</div>
                                        <div>{endEffectorPosition.x.toFixed(3)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Y</div>
                                        <div>{endEffectorPosition.y.toFixed(3)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Z</div>
                                        <div>{endEffectorPosition.z.toFixed(3)}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center">-</div>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="forward">{t('forwardKinematics')}</TabsTrigger>
                        <TabsTrigger value="workspace">{t('workspace')}</TabsTrigger>
                        <TabsTrigger value="ik">{t('ik')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="forward" className="flex-1 overflow-auto mt-4 -mx-6 px-6">
                      <ScrollArea className="h-full pr-6">
                       <div className="space-y-8 py-4">
                         {variableParamsFK.map((param, index) => {
                           const originalIndex = params.findIndex(p => p === param);
                           return (
                             <ForwardKinematicsController 
                                key={originalIndex}
                                param={param}
                                index={originalIndex}
                                onUpdate={(field, value) => updateParam(originalIndex, field, value)}
                             />
                           )
                         })}
                         {variableParamsFK.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-10">{t('noVariableParameters')}</p>
                         )}
                       </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="workspace" className="flex-1 overflow-auto mt-4 -mx-6 px-6">
                       <ScrollArea className="h-full pr-6">
                        <div className="flex justify-end mb-4">
                            <Button variant="ghost" size="sm" onClick={resetLimits}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t('reset')}
                            </Button>
                        </div>
                        <div className="space-y-4 pb-6">
                            {variableParamsWorkspace.map((v: any) => (
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
                            {variableParamsWorkspace.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    <p>{t('noVariableParameters')}</p>
                                </div>
                            )}
                        </div>
                       </ScrollArea>
                    </TabsContent>

                     <TabsContent value="ik" className="flex-1 overflow-auto mt-4 -mx-6 px-6">
                       <ScrollArea className="h-full pr-6">
                        <div className="space-y-4 py-4">
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
                                    <CardTitle className="text-base">{t('ikSolverSettings')}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div>
                                        <Label htmlFor="target-tolerance">{t('ikTolerance')}</Label>
                                        <Input id="target-tolerance" type="number" value={tolerance} step={0.01} onChange={e => setTolerance(parseFloat(e.target.value) || 0)} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Button onClick={handleCalculateIK} disabled={isCalculating}>
                                {isCalculating ? t('calculating') : t('calculate')}
                            </Button>
                        </div>
                       </ScrollArea>
                    </TabsContent>
                </Tabs>
             </div>
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={showAxes} showLinkCoordinates={showCoordinates} onPositionUpdate={setEndEffectorPosition} baseOrientation={baseOrientation} ikTarget={activeTab === 'ik' ? new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z) : undefined}/>
        </div>
      </main>
    </div>
  );
}
