
"use client";
import { useDHParams } from "@/context/dh-params-context";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeaderActions } from "@/components/header-actions";

const Formula = ({ children }: { children: React.ReactNode }) => (
    <div className="p-4 bg-muted rounded-md text-center font-mono text-base overflow-x-auto my-4">
        <code>{children}</code>
    </div>
);

const SymbolicValue = ({ html }: { html: string }) => {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};


export default function IKSolutionPage() {
  const { t } = useLanguage();
  const { params, getQIndexForParam } = useDHParams();
  
  const activeJoints = params.map((p, i) => ({...p, index: i})).filter(p => !p.thetaIsFixed || p.dIsVariable);

  return (
    <div className="flex h-dvh flex-col font-sans">
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          RoboViz
        </h1>
        <nav className="ml-auto flex items-center space-x-4">
            <Tabs defaultValue="ik-solution">
                <TabsList>
                    <TabsTrigger value="editor" asChild><Link href="/">{t('editor')}</Link></TabsTrigger>
                    <TabsTrigger value="kinematics" asChild><Link href="/kinematics">{t('kinematics')}</Link></TabsTrigger>
                    <TabsTrigger value="matrices" asChild><Link href="/matrices">{t('matrices')}</Link></TabsTrigger>
                    <TabsTrigger value="analysis" asChild><Link href="/analysis">{t('analysis')}</Link></TabsTrigger>
                    <TabsTrigger value="workspace" asChild><Link href="/workspace">{t('workspace')}</Link></TabsTrigger>
                    <TabsTrigger value="inverse-kinematics" asChild><Link href="/inverse-kinematics">{t('ik')}</Link></TabsTrigger>
                    <TabsTrigger value="ik-solution" asChild><Link href="/ik-solution">{t('ikSolution')}</Link></TabsTrigger>
                </TabsList>
            </Tabs>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('ikSolutionTitle')}</h2>
                <p className="text-muted-foreground">{t('ikSolutionDescription')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('ikCcdAlgorithm')}</CardTitle>
                    <CardDescription>{t('ikCcdAlgorithmDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-2">{t('ikIterationProcess')}</h3>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>{t('ikIterationProcessStep1')}</li>
                        <li>{t('ikIterationProcessStep2')}</li>
                        <li>{t('ikIterationProcessStep3')}</li>
                        <li>{t('ikIterationProcessStep4')}</li>
                        <li>{t('ikIterationProcessStep5')}</li>
                    </ol>
                </CardContent>
            </Card>

            {activeJoints.map(joint => {
                if (!joint.thetaIsFixed) {
                    const qIndex = getQIndexForParam(joint.index, 'theta');
                    return (
                        <Card key={`theta-${joint.index}`}>
                            <CardHeader>
                                <CardTitle>{t('ikRevoluteJoints')} - Joint {joint.index + 1} (Variable <SymbolicValue html={`q<sub>${qIndex}</sub> = θ<sub>${joint.index+1}</sub>`}/>)</CardTitle>
                                <CardDescription>{t('ikRevoluteJointsDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Let <strong>J<sub>{joint.index}</sub></strong> be the position of the current joint, <strong>E</strong> be the end-effector position, and <strong>T</strong> be the target position.
                                    Let <strong>axis<sub>{joint.index}</sub></strong> be the axis of rotation for the joint.
                                </p>
                                <Formula>V_JE = (E - J<sub>{joint.index}</sub>).projectOnPlane(axis<sub>{joint.index}</sub>)</Formula>
                                <Formula>V_JT = (T - J<sub>{joint.index}</sub>).projectOnPlane(axis<sub>{joint.index}</sub>)</Formula>
                                <p>The angle Δθ is the signed angle between the vectors V_JE and V_JT.</p>
                                <Formula>Δθ = angleTo(V_JE, V_JT)</Formula>
                                <p>The new joint angle is then:</p>
                                <Formula>θ<sub>{joint.index + 1}</sub>_new = θ<sub>{joint.index + 1}</sub>_current + Δθ</Formula>
                            </CardContent>
                        </Card>
                    )
                }
                if (joint.dIsVariable) {
                    const qIndex = getQIndexForParam(joint.index, 'd');
                    return (
                         <Card key={`d-${joint.index}`}>
                            <CardHeader>
                                <CardTitle>{t('ikPrismaticJoints')} - Joint {joint.index + 1} (Variable <SymbolicValue html={`q<sub>${qIndex}</sub> = d<sub>${joint.index+1}</sub>`}/>)</CardTitle>
                                <CardDescription>{t('ikPrismaticJointsDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Let <strong>J<sub>{joint.index}</sub></strong> be the position of the current joint, <strong>E</strong> be the end-effector position, and <strong>T</strong> be the target position.
                                    Let <strong>axis<sub>{joint.index}</sub></strong> be the axis of translation for the joint.
                                </p>
                                <p>The change in distance Δd is the difference in the projection of the end-effector-to-joint and target-to-joint vectors onto the joint's axis.</p>
                                <Formula>Δd = (T - J<sub>{joint.index}</sub>)·axis<sub>{joint.index}</sub> - (E - J<sub>{joint.index}</sub>)·axis<sub>{joint.index}</sub></Formula>
                                 <p>The new joint distance is then:</p>
                                <Formula>d<sub>{joint.index + 1}</sub>_new = d<sub>{joint.index + 1}</sub>_current + Δd</Formula>
                            </CardContent>
                        </Card>
                    )
                }
                return null;
            })}
             {activeJoints.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-center">
                           {t('noActiveJoints')}
                        </p>
                    </CardContent>
                </Card>
            )}

        </div>
      </main>
    </div>
  );
}
