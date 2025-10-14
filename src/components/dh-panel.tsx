"use client";

import type { Dispatch, SetStateAction } from "react";
import type { DHParams } from "@/types";
import { nanoid } from "nanoid";
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
  params: DHParams[];
  setParams: Dispatch<SetStateAction<DHParams[]>>;
};

export function DhPanel({ params, setParams }: DhPanelProps) {

  const updateParam = (id: string, field: keyof Omit<DHParams, "id">, value: number) => {
    setParams(prevParams =>
      prevParams.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addLink = () => {
    const newLink: DHParams = {
      id: nanoid(),
      a: 1,
      alpha: 0,
      d: 0,
      theta: 0,
    };
    setParams(prev => [...prev, newLink]);
  };

  const removeLink = (id: string) => {
    setParams(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
        <CardHeader>
            <CardTitle className="font-headline">DH Parameters</CardTitle>
            <CardDescription>Adjust the parameters for each link of the robotic arm.</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1 px-6">
            <Accordion type="multiple" defaultValue={params.map(p => p.id)} className="w-full">
            {params.map((param, index) => (
                <AccordionItem key={param.id} value={param.id} className="border-b-0 mb-2">
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
                                    removeLink(param.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <AccordionContent className="p-4 pt-2">
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`a-${param.id}`}>aᵢ (length)</Label>
                                        <Input id={`a-${param.id}`} type="number" value={param.a} onChange={(e) => updateParam(param.id, 'a', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`alpha-${param.id}`}>αᵢ (twist)</Label>
                                        <Input id={`alpha-${param.id}`} type="number" value={param.alpha} onChange={(e) => updateParam(param.id, 'alpha', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`d-${param.id}`}>dᵢ (offset)</Label>
                                        <Input id={`d-${param.id}`} type="number" value={param.d} onChange={(e) => updateParam(param.id, 'd', parseFloat(e.target.value))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <Label htmlFor={`theta-${param.id}`}>θᵢ (angle)</Label>
                                      <span className="text-sm text-muted-foreground font-mono">{param.theta.toFixed(0)}°</span>
                                    </div>
                                    <div className="[--primary:hsl(var(--accent-interactive))]">
                                        <Slider
                                            id={`theta-${param.id}`}
                                            min={-180}
                                            max={180}
                                            step={1}
                                            value={[param.theta]}
                                            onValueChange={([val]) => updateParam(param.id, 'theta', val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
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
