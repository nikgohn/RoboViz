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
        currentMount.removeChild(rendererRef.current.domElement);
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

    let currentMatrix = new THREE.Matrix4(); // Identity matrix for base

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMesh = new THREE.Mesh(baseGeometry, jointMaterial);
    baseMesh.position.y = 0.1;
    robotGroup.add(baseMesh);

    params.forEach((p, i) => {
      const { a, alpha, d, theta } = p;
      const dhMatrix = createDHMatrix(a, alpha, d, theta);
      
      const prevMatrix = currentMatrix.clone();
      currentMatrix.multiply(dhMatrix);

      const frame = new THREE.Group();
      frame.matrixAutoUpdate = false;
      frame.matrix.copy(prevMatrix);
      robotGroup.add(frame);
      
      // Joint
      const jointGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const jointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
      const zAxis = new THREE.Vector3(0, 0, 1);
      const start = new THREE.Vector3().setFromMatrixPosition(prevMatrix);
      const end = new THREE.Vector3().setFromMatrixPosition(currentMatrix);
      const direction = new THREE.Vector3().subVectors(end, start);
      const linkLength = direction.length();
      
      // Create link (if a > 0 or d > 0)
      if (a > 0.01) {
          const linkGeometry = new THREE.CylinderGeometry(0.1, 0.1, a, 32);
          const linkMesh = new THREE.Mesh(linkGeometry, linkMaterial);
          
          const alignMatrix = new THREE.Matrix4();
          const targetDirection = new THREE.Vector3(1, 0, 0);
          const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetDirection);
          alignMatrix.makeRotationFromQuaternion(quaternion);
          alignMatrix.setPosition(new THREE.Vector3(a/2, 0, 0));
          linkMesh.applyMatrix4(alignMatrix);
          frame.add(linkMesh);
      }
      
      if (d > 0.01) {
          const offsetLinkGeometry = new THREE.CylinderGeometry(0.08, 0.08, d, 32);
          const offsetLinkMesh = new THREE.Mesh(offsetLinkGeometry, new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.3, roughness: 0.6 }));
          offsetLinkMesh.position.set(0, 0, d/2); // along z-axis of previous frame
          frame.add(offsetLinkMesh);
      }
      
      const newJointFrame = new THREE.Group();
      newJointFrame.matrixAutoUpdate = false;
      newJointFrame.matrix.copy(currentMatrix);
      
      const nextJointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
      newJointFrame.add(nextJointMesh);

      robotGroup.add(newJointFrame);

    });

    if (controlsRef.current) {
        controlsRef.current.target.set(0,1,0);
    }

  }, [params]);

  return <div ref={mountRef} className="w-full h-full" />;
}
