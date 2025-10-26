
"use client";

import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [useComplexSliders, setUseComplexSliders] = useState(false);


  const generatedCode = useMemo(() => {
    const functionName = "launch_robot_gui";
    let code = useComplexSliders ? `function ${functionName}()\n` : "";
    code += "clear; clc;\n\n";
    
    const linkVars: string[] = [];
    
    params.forEach((param, index) => {
        const { a, alpha, dOffset, thetaOffset, dIsVariable, thetaIsFixed } = param;
        const linkVar = `L${index + 1}`;
        linkVars.push(linkVar);
        
        const alphaRad = (alpha * Math.PI / 180).toFixed(4);
        
        let linkParams: string[] = [];

        linkParams.push(`'alpha', ${alphaRad}`);
        linkParams.push(`'a', ${a}`);

        if (dIsVariable) {
            const qIndexD = getQIndexForParam(index, 'd');
            const dLimits = qIndexD && workspaceLimits[qIndexD] 
              ? `[${Math.max(0, workspaceLimits[qIndexD].min)} ${workspaceLimits[qIndexD].max}]` 
              : '[0 5]';
            const thetaRad = (thetaOffset * Math.PI / 180).toFixed(4);
            linkParams.push(`'theta', ${thetaRad}`);
            linkParams.push(`'qlim', ${dLimits}`);
            code += `${linkVar} = Link(${linkParams.join(', ')}); % Prismatic Link ${index + 1}\n`;
        } else if (!thetaIsFixed) {
            const qIndexTheta = getQIndexForParam(index, 'theta');
            const thetaLimits = qIndexTheta && workspaceLimits[qIndexTheta] 
              ? `[${(workspaceLimits[qIndexTheta].min * Math.PI/180).toFixed(4)} ${(workspaceLimits[qIndexTheta].max * Math.PI/180).toFixed(4)}]` 
              : '[-pi pi]';
            
            linkParams.push(`'d', ${dOffset}`);
            
            const offsetRad = (thetaOffset * Math.PI / 180).toFixed(4);
            if (parseFloat(offsetRad) !== 0) {
              linkParams.push(`'offset', ${offsetRad}`);
            }
            linkParams.push(`'qlim', ${thetaLimits}`);
            code += `${linkVar} = Link(${linkParams.join(', ')}); % Revolute Link ${index + 1}\n`;
        } else {
            // Fixed joint
            const offsetRad = (thetaOffset * Math.PI / 180).toFixed(4);
            linkParams.push(`'d', ${dOffset}`);
            linkParams.push(`'offset', ${offsetRad}`);
            linkParams.push(`'qlim', [0 0]`);
            code += `${linkVar} = Link(${linkParams.join(', ')}); % Fixed Link ${index + 1}\n`;
        }
    });
    
    code += `\nrobot = SerialLink([${linkVars.join(' ')}], 'name', 'RoboViz');\n`;
    
    const { x, y, z } = baseOrientation;
    
    const matlabAngleWrapper = (val: number) => baseAnglesInDegrees ? val.toString() : `pi*${(val/180).toFixed(4)}`;

    let baseTransforms = [];
    if (useMatlabBase) {
      baseTransforms.push(`trotx(${matlabAngleWrapper(90)}) * troty(${matlabAngleWrapper(180)})`);
    }

    if (x !== 0) baseTransforms.push(`trotx(${matlabAngleWrapper(x)})`);
    if (y !== 0) baseTransforms.push(`troty(${matlabAngleWrapper(y)})`);
    if (z !== 0) baseTransforms.push(`trotz(${matlabAngleWrapper(z)})`);

    if (baseTransforms.length > 0) {
      code += `robot.base = ${baseTransforms.join(' * ')};\n`;
    }
    
    code += `\nnum_joints = robot.n;\n`
    code += `q_initial = zeros(1, num_joints);\n`;
    code += `robot.plot(q_initial);\n`;

    if (useComplexSliders) {
        code += `\nslider_handles = gobjects(1, num_joints);\n`;
        code += `text_handles = gobjects(1, num_joints);\n\n`;
        code += `for i = 1:num_joints\n`;
        code += `    y_pos = 0.95 - (i * 0.1);\n\n`;
        code += `    uicontrol('Style', 'text', 'Units', 'normalized', ...\n`;
        code += `              'Position', [0.02, y_pos, 0.05, 0.05], ...\n`;
        code += `              'String', sprintf('q%d:', i), ...\n`;
        code += `              'HorizontalAlignment', 'right');\n\n`;
        code += `    slider_handles(i) = uicontrol('Style', 'slider', 'Units', 'normalized', ...\n`;
        code += `                                  'Position', [0.08, y_pos, 0.2, 0.05], ...\n`;
        code += `                                  'Min', robot.qlim(i, 1), ...\n`;
        code += `                                  'Max', robot.qlim(i, 2), ...\n`;
        code += `                                  'Value', q_initial(i), ...\n`;
        code += `                                  'Callback', @update_robot_plot);\n\n`;
        code += `    text_handles(i) = uicontrol('Style', 'text', 'Units', 'normalized', ...\n`;
        code += `                                'Position', [0.29, y_pos, 0.08, 0.05], ...\n`;
        code += `                                'String', sprintf('%.2f', q_initial(i)));\n`;
        code += `end\n\n`;
        code += `function update_robot_plot(~, ~)\n`;
        code += `    q = zeros(1, num_joints);\n`;
        code += `    for j = 1:num_joints\n`;
        code += `        q(j) = get(slider_handles(j), 'Value');\n`;
        code += `    end\n\n`;
        code += `    robot.animate(q);\n\n`;
        code += `    for j = 1:num_joints\n`;
        code += `        set(text_handles(j), 'String', sprintf('%.2f', q(j)));\n`;
        code += `    end\n\n`;
        code += `    drawnow;\n`;
        code += `end\n`;
        code += `end\n`;
    } else {
        code += `robot.teach; % adds interactive part in plot\n`;
    }

    return code;

  }, [params, baseOrientation, workspaceLimits, getQIndexForParam, useMatlabBase, baseAnglesInDegrees, useComplexSliders]);
  

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
                   <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="complex-sliders">{t('matlabComplexSliders')}</Label>
                             <p className="text-xs text-muted-foreground">{t('matlabComplexSlidersDescription')}</p>
                        </div>
                        <Switch id="complex-sliders" checked={useComplexSliders} onCheckedChange={setUseComplexSliders} />
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

    
