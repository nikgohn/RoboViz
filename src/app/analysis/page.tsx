
"use client";
import * as THREE from 'three';
import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/header-actions";
import { createDHMatrix } from '@/lib/dh';

export default function AnalysisPage() {
  const { params, baseOrientation } = useDHParams();
  const { t } = useLanguage();

  const getJointType = (param: Omit<import("@/types").DHParams, "id">) => {
    if (param.dIsVariable) return t('jointTypePrismatic');
    if (!param.thetaIsFixed) return t('jointTypeRevolute');
    return t('jointTypeFixed');
  };
  
  const getLinkName = (param: Omit<import("@/types").DHParams, "id">) => {
    if (param.dIsVariable) return t('linkTypeSlider');
    if (!param.thetaIsFixed) return t('linkTypeCrank');
    return t('linkTypeFixed');
  }

  const getMotionType = (param: Omit<import("@/types").DHParams, "id">) => {
    if (param.dIsVariable) return t('motionTypeTranslational');
    if (!param.thetaIsFixed) return t('motionTypeRotational');
    return '-';
  }

  const designations = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  const eulerAngles = params.reduce((acc, p, index) => {
    const { a, alpha, d, dOffset, theta, thetaOffset } = p;
    const totalTheta = theta + thetaOffset;
    const totalD = d + dOffset;
    const dhMatrix = createDHMatrix(a, alpha, totalD, totalTheta);
    
    const prevMatrix = acc.length > 0 ? acc[acc.length - 1].matrix : new THREE.Matrix4();
    const currentMatrix = new THREE.Matrix4().multiplyMatrices(prevMatrix, dhMatrix);

    const euler = new THREE.Euler().setFromRotationMatrix(currentMatrix, 'ZYX');
    
    acc.push({
        link: index + 1,
        matrix: currentMatrix,
        roll: THREE.MathUtils.radToDeg(euler.x),
        pitch: THREE.MathUtils.radToDeg(euler.y),
        yaw: THREE.MathUtils.radToDeg(euler.z),
    });

    return acc;
  }, [] as {link: number, matrix: THREE.Matrix4, roll: number, pitch: number, yaw: number}[]);

  const baseEuler = new THREE.Euler(
    THREE.MathUtils.degToRad(baseOrientation.x),
    THREE.MathUtils.degToRad(baseOrientation.y),
    THREE.MathUtils.degToRad(baseOrientation.z),
    'XYZ'
  );
  
  const initialAngles = {
    roll: THREE.MathUtils.radToDeg(baseEuler.x),
    pitch: THREE.MathUtils.radToDeg(baseEuler.y),
    yaw: THREE.MathUtils.radToDeg(baseEuler.z),
  }

  const finalAngles = eulerAngles.length > 0 ? eulerAngles[eulerAngles.length - 1] : null;

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="ml-auto flex items-center space-x-4">
            <Tabs>
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                    <TabsTrigger value="matrices" asChild><Link href="/matrices">{t('matrices')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <Button variant="ghost" size="icon" asChild>
            <Link href="/analysis">
            </Link>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('kinematicPairsTableTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('tableHeaderDesignation')}</TableHead>
                                <TableHead>{t('tableHeaderLinks')}</TableHead>
                                <TableHead>{t('tableHeaderName')}</TableHead>
                                <TableHead>{t('tableHeaderClass')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {params.map((param, index) => (
                                <TableRow key={index}>
                                    <TableCell>{designations[index] || '-'}</TableCell>
                                    <TableCell>{index}-{index + 1}</TableCell>
                                    <TableCell>{getJointType(param)}</TableCell>
                                    <TableCell>5(H)</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('mechanismLinksTableTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>№</TableHead>
                                <TableHead>{t('tableHeaderName')}</TableHead>
                                <TableHead>{t('tableHeaderMotionType')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>0</TableCell>
                                <TableCell>{t('linkTypeBase')}</TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>
                            {params.map((param, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{getLinkName(param)}</TableCell>
                                    <TableCell>{getMotionType(param)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('eulerAnglesTableTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Link</TableHead>
                                <TableHead>Roll (X)</TableHead>
                                <TableHead>Pitch (Y)</TableHead>
                                <TableHead>Yaw (Z)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow>
                                <TableCell>0 (Base)</TableCell>
                                <TableCell>{initialAngles.roll.toFixed(2)}°</TableCell>
                                <TableCell>{initialAngles.pitch.toFixed(2)}°</TableCell>
                                <TableCell>{initialAngles.yaw.toFixed(2)}°</TableCell>
                            </TableRow>
                            {eulerAngles.map((angle) => (
                                <TableRow key={angle.link}>
                                    <TableCell>{angle.link}</TableCell>
                                    <TableCell>{angle.roll.toFixed(2)}°</TableCell>
                                    <TableCell>{angle.pitch.toFixed(2)}°</TableCell>
                                    <TableCell>{angle.yaw.toFixed(2)}°</TableCell>
                                </TableRow>
                            ))}
                            {finalAngles && (
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell>{t('baseTool')}</TableCell>
                                    <TableCell>{finalAngles.roll.toFixed(2)}°</TableCell>
                                    <TableCell>{finalAngles.pitch.toFixed(2)}°</TableCell>
                                    <TableCell>{finalAngles.yaw.toFixed(2)}°</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
