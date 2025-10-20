
"use client";
import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/header-actions";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DHParams } from "@/types";

type SymbolicMatrixProps = {
    index: number;
    param: Omit<DHParams, 'id'>;
    variableIndex: number;
};

const SymbolicValue = ({ html }: { html: string }) => {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const SymbolicMatrixTable = ({ index, param, variableIndex }: SymbolicMatrixProps) => {
    const i = index;
    const { a, alpha, theta, thetaIsFixed, d, dIsVariable } = param;
    let varCount = variableIndex;
    
    const getThetaSymbol = () => {
        if (thetaIsFixed) {
            return `θ<sub>${i}</sub>`;
        }
        varCount++;
        return `q<sub>${varCount}</sub>`;
    };

    const getDSymbol = () => {
        if (dIsVariable) {
            varCount++;
            return `q<sub>${varCount}</sub>`;
        }
        return d.toString();
    };
    
    const getASymbol = () => {
        if (a !== 0) return `L<sub>${i}</sub>`;
        return '0';
    };

    const thetaSymbol = getThetaSymbol();
    const dSymbol = getDSymbol();
    const aSymbol = getASymbol();
    
    const cosTheta = thetaIsFixed ? Math.cos(theta * Math.PI / 180).toFixed(2) : `cos(${thetaSymbol})`;
    const sinTheta = thetaIsFixed ? Math.sin(theta * Math.PI / 180).toFixed(2) : `sin(${thetaSymbol})`;
    const cosAlphaVal = parseFloat(Math.cos(alpha * Math.PI / 180).toFixed(2));
    const sinAlphaVal = parseFloat(Math.sin(alpha * Math.PI / 180).toFixed(2));
    
    const multiplySymbolic = (symbol: string, factor: number) => {
        if (factor === 0) return '0';
        if (factor === 1) return symbol;
        if (factor === -1) return `-${symbol}`;
        
        const isNumericSymbol = !isNaN(parseFloat(symbol));
        if (isNumericSymbol) {
            return (parseFloat(symbol) * factor).toFixed(2);
        }
        
        return `${factor}*${symbol}`;
    };
    
    const negSinThetaCosAlpha = multiplySymbolic(`sin(${thetaSymbol})`, -cosAlphaVal);
    const sinThetaSinAlpha = multiplySymbolic(`sin(${thetaSymbol})`, sinAlphaVal);
    const cosThetaCosAlpha = multiplySymbolic(`cos(${thetaSymbol})`, cosAlphaVal);
    const negCosThetaSinAlpha = multiplySymbolic(`cos(${thetaSymbol})`, -sinAlphaVal);

    const aCosTheta = a === 0 ? '0' : (thetaIsFixed ? (a * parseFloat(cosTheta)).toFixed(2) : `${aSymbol}*${cosTheta}`);
    const aSinTheta = a === 0 ? '0' : (thetaIsFixed ? (a * parseFloat(sinTheta)).toFixed(2) : `${aSymbol}*${sinTheta}`);

    return (
        <Card>
            <CardHeader>
                <CardTitle>A<sub>{i - 1}→{i}</sub></CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody className="font-mono text-center">
                        <TableRow>
                            <TableCell><SymbolicValue html={cosTheta} /></TableCell>
                            <TableCell><SymbolicValue html={thetaIsFixed ? (-(parseFloat(sinTheta)) * cosAlphaVal).toFixed(2) : negSinThetaCosAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={thetaIsFixed ? (parseFloat(sinTheta) * sinAlphaVal).toFixed(2) : sinThetaSinAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={aCosTheta} /></TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell><SymbolicValue html={sinTheta} /></TableCell>
                            <TableCell><SymbolicValue html={thetaIsFixed ? (parseFloat(cosTheta) * cosAlphaVal).toFixed(2) : cosThetaCosAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={thetaIsFixed ? (-(parseFloat(cosTheta)) * sinAlphaVal).toFixed(2) : negCosThetaSinAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={aSinTheta} /></TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>0</TableCell>
                            <TableCell>{sinAlphaVal.toFixed(2)}</TableCell>
                            <TableCell>{cosAlphaVal.toFixed(2)}</TableCell>
                            <TableCell><SymbolicValue html={dSymbol} /></TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>0</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>1</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default function MatricesPage() {
  const { params } = useDHParams();
  const { t } = useLanguage();
  let variableCounter = 0;

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="flex items-center space-x-4 ml-6">
            <Tabs defaultValue="matrices">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                    <TabsTrigger value="matrices" asChild><Link href="/matrices">{t('matrices')}</Link></TabsTrigger>
                    <TabsTrigger value="analysis" asChild><Link href="/analysis">{t('analysis')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto space-y-6 p-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{t('transformationMatrices')}</h2>
                    <p className="text-muted-foreground">{t('transformationMatricesDescription')}</p>
                </div>

                {params.map((param, index) => {
                    const currentVarIndex = variableCounter;
                    if (!param.thetaIsFixed) variableCounter++;
                    if (param.dIsVariable) variableCounter++;

                    return (
                        <SymbolicMatrixTable 
                            key={index}
                            index={index + 1}
                            param={param}
                            variableIndex={currentVarIndex}
                        />
                    );
                })}
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}
