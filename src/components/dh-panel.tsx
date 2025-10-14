"use client";

import { Dispatch, SetStateAction, useId } from "react";
import type { DHParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type DhPanelProps = {
  params: Omit<DHParams, "id">[];
  setParams: Dispatch<SetStateAction<Omit<DHParams, "id">[]>>;
};

function ParamRow({ param, index, onUpdate, onRemove }: { param: Omit<DHParams, "id">, index: number, onUpdate: (field: keyof Omit<DHParams, "id">, value: number) => void, onRemove: () => void }) {
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
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`a-${id}`}>aᵢ (length)</Label>
                                <Input id={`a-${id}`} type="number" value={param.a} onChange={(e) => onUpdate('a', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`alpha-${id}`}>αᵢ (twist)</Label>
                                <Input id={`alpha-${id}`} type="number" value={param.alpha} onChange={(e) => onUpdate('alpha', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`d-${id}`}>dᵢ (offset)</Label>
                                <Input id={`d-${id}`} type="number" value={param.d} onChange={(e) => onUpdate('d', parseFloat(e.target.value))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`theta-${id}`}>θᵢ (angle)</Label>
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

export function DhPanel({ params, setParams }: DhPanelProps) {

  const updateParam = (index: number, field: keyof Omit<DHParams, "id">, value: number) => {
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
            <CardTitle className="font-headline">DH Parameters</CardTitle>
            <CardDescription>Adjust the parameters for each link of the robotic arm.</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1 px-6">
            <Accordion type="multiple" defaultValue={params.map((_,i) => i.toString())} className="w-full">
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
