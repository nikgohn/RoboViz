
"use client";

import { useState } from "react";
import * as THREE from "three";
import { RobotVisualizer } from "@/components/robot-visualizer";
import { Logo } from "@/components/icons";
import { useDHParams } from "@/context/dh-params-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import type { DHParams } from "@/types";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function KinematicsController({ param, index, onUpdate }: { param: Omit<DHParams, "id">, index: number, onUpdate: (field: keyof Omit<DHParams, "id">, value: number) => void }) {
    if (param.dIsVariable) {
        return (
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label htmlFor={`d-${index}`}>d{index+1} (offset)</Label>
                    <span className="text-sm text-muted-foreground font-mono">{param.d.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        id={`d-${index}`}
                        min={-5}
                        max={5}
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
        return (
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <Label htmlFor={`theta-${index}`}>θ{index+1} (rotation)</Label>
                    <span className="text-sm text-muted-foreground font-mono">{param.theta.toFixed(0)}°</span>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        id={`theta-${index}`}
                        min={-180}
                        max={180}
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
  const { params, setParams } = useDHParams();
  const [showAxes, setShowAxes] = useState(false);
  const [endEffectorPosition, setEndEffectorPosition] = useState<THREE.Vector3 | null>(null);


  const updateParam = (index: number, field: keyof Omit<DHParams, "id">, value: number) => {
    setParams(prevParams => {
        const newParams = [...prevParams];
        newParams[index] = { ...newParams[index], [field]: value };
        return newParams;
    });
  };

  const variableParams = params.filter(p => p.dIsVariable || !p.thetaIsFixed);

  return (
    <div className="flex h-dvh flex-col font-sans">
       <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="flex items-center space-x-4 ml-6">
            <Tabs defaultValue="kinematics">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">Editor</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">Kinematics</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
      </header>
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="flex flex-col border-r bg-card">
             <div className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline">Kinematics Control</CardTitle>
                            <CardDescription>Adjust the variable joints of the robotic arm.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Label htmlFor="show-axes" className="text-sm">Show Axes</Label>
                            <Switch id="show-axes" checked={showAxes} onCheckedChange={setShowAxes} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">End-Effector Position</CardTitle>
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
                <ScrollArea className="flex-1 px-6">
                   <div className="space-y-8 py-4">
                     {variableParams.map((param, index) => {
                       const originalIndex = params.findIndex(p => p === param);
                       return (
                         <KinematicsController 
                            key={originalIndex}
                            param={param}
                            index={originalIndex}
                            onUpdate={(field, value) => updateParam(originalIndex, field, value)}
                         />
                       )
                     })}
                     {variableParams.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-10">No variable parameters defined. Go to the Editor to set `d` as variable or `theta` as not fixed.</p>
                     )}
                   </div>
                </ScrollArea>
             </div>
        </aside>
        <div className="relative flex-1 bg-background overflow-hidden">
          <RobotVisualizer params={params} showAxes={showAxes} onPositionUpdate={setEndEffectorPosition} />
        </div>
      </main>
    </div>
  );
}
