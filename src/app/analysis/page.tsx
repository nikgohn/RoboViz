
"use client";

import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";

export default function AnalysisPage() {
  const { params } = useDHParams();
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

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="flex items-center space-x-4 ml-6">
            <Tabs>
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="flex-1" />
         <Button variant="ghost" size="icon" asChild>
            <Link href="/analysis">
                <FileJson className="h-5 w-5" />
            </Link>
        </Button>
        <div className="ml-auto">
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
        </div>
      </main>
    </div>
  );
}
