
"use client";

import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeaderActions } from "@/components/header-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function MatlabCodePage() {
  const { params, baseOrientation, workspaceLimits, getQIndexForParam } = useDHParams();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [useMatlabBase, setUseMatlabBase] = useState(true);
  const [baseAnglesInDegrees, setBaseAnglesInDegrees] = useState(true);


  const generatedCode = useMemo(() => {
    let code = "clear; clc;\n\n";
    code += "% MATLAB code for Peter Corke's Robotics Toolbox\n\n";
    
    const linkVars: string[] = [];
    const variableJoints = params.filter(p => !p.thetaIsFixed || p.dIsVariable).length;

    params.forEach((param, index) => {
        const { a, alpha, dOffset, thetaOffset, dIsVariable, thetaIsFixed } = param;
        const linkVar = `L${index + 1}`;
        linkVars.push(linkVar);
        
        const alphaRad = (alpha * Math.PI / 180).toFixed(4);
        
        code += `${linkVar} = Link(`;
        
        let linkParams: string[] = [];

        linkParams.push(`'alpha', ${alphaRad}`);
        linkParams.push(`'a', ${a}`);

        if (dIsVariable) {
            // Prismatic joint
            const qIndexD = getQIndexForParam(index, 'd');
            const dLimits = qIndexD && workspaceLimits[qIndexD] 
              ? `[${Math.max(0, workspaceLimits[qIndexD].min)} ${workspaceLimits[qIndexD].max}]` 
              : '[0 5]'; // Default qlim for prismatic
            const thetaRad = (thetaOffset * Math.PI / 180).toFixed(4);
            linkParams.push(`'theta', ${thetaRad}`);
            linkParams.push(`'qlim', ${dLimits}`);
            code += `${linkParams.join(', ')}); % Prismatic Link ${index + 1}, qlim can't be lower than 0\n`;
        } else if (!thetaIsFixed) {
            // Revolute joint
            const qIndexTheta = getQIndexForParam(index, 'theta');
            const thetaLimits = qIndexTheta && workspaceLimits[qIndexTheta] 
              ? `[${(workspaceLimits[qIndexTheta].min * Math.PI/180).toFixed(4)} ${(workspaceLimits[qIndexTheta].max * Math.PI/180).toFixed(4)}]` 
              : '[-pi pi]'; // Default qlim for revolute
            const offsetRad = (thetaOffset * Math.PI / 180).toFixed(4);
            
            linkParams.push(`'d', ${dOffset}`);
            if (parseFloat(offsetRad) !== 0) {
              linkParams.push(`'offset', ${offsetRad}`);
            }
            linkParams.push(`'qlim', ${thetaLimits}`);
            code += `${linkParams.join(', ')}); % Revolute Link ${index + 1}\n`;
        } else {
            // Fixed joint
            const thetaRad = ((param.theta + thetaOffset) * Math.PI / 180).toFixed(4);
            linkParams.push(`'d', ${dOffset}`);
            linkParams.push(`'theta', ${thetaRad}`);
            linkParams.push(`'qlim', [0 0]`);
            code += `${linkParams.join(', ')}); % Fixed Link ${index + 1}\n`;
        }
    });
    
    code += `\nrobot = SerialLink([${linkVars.join(' ')}], 'name', 'RoboViz');\n`;
    
    const { x, y, z } = baseOrientation;
    let baseTransforms = [];
    const angleWrapper = (val: number) => baseAnglesInDegrees ? val.toString() : `${(val * Math.PI / 180).toFixed(4)}`;

    if (useMatlabBase) {
      baseTransforms.push(`trotx(${angleWrapper(90)}) * troty(${angleWrapper(180)})`);
    }

    if (x !== 0) baseTransforms.push(`trotx(${angleWrapper(x)})`);
    if (y !== 0) baseTransforms.push(`troty(${angleWrapper(y)})`);
    if (z !== 0) baseTransforms.push(`trotz(${angleWrapper(z)})`);

    if (baseTransforms.length > 0) {
      code += `robot.base = ${baseTransforms.join(' * ')};\n`;
    }

    code += `\nq = zeros(1, ${variableJoints});\n`;
    code += `robot.plot(q);\n`;
    code += `robot.teach; % adds interactive part in plot\n`;

    return code;

  }, [params, baseOrientation, workspaceLimits, getQIndexForParam, useMatlabBase, baseAnglesInDegrees]);
  

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
        toast({
            title: t('copyToClipboard'),
            description: "The MATLAB code has been copied to your clipboard.",
        });
    });
  };

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="ml-auto flex items-center space-x-4">
            <Tabs defaultValue="matlab">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                    <TabsTrigger value="matrices" asChild><Link href="/matrices">{t('matrices')}</Link></TabsTrigger>
                    <TabsTrigger value="analysis" asChild><Link href="/analysis">{t('analysis')}</Link></TabsTrigger>
                    <TabsTrigger value="workspace" asChild><Link href="/workspace">{t('workspace')}</Link></TabsTrigger>
                    <TabsTrigger value="inverse-kinematics" asChild><Link href="/inverse-kinematics">{t('ik')}</Link></TabsTrigger>
                    <TabsTrigger value="ik-solution" asChild><Link href="/ik-solution">{t('ikSolution')}</Link></TabsTrigger>
                    <TabsTrigger value="matlab" asChild><Link href="/matlab-code">{t('matlabCode')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('matlabCodeGeneration')}</h2>
                <p className="text-muted-foreground">{t('matlabCodeDescription')}</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>{t('matlabCodeSettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="use-matlab-base">{t('matlabUseDefaultBase')}</Label>
                            <p className="text-xs text-muted-foreground">{t('matlabUseDefaultBaseDescription')}</p>
                        </div>
                        <Switch id="use-matlab-base" checked={useMatlabBase} onCheckedChange={setUseMatlabBase} />
                   </div>
                   <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="use-degrees">{t('matlabBaseAnglesInDegrees')}</Label>
                             <p className="text-xs text-muted-foreground">{t('matlabBaseAnglesInDegreesDescription')}</p>
                        </div>
                        <Switch id="use-degrees" checked={baseAnglesInDegrees} onCheckedChange={setBaseAnglesInDegrees} />
                   </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>{t('generatedCode')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Textarea
                            readOnly
                            value={generatedCode}
                            className="h-96 font-mono text-xs bg-muted"
                            aria-label="Generated MATLAB code"
                        />
                         <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={handleCopy}
                        >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">{t('copyToClipboard')}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
