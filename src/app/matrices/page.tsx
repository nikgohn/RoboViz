
"use client";
import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { HeaderActions } from "@/components/header-actions";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DHParams } from "@/types";
import { createDHMatrix } from "@/lib/dh";
import * as THREE from 'three';


type SymbolicMatrixProps = {
    index: number;
    param: Omit<DHParams, 'id'>;
    variableIndex: number;
};

const SymbolicValue = ({ html }: { html: string }) => {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const SymbolicMatrixTable = ({ index, param, variableIndex }: SymbolicMatrixProps) => {
    const i = index + 1;
    const { a, alpha, thetaIsFixed, dIsVariable, dOffset, thetaOffset } = param;
    let varCount = variableIndex;
    
    const getThetaSymbol = () => {
        if (thetaIsFixed) {
            return ((param.theta + thetaOffset) * Math.PI / 180).toString();
        }
        varCount++;
        const offsetStr = thetaOffset !== 0 ? `+${thetaOffset}*(pi/180)` : '';
        return `q<sub>${varCount}</sub>${offsetStr}`;
    };

    const getDSymbol = () => {
        if (dIsVariable) {
            varCount++;
            const offsetStr = dOffset !== 0 ? `+${dOffset}` : '';
            return `q<sub>${varCount}</sub>${offsetStr}`;
        }
        return (param.d + dOffset).toString();
    };

    const getASymbol = () => {
        if (a !== 0) return `L<sub>${i}</sub>`;
        return '0';
    };

    const thetaSymbol = getThetaSymbol();
    const dSymbol = getDSymbol();
    const aSymbol = getASymbol();
    
    const cosTheta = thetaIsFixed ? Math.cos(parseFloat(thetaSymbol)).toFixed(2) : `cos(${thetaSymbol})`;
    const sinTheta = thetaIsFixed ? Math.sin(parseFloat(thetaSymbol)).toFixed(2) : `sin(${thetaSymbol})`;
    const cosAlphaVal = parseFloat(Math.cos(alpha * Math.PI / 180).toFixed(2));
    const sinAlphaVal = parseFloat(Math.sin(alpha * Math.PI / 180).toFixed(2));
    
    const multiplySymbolic = (symbol: string, factor: number) => {
        if (factor === 0) return '0';
        
        const isNumericSymbol = !isNaN(parseFloat(symbol)) && isFinite(Number(symbol));
        if (isNumericSymbol) {
            return (parseFloat(symbol) * factor).toFixed(2);
        }
        
        if (factor === 1) return symbol;
        if (factor === -1) return `-${symbol}`;
        
        return `${factor.toFixed(2)}*${symbol}`;
    };

    const negSinTheta = thetaIsFixed ? (-parseFloat(sinTheta)).toFixed(2) : `-sin(${thetaSymbol})`;

    const negSinThetaCosAlpha = multiplySymbolic(negSinTheta, cosAlphaVal);
    const sinThetaSinAlpha = multiplySymbolic(sinTheta, sinAlphaVal);
    const cosThetaCosAlpha = multiplySymbolic(cosTheta, cosAlphaVal);
    const negCosThetaSinAlpha = multiplySymbolic(cosTheta, -sinAlphaVal);

    const aCosTheta = aSymbol === '0' ? '0' : aSymbol === cosTheta ? aSymbol : `${aSymbol}*${cosTheta}`;
    const aSinTheta = aSymbol === '0' ? '0' : aSymbol === sinTheta ? aSymbol : `${aSymbol}*${sinTheta}`;


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
                            <TableCell><SymbolicValue html={negSinThetaCosAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={sinThetaSinAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={aCosTheta} /></TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell><SymbolicValue html={sinTheta} /></TableCell>
                            <TableCell><SymbolicValue html={cosThetaCosAlpha} /></TableCell>
                            <TableCell><SymbolicValue html={negCosThetaSinAlpha} /></TableCell>
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

const NumericMatrixTable = ({ matrix }: { matrix: THREE.Matrix4 }) => {
    const elements = matrix.elements;
    return (
        <Table>
            <TableBody className="font-mono text-center">
                {[0, 4, 8, 12].map(rowStart => (
                    <TableRow key={rowStart}>
                        {[0, 1, 2, 3].map(col => (
                             <TableCell key={col}>{elements[rowStart + col].toFixed(3)}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
};


export default function MatricesPage() {
  const { params } = useDHParams();
  const { t } = useLanguage();
  let variableCounter = 0;

  const finalMatrix = params.reduce((acc, p) => {
    const { a, alpha, d, dOffset, theta, thetaOffset } = p;
    const totalTheta = theta + thetaOffset;
    const totalD = d + dOffset;
    const dhMatrix = createDHMatrix(a, alpha, totalD, totalTheta);
    return acc.multiply(dhMatrix);
  }, new THREE.Matrix4());
  
  const finalMatrixEquation = `T<sub>0→${params.length}</sub> = ${params.map((_, i) => `A<sub>${i}→${i+1}</sub>`).join(' × ')}`;


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
                            index={index}
                            param={param}
                            variableIndex={currentVarIndex}
                        />
                    );
                })}

                <Card>
                    <CardHeader>
                         <CardTitle>{t('finalTransformationMatrix')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 mb-4 bg-muted rounded-md text-center font-mono text-lg overflow-x-auto">
                            <SymbolicValue html={finalMatrixEquation} />
                        </div>
                        <NumericMatrixTable matrix={finalMatrix} />
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}

