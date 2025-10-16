
"use client";

import { Dispatch, SetStateAction, useId } from "react";
import type { DHParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/language-context";
import { useDHParams } from "@/context/dh-params-context";

type DhPanelProps = {
  params: Omit<DHParams, "id">[];
  setParams: Dispatch<SetStateAction<Omit<DHParams, "id">[]>>;
  showAxes: boolean;
  setShowAxes: Dispatch<SetStateAction<boolean>>;
};

function ParamRow({ param, index, onUpdate, onRemove }: { param: Omit<DHParams, "id">, index: number, onUpdate: (field: keyof Omit<DHParams, "id">, value: number | boolean) => void, onRemove: () => void }) {
    const id = useId();
    const { t } = useLanguage();
    return (
        <AccordionItem value={id} className="border-b-0 mb-2">
            <Card className="overflow-hidden">
                <div className="flex items-center bg-muted/50 pr-4">
                    <AccordionTrigger className="p-4 hover:no-underline flex-1">
                        <span className="font-medium">{t('link')} {index + 1}</span>
                    </AccordionTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <AccordionContent className="p-4 pt-2">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`a-${id}`}>{t('linkLength')}</Label>
                                <Input id={`a-${id}`} type="number" value={param.a} onChange={(e) => onUpdate('a', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`alpha-${id}`}>{t('linkTwist')}</Label>
                                <Input id={`alpha-${id}`} type="number" value={param.alpha} onChange={(e) => onUpdate('alpha', parseFloat(e.target.value))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`thetaOffset-${id}`}>{t('thetaOffset')}</Label>
                                <Input id={`thetaOffset-${id}`} type="number" value={param.thetaOffset} onChange={(e) => onUpdate('thetaOffset', parseFloat(e.target.value))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor={`d-${id}`}>{t('linkOffset')}</Label>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`d-is-var-${id}`} className="text-xs text-muted-foreground">{t('variable')}</Label>
                                    <Switch id={`d-is-var-${id}`} checked={param.dIsVariable} onCheckedChange={(checked) => onUpdate('dIsVariable', checked)} />
                                </div>
                            </div>
                            {param.dIsVariable ? (
                                <>
                                <span className="text-sm text-muted-foreground font-mono">{param.d.toFixed(2)}</span>
                                <Slider
                                    id={`d-${id}`}
                                    min={-5}
                                    max={5}
                                    step={0.1}
                                    value={[param.d]}
                                    onValueChange={([val]) => onUpdate('d', val)}
                                />
                                </>
                            ) : (
                                <Input id={`d-${id}`} type="number" value={param.d} onChange={(e) => onUpdate('d', parseFloat(e.target.value))} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`theta-${id}`}>{t('jointAngle')}</Label>
                              <div className="flex items-center gap-2">
                                    <Label htmlFor={`theta-is-fixed-${id}`} className="text-xs text-muted-foreground">{t('fixed')}</Label>
                                    <Switch id={`theta-is-fixed-${id}`} checked={param.thetaIsFixed} onCheckedChange={(checked) => onUpdate('thetaIsFixed', checked)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 [--primary:hsl(var(--accent-interactive))]">
                                    <Slider
                                        id={`theta-${id}`}
                                        min={-180}
                                        max={180}
                                        step={1}
                                        value={[param.theta]}
                                        onValueChange={([val]) => onUpdate('theta', val)}
                                        disabled={param.thetaIsFixed}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground font-mono w-10 text-right">{param.theta.toFixed(0)}°</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onUpdate('theta', 0)} disabled={param.thetaIsFixed}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </Card>
        </AccordionItem>
    )
}

export function DhPanel({ params, setParams, showAxes, setShowAxes }: DhPanelProps) {
  const { t } = useLanguage();
  const { baseOrientation, setBaseOrientation } = useDHParams();
  
  const updateParam = (index: number, field: keyof Omit<DHParams, "id">, value: number | boolean) => {
    setParams(prevParams => {
        const newParams = [...prevParams];
        newParams[index] = { ...newParams[index], [field]: value };
        return newParams;
    });
  };

  const addLink = () => {
    const newLink: Omit<DHParams, "id"> = {
      a: 1,
      alpha: 0,
      d: 0,
      dIsVariable: false,
      thetaOffset: 0,
      theta: 0,
      thetaIsFixed: false,
    };
    setParams(prev => [...prev, newLink]);
  };

  const removeLink = (index: number) => {
    setParams(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleOrientationChange = (axis: 'x' | 'y' | 'z', value: string) => {
    setBaseOrientation(prev => ({ ...prev, [axis]: parseFloat(value) || 0 }));
  }
  
  const resetOrientation = () => {
    setBaseOrientation({ x: 0, y: 0, z: 0 });
  }

  return (
    <div className="flex flex-col h-full">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline">{t('dhParameters')}</CardTitle>
                    <CardDescription>{t('dhParametersDescription')}</CardDescription>
                </div>
                 <div className="flex items-center gap-2 pt-1">
                    <Label htmlFor="show-axes" className="text-sm">{t('showAxes')}</Label>
                    <Switch id="show-axes" checked={showAxes} onCheckedChange={setShowAxes} />
                </div>
            </div>
        </CardHeader>
         <CardContent>
            <Card>
                <CardHeader className="p-4">
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{t('baseOrientation')}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={resetOrientation}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t('reset')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="orientation-x">X (°)</Label>
                            <Input id="orientation-x" type="number" value={baseOrientation.x} onChange={(e) => handleOrientationChange('x', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="orientation-y">Y (°)</Label>
                            <Input id="orientation-y" type="number" value={baseOrientation.y} onChange={(e) => handleOrientationChange('y', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="orientation-z">Z (°)</Label>
                            <Input id="orientation-z" type="number" value={baseOrientation.z} onChange={(e) => handleOrientationChange('z', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </CardContent>
        <CardContent className="flex gap-4 pt-0">
             <Button onClick={addLink} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                {t('addLink')}
            </Button>
        </CardContent>
        <Separator />
        <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full px-6 py-4">
                <Accordion type="multiple" defaultValue={params.map((p, i) => i.toString())} className="w-full">
                {params.map((param, index) => (
                    <ParamRow 
                        key={index} 
                        param={param} 
                        index={index} 
                        onUpdate={(field, value) => updateParam(index, field, value)}
                        onRemove={() => removeLink(index)}
                    />
                ))}
                </Accordion>
            </ScrollArea>
        </div>
    </div>
  );
}

    
