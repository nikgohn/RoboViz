"use client";

import { Dispatch, SetStateAction, useId } from "react";
import type { DHParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type DhPanelProps = {
  params: Omit<DHParams, "id">[];
  setParams: Dispatch<SetStateAction<Omit<DHParams, "id">[]>>;
  showAxes: boolean;
  setShowAxes: Dispatch<SetStateAction<boolean>>;
};

function ParamRow({ param, index, onUpdate, onRemove }: { param: Omit<DHParams, "id">, index: number, onUpdate: (field: keyof Omit<DHParams, "id">, value: number | boolean) => void, onRemove: () => void }) {
    const id = useId();
    return (
        <AccordionItem value={id} className="border-b-0 mb-2">
            <Card className="overflow-hidden">
                <div className="flex items-center bg-muted/50 pr-4">
                    <AccordionTrigger className="p-4 hover:no-underline flex-1">
                        <span className="font-medium">Link {index + 1}</span>
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
                                <Label htmlFor={`a-${id}`}>aᵢ (len)</Label>
                                <Input id={`a-${id}`} type="number" value={param.a} onChange={(e) => onUpdate('a', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`alpha-${id}`}>αᵢ (twist)</Label>
                                <Input id={`alpha-${id}`} type="number" value={param.alpha} onChange={(e) => onUpdate('alpha', parseFloat(e.target.value))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`thetaOffset-${id}`}>θᵢ (off)</Label>
                                <Input id={`thetaOffset-${id}`} type="number" value={param.thetaOffset} onChange={(e) => onUpdate('thetaOffset', parseFloat(e.target.value))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor={`d-${id}`}>dᵢ (off)</Label>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`d-is-var-${id}`} className="text-xs text-muted-foreground">Var</Label>
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
                              <Label htmlFor={`theta-${id}`}>θᵢ (rot)</Label>
                              <span className="text-sm text-muted-foreground font-mono">{param.theta.toFixed(0)}°</span>
                            </div>
                            <div className="[--primary:hsl(var(--accent-interactive))]">
                                <Slider
                                    id={`theta-${id}`}
                                    min={-180}
                                    max={180}
                                    step={1}
                                    value={[param.theta]}
                                    onValueChange={([val]) => onUpdate('theta', val)}
                                />
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </Card>
        </AccordionItem>
    )
}

export function DhPanel({ params, setParams, showAxes, setShowAxes }: DhPanelProps) {

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
    };
    setParams(prev => [...prev, newLink]);
  };

  const removeLink = (index: number) => {
    setParams(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">DH Parameters</CardTitle>
                    <CardDescription>Adjust the parameters for each link of the robotic arm.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="show-axes" className="text-sm">Show Axes</Label>
                    <Switch id="show-axes" checked={showAxes} onCheckedChange={setShowAxes} />
                </div>
            </div>
        </CardHeader>
        <ScrollArea className="flex-1 px-6">
            <Accordion type="multiple" defaultValue={params.map((_, i) => `item-${i}`)} className="w-full">
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
        <CardFooter className="p-6 pt-4 border-t">
            <Button onClick={addLink} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Link
            </Button>
        </CardFooter>
    </div>
  );
}
