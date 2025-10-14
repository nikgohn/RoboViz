"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { DHParams } from "@/types";
import { createDHMatrix } from "@/lib/dh";

type RobotVisualizerProps = {
  params: Omit<DHParams, "id">[];
};

export function RobotVisualizer({ params }: RobotVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("hsl(var(--background))");
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(4, 3, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Helpers
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    // Robot group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (currentMount && rendererRef.current?.domElement) {
        // Check if the DOM element is still a child before removing
        if (currentMount.contains(rendererRef.current.domElement)) {
          currentMount.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    let robotGroup = scene.children.find(child => child.name === "robot");
    if (robotGroup) {
      scene.remove(robotGroup);
    }
    
    robotGroup = new THREE.Group();
    robotGroup.name = "robot";
    scene.add(robotGroup);

    const jointMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.5 });
    const linkMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color("hsl(var(--primary))"), metalness: 0.3, roughness: 0.6 });
    const offsetLinkMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.3, roughness: 0.6 });

    let currentMatrix = new THREE.Matrix4();

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMesh = new THREE.Mesh(baseGeometry, jointMaterial);
    baseMesh.position.y = 0.1;
    robotGroup.add(baseMesh);
    
    const baseJointGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const baseJointMesh = new THREE.Mesh(baseJointGeometry, jointMaterial);
    baseJointMesh.position.y = 0.2; // Position on top of the base
    robotGroup.add(baseJointMesh);

    currentMatrix.makeTranslation(0, 0.2, 0);

    params.forEach((p) => {
        const { a, alpha, d, theta, thetaOffset } = p;
        const totalTheta = theta + thetaOffset;
        const dhMatrix = createDHMatrix(a, alpha, d, totalTheta);

        const prevMatrix = currentMatrix.clone();
        currentMatrix.multiply(dhMatrix);

        const startPoint = new THREE.Vector3().setFromMatrixPosition(prevMatrix);
        const endPoint = new THREE.Vector3().setFromMatrixPosition(currentMatrix);

        // Joint at the end of the new link
        const jointGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const jointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
        jointMesh.position.copy(endPoint);
        robotGroup.add(jointMesh);

        // Create a separate matrix for visualizing links, without the alpha rotation
        const visMatrix = new THREE.Matrix4();
        visMatrix.multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(totalTheta)));
        visMatrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, d));
        
        const offsetLinkEndMatrix = prevMatrix.clone().multiply(visMatrix);

        if (d > 0.01) {
            const offsetLinkGeom = new THREE.CylinderGeometry(0.08, 0.08, d, 32);
            const offsetLinkMesh = new THREE.Mesh(offsetLinkGeom, offsetLinkMaterial);
            
            const zLinkStart = new THREE.Vector3().setFromMatrixPosition(prevMatrix);

            const rotZOnly = prevMatrix.clone().multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(totalTheta)));
            const zLinkEnd = new THREE.Vector3().setFromMatrixPosition(rotZOnly.multiply(new THREE.Matrix4().makeTranslation(0,0,d)));

            const zLinkVector = new THREE.Vector3().subVectors(zLinkEnd, zLinkStart);

            offsetLinkMesh.position.copy(zLinkStart).add(zLinkVector.clone().multiplyScalar(0.5));
            offsetLinkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), zLinkVector.clone().normalize());

            robotGroup.add(offsetLinkMesh);
        }

        if (a > 0.01) {
            const linkGeom = new THREE.CylinderGeometry(0.1, 0.1, a, 32);
            const linkMesh = new THREE.Mesh(linkGeom, linkMaterial);

            const linkStartPoint = new THREE.Vector3().setFromMatrixPosition(offsetLinkEndMatrix);

            const linkEndMatrix = offsetLinkEndMatrix.clone().multiply(new THREE.Matrix4().makeTranslation(a, 0, 0));
            const linkEndPoint = new THREE.Vector3().setFromMatrixPosition(linkEndMatrix);
            
            const linkVector = new THREE.Vector3().subVectors(linkEndPoint, linkStartPoint);
            
            linkMesh.position.copy(linkStartPoint).add(linkVector.clone().multiplyScalar(0.5));
            linkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), linkVector.clone().normalize());
            
            robotGroup.add(linkMesh);
        }
    });

    if (controlsRef.current) {
        controlsRef.current.target.set(0,1,0);
    }

  }, [params]);

  return <div ref={mountRef} className="w-full h-full" />;
}
