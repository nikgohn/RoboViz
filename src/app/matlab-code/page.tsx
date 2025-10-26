
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
import { useMemo } from "react";
import { Copy } from "lucide-react";

export default function MatlabCodePage() {
  const { params, baseOrientation, workspaceLimits, getQIndexForParam } = useDHParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  const generatedCode = useMemo(() => {
    let code = "% MATLAB code for Peter Corke's Robotics Toolbox\n\n";
    code += `L = [];\n\n`;

    params.forEach((param, index) => {
        const { a, alpha, dOffset, thetaOffset, dIsVariable, thetaIsFixed } = param;
        
        const qIndexD = getQIndexForParam(index, 'd');
        const dLimits = qIndexD && workspaceLimits[qIndexD] ? `[${workspaceLimits[qIndexD].min} ${workspaceLimits[qIndexD].max}]` : '[]';

        const qIndexTheta = getQIndexForParam(index, 'theta');
        const thetaLimits = qIndexTheta && workspaceLimits[qIndexTheta] ? `[${(workspaceLimits[qIndexTheta].min * Math.PI/180).toFixed(4)} ${(workspaceLimits[qIndexTheta].max * Math.PI/180).toFixed(4)}]` : '[]';

        const alphaRad = (alpha * Math.PI / 180).toFixed(4);
        const thetaOffsetRad = (thetaOffset * Math.PI / 180).toFixed(4);

        if (dIsVariable) {
            // Prismatic joint
            code += `L = [L, Link('alpha', ${alphaRad}, 'a', ${a}, 'theta', ${thetaOffsetRad}, 'qlim', ${dLimits}, 'P')]; % Link ${index + 1}\n`;
        } else if (!thetaIsFixed) {
            // Revolute joint
            code += `L = [L, Link('alpha', ${alphaRad}, 'a', ${a}, 'd', ${dOffset}, 'offset', ${thetaOffsetRad}, 'qlim', ${thetaLimits}, 'R')]; % Link ${index + 1}\n`;
        } else {
             // Fixed joint
            code += `L = [L, Link('alpha', ${alphaRad}, 'a', ${a}, 'd', ${dOffset}, 'theta', ${thetaOffsetRad}, 'R')]; % Fixed Link ${index + 1}\n`;
        }
    });
    
    code += `\nrobot = SerialLink(L, 'name', 'RoboViz');\n`;
    
    const { x, y, z } = baseOrientation;
    if (x !== 0 || y !== 0 || z !== 0) {
        const xRad = (x * Math.PI/180).toFixed(4);
        const yRad = (y * Math.PI/180).toFixed(4);
        const zRad = (z * Math.PI/180).toFixed(4);
        code += `robot.base = trotx(${xRad}) * troty(${yRad}) * trotz(${zRad});\n`;
    }

    code += `\n% To plot the robot:\n`;
    code += `q = zeros(1, ${params.filter(p => !p.thetaIsFixed || p.dIsVariable).length});\n`;
    code += `robot.plot(q);\n`;

    return code;

  }, [params, baseOrientation, workspaceLimits, getQIndexForParam]);
  

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
