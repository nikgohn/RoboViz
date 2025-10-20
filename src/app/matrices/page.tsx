
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
import { ScrollArea } from '@/components/ui/scroll-area';

const MatrixTable = ({ matrix, title }: { matrix: THREE.Matrix4, title: string }) => {
    const elements = matrix.elements;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody className="font-mono">
                        {[0, 4, 8, 12].map(i => (
                            <TableRow key={i}>
                                <TableCell>{elements[i].toFixed(4)}</TableCell>
                                <TableCell>{elements[i + 1].toFixed(4)}</TableCell>
                                <TableCell>{elements[i + 2].toFixed(4)}</TableCell>
                                <TableCell>{elements[i + 3].toFixed(4)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default function MatricesPage() {
  const { params, baseOrientation } = useDHParams();
  const { t } = useLanguage();

  const matrices = params.reduce((acc, p, index) => {
    const { a, alpha, d, dOffset, theta, thetaOffset } = p;
    const totalTheta = theta + thetaOffset;
    const totalD = d + dOffset;
    const dhMatrix = createDHMatrix(a, alpha, totalD, totalTheta);
    
    const prevMatrix = acc.length > 0 ? acc[acc.length - 1].matrix : new THREE.Matrix4();
    const currentMatrix = new THREE.Matrix4().multiplyMatrices(prevMatrix, dhMatrix);
    
    acc.push({
        link: index,
        matrix: currentMatrix,
    });

    return acc;
  }, [] as {link: number, matrix: THREE.Matrix4}[]);

  const baseTransform = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(
        THREE.MathUtils.degToRad(baseOrientation.x),
        THREE.MathUtils.degToRad(baseOrientation.y),
        THREE.MathUtils.degToRad(baseOrientation.z),
        'XYZ'
    )
  );

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
                </TabsList>
            </Tabs>
        </nav>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" asChild>
            <Link href="/analysis">
            </Link>
        </Button>
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

                <MatrixTable matrix={baseTransform} title={`${t('baseTransform')} T(0)`} />

                {matrices.map((item) => (
                    <MatrixTable 
                        key={item.link}
                        matrix={item.matrix}
                        title={`T(${item.link + 1})`}
                    />
                ))}
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}
