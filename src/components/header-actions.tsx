
"use client";

import { useRef } from "react";
import type { DHParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useDHParams } from "@/context/dh-params-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function HeaderActions() {
    const { t } = useLanguage();
    const { params, setParams, baseOrientation, setBaseOrientation } = useDHParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportCSV = () => {
        let variableCounter = 1;
        const header = "a,alpha,d,theta\n";
        const orientationRow = `0,${baseOrientation.x},${baseOrientation.y},${baseOrientation.z}\n`;
        const rows = params.map(param => {
            const { a, alpha, d, theta, thetaOffset, dIsVariable, thetaIsFixed } = param;
            
            const alpha_val = `${alpha}*(pi/180)`;

            let d_val: string | number;
            if (dIsVariable) {
                d_val = `q_${variableCounter}`;
                variableCounter++;
            } else {
                d_val = d;
            }

            let theta_val: string | number;
            if (!thetaIsFixed) {
                theta_val = `q_${variableCounter}+${thetaOffset}*(pi/180)`;
                variableCounter++;
            } else {
                theta_val = `${theta + thetaOffset}*(pi/180)`;
            }
            
            return [a, alpha_val, d_val, theta_val].join(',');
        }).join('\n');

        const csvContent = "data:text/csv;charset=utf-8," + header + orientationRow + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "dh_parameters.csv");
        document.body.appendChild(link); 
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
                console.error("Invalid CSV format");
                return;
            }

            // First line after header is orientation
            const orientationParts = lines[1].split(',');
            if (orientationParts.length === 4) {
                setBaseOrientation({
                    x: parseFloat(orientationParts[1]) || 0,
                    y: parseFloat(orientationParts[2]) || 0,
                    z: parseFloat(orientationParts[3]) || 0,
                });
            }

            const newParams: Omit<DHParams, "id">[] = [];
            // The rest are DH params
            const paramLines = lines.slice(2);
            
            let variableCounter = 1;
            paramLines.forEach(line => {
                const parts = line.split(',');
                if (parts.length === 4) {
                    const [aStr, alphaStr, dStr, thetaStr] = parts;
                    
                    const newParam: Omit<DHParams, "id"> = {
                        a: parseFloat(aStr) || 0,
                        alpha: parseFloat(alphaStr.replace(/\*\(pi\/180\)/, '')) || 0,
                        d: 0,
                        dIsVariable: false,
                        theta: 0,
                        thetaIsFixed: false,
                        thetaOffset: 0,
                    };
                    
                    if (dStr.startsWith('q_')) {
                        newParam.dIsVariable = true;
                        newParam.d = 0; // Default slider value
                        variableCounter++;
                    } else {
                        newParam.d = parseFloat(dStr) || 0;
                    }

                    if (thetaStr.startsWith('q_')) {
                        newParam.thetaIsFixed = false;
                        const thetaParts = thetaStr.replace(`q_${variableCounter}`, '0').split('+');
                        if (thetaParts.length > 1) {
                        newParam.thetaOffset = parseFloat(thetaParts[1].replace(/\*\(pi\/180\)/, '')) || 0;
                        }
                        newParam.theta = 0; // Default angle value
                        variableCounter++;
                    } else {
                        newParam.thetaIsFixed = true;
                        const combinedTheta = parseFloat(thetaStr.replace(/\*\(pi\/180\)/, '')) || 0;
                        newParam.theta = combinedTheta;
                        newParam.thetaOffset = 0;
                    }
                    
                    newParams.push(newParam);
                }
            });
            setParams(newParams);
        };
        reader.readAsText(file);
        // Reset file input
        if(event.target) event.target.value = '';
    };

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleImportClick} variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('import')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleExportCSV} variant="ghost" size="icon">
                        <Upload className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('export')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </>
    );
}
