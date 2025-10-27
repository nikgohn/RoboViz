
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
    let code = "";
    
    if (useComplexSliders) {
        code += `function RoboViz()\n\n`;
    }

    code += "clear; clc;\n\n";

    if (params.length === 0) {
        code += "% No links defined.\n";
        if (useComplexSliders) code += "end\n";
        return code;
    }
    
    const linkVars: string[] = [];
    
    params.forEach((param, index) => {
        const { a, alpha, dOffset, thetaOffset, dIsVariable, thetaIsFixed, theta } = param;
        const linkVar = `L${index + 1}`;
        linkVars.push(linkVar);
        
        const alphaRad = (alpha * Math.PI / 180).toFixed(4);
        
        let linkParams: string[] = [];
        

        if (dIsVariable) { // Prismatic
            const qIndexD = getQIndexForParam(index, 'd');
            const dLimits = qIndexD && workspaceLimits[qIndexD] 
              ? `[${Math.max(0, workspaceLimits[qIndexD].min)} ${workspaceLimits[qIndexD].max}]` 
              : '[0 5]';
            const thetaRad = ((theta + thetaOffset) * Math.PI / 180).toFixed(4);
            linkParams.push(`'alpha', ${alphaRad}`);
            linkParams.push(`'a', ${a}`);
            linkParams.push(`'theta', ${thetaRad}`);
            linkParams.push(`'qlim', ${dLimits}`);
        } else if (!thetaIsFixed) { // Revolute
            const qIndexTheta = getQIndexForParam(index, 'theta');
            const thetaLimits = qIndexTheta && workspaceLimits[qIndexTheta] 
              ? `[${(workspaceLimits[qIndexTheta].min * Math.PI/180).toFixed(4)} ${(workspaceLimits[qIndexTheta].max * Math.PI/180).toFixed(4)}]` 
              : '[-pi pi]';
            
            linkParams.push(`'alpha', ${alphaRad}`);
            linkParams.push(`'a', ${a}`);
            linkParams.push(`'d', ${dOffset}`);
            
            const offsetRad = (thetaOffset * Math.PI / 180).toFixed(4);
            if (parseFloat(offsetRad) !== 0) {
              linkParams.push(`'offset', ${offsetRad}`);
            }
            linkParams.push(`'qlim', ${thetaLimits}`);
        } else { // Fixed
            linkParams.push(`'alpha', ${alphaRad}`);
            linkParams.push(`'a', ${a}`);
            linkParams.push(`'d', ${dOffset}`);
            const offsetRad = (thetaOffset * Math.PI / 180).toFixed(4);
            if (parseFloat(offsetRad) !== 0) {
              linkParams.push(`'offset', ${offsetRad}`);
            }
            linkParams.push(`'qlim', [0 0]`);
        }
        code += `${linkVar} = Link(${linkParams.join(', ')});\n`;
    });
    
    code += `\nrobot = SerialLink([${linkVars.join(' ')}], 'name', 'RoboViz', 'scale', 0.1);\n`;
    
    const { x, y, z } = baseOrientation;
    
    const matlabAngleWrapper = (val: number) => baseAnglesInDegrees ? val.toString() : `pi*${(val/180).toFixed(4)}`;

    let baseTransforms = [];
    if (useMatlabBase) {
      const ninety = baseAnglesInDegrees ? '90' : 'pi/2';
      const oneEighty = baseAnglesInDegrees ? '180' : 'pi';
      baseTransforms.push(`trotx(${ninety}) * troty(${oneEighty})`);
    }

    if (x !== 0) baseTransforms.push(`trotx(${matlabAngleWrapper(x)})`);
    if (y !== 0) baseTransforms.push(`troty(${matlabAngleWrapper(y)})`);
    if (z !== 0) baseTransforms.push(`trotz(${matlabAngleWrapper(z)})`);

    if (baseTransforms.length > 0) {
      code += `robot.base = ${baseTransforms.join(' * ')};\n`;
    }
    
    if (useComplexSliders) {
        code += `
q_initial = zeros(1, robot.n);
robot.plot(q_initial);
hold on;

movable_joint_indices = find(robot.qlim(:, 1) ~= robot.qlim(:, 2));
num_movable_joints = length(movable_joint_indices);
q_current = q_initial;

main_panel = uipanel('Title', '${t('matlabRobotControls')}', 'FontSize', 12, ...
                     'BackgroundColor', 'white', ...
                     'Position', [0.02 0.05 0.25 0.9]); 

uicontrol(main_panel, 'Style', 'text', 'String', '${t('endEffectorPosition')}', 'Units', 'normalized', 'Position', [0.1, 0.92, 0.8, 0.05], 'FontSize', 10, 'FontWeight', 'bold');
pose_text_handles.X = uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabPoseX')}', 'Units', 'normalized', 'Position', [0.1, 0.85, 0.8, 0.05], 'HorizontalAlignment', 'left');
pose_text_handles.Y = uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabPoseY')}', 'Units', 'normalized', 'Position', [0.1, 0.80, 0.8, 0.05], 'HorizontalAlignment', 'left');
pose_text_handles.Z = uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabPoseZ')}', 'Units', 'normalized', 'Position', [0.1, 0.75, 0.8, 0.05], 'HorizontalAlignment', 'left');
pose_text_handles.Roll = uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabPoseRoll')}', 'Units', 'normalized', 'Position', [0.1, 0.68, 0.8, 0.05], 'HorizontalAlignment', 'left');
pose_text_handles.Pitch = uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabPosePitch')}', 'Units', 'normalized', 'Position', [0.1, 0.63, 0.8, 0.05], 'HorizontalAlignment', 'left');
pose_text_handles.Yaw = uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabPoseYaw')}', 'Units', 'normalized', 'Position', [0.1, 0.58, 0.8, 0.05], 'HorizontalAlignment', 'left');

uicontrol(main_panel, 'Style', 'text', 'String', '${t('matlabJointControls')}', 'Units', 'normalized', 'Position', [0.1, 0.50, 0.8, 0.05], 'FontSize', 10, 'FontWeight', 'bold');
slider_handles = gobjects(1, num_movable_joints);
text_handles = gobjects(1, num_movable_joints);

for i = 1:num_movable_joints
    joint_index = movable_joint_indices(i);
    
    y_pos = 0.48 - (i * 0.08);

    uicontrol(main_panel, 'Style', 'text', 'String', sprintf('q%d:', i), ...
              'Units', 'normalized', 'Position', [0.05, y_pos, 0.15, 0.05], ...
              'HorizontalAlignment', 'right');
    
    slider_handles(i) = uicontrol(main_panel, 'Style', 'slider', 'Units', 'normalized', 'Position', [0.22, y_pos, 0.5, 0.05], 'Min', robot.qlim(joint_index, 1), 'Max', robot.qlim(joint_index, 2), 'Value', q_initial(joint_index), 'Callback', @update_robot_plot);
    text_handles(i) = uicontrol(main_panel, 'Style', 'text', 'String', sprintf('%.2f', q_initial(joint_index)), 'Units', 'normalized', 'Position', [0.75, y_pos, 0.2, 0.05]);
end

update_pose_display(q_initial); 

    function update_robot_plot(~, ~)
        q_target = q_current;
        
        for j = 1:num_movable_joints
            slider_value = get(slider_handles(j), 'Value');
            joint_index = movable_joint_indices(j);
            q_target(joint_index) = slider_value;
            set(text_handles(j), 'String', sprintf('%.2f', slider_value));
        end
        
        time_vector = [0:0.05:0.5]';
        trajectory = jtraj(q_current, q_target, time_vector);
        
        robot.animate(trajectory);
        
        q_current = q_target;
        update_pose_display(q_current);
        drawnow;
    end

    function update_pose_display(q)
        T = robot.fkine(q);
        pos = T.t; 
        rpy_deg = tr2rpy(T, 'deg');
        
        set(pose_text_handles.X,     'String', sprintf('X:     %7.3f', pos(1)));
        set(pose_text_handles.Y,     'String', sprintf('Y:     %7.3f', pos(2)));
        set(pose_text_handles.Z,     'String', sprintf('Z:     %7.3f', pos(3)));
        set(pose_text_handles.Roll,  'String', sprintf('Roll:  %7.2f°', rpy_deg(1)));
        set(pose_text_handles.Pitch, 'String', sprintf('Pitch: %7.2f°', rpy_deg(2)));
        set(pose_text_handles.Yaw,   'String', sprintf('Yaw:   %7.2f°', rpy_deg(3)));
    end
end
`;
    } else {
        code += `q_initial = zeros(1, robot.n);\n`;
        code += `robot.plot(q_initial);\n`;
        code += `robot.teach; % adds interactive part in plot\n`;
    }

    return code;

  }, [params, baseOrientation, workspaceLimits, getQIndexForParam, useMatlabBase, baseAnglesInDegrees, useComplexSliders, t]);
  

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

    