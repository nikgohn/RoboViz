
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { DHParams } from "@/types";
import { createDHMatrix } from "@/lib/dh";

type RobotVisualizerProps = {
  params: Omit<DHParams, "id">[];
  showAxes: boolean;
  onPositionUpdate?: (position: THREE.Vector3) => void;
};

// Function to create a text sprite
const makeTextSprite = (message: string, opts: { fontsize: number; fontface: string; textColor: { r: number; g: number; b: number; a: number; }}) => {
    const { fontsize, fontface, textColor } = opts;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.font = `${fontsize}px ${fontface}`;
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    canvas.width = textWidth + 8;
    canvas.height = fontsize + 8;
    
    context.font = `bold ${fontsize}px ${fontface}`;
    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
    context.fillText(message, 4, fontsize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, renderOrder: 999 });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 100, canvas.height / 100, 1.0);
    return sprite;
};

const createAxisLabels = (scale: number, index: number) => {
    const labels = new THREE.Group();
    const spriteX = makeTextSprite(`X${index}`, { fontsize: 30, fontface: "Arial", textColor: { r: 255, g: 0, b: 0, a: 1.0 } });
    if(spriteX) {
        spriteX.position.set(scale, 0, 0);
        labels.add(spriteX);
    }
    const spriteY = makeTextSprite(`Y${index}`, { fontsize: 30, fontface: "Arial", textColor: { r: 0, g: 255, b: 0, a: 1.0 } });
    if (spriteY) {
        spriteY.position.set(0, scale, 0);
        labels.add(spriteY);
    }
    const spriteZ = makeTextSprite(`Z${index}`, { fontsize: 30, fontface: "Arial", textColor: { r: 0, g: 0, b: 255, a: 1.0 } });
    if (spriteZ) {
        spriteZ.position.set(0, 0, scale);
        labels.add(spriteZ);
    }
    return labels;
};


export function RobotVisualizer({ params, showAxes, onPositionUpdate }: RobotVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
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
    cameraRef.current = camera;

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
      if (!currentMount || !rendererRef.current || !cameraRef.current) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      controls.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (currentMount && rendererRef.current?.domElement) {
        if (currentMount.contains(rendererRef.current.domElement)) {
          currentMount.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    let robotGroup = scene.getObjectByName("robot");
    if (robotGroup) {
      scene.remove(robotGroup);
    }
    
    robotGroup = new THREE.Group();
    robotGroup.name = "robot";
    scene.add(robotGroup);

    const jointMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.5 });
    const linkMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color("hsl(var(--primary))"), metalness: 0.3, roughness: 0.6 });
    const offsetLinkMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.3, roughness: 0.6 });

    // Base (visual only)
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = 0.05; // half of height
    robotGroup.add(baseMesh);

    // This matrix will track the transformations for kinematics
    let currentMatrix = new THREE.Matrix4(); 

    // Initial joint at origin
    const baseJointGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const baseJointMesh = new THREE.Mesh(baseJointGeometry, jointMaterial);
    robotGroup.add(baseJointMesh);

    if (showAxes) {
        const axesHelper = new THREE.AxesHelper(1);
        robotGroup.add(axesHelper);
        
        const axisLabels = createAxisLabels(1.1, 0);
        robotGroup.add(axisLabels);
    }

    params.forEach((p, index) => {
        const { a, alpha, d, theta, thetaOffset } = p;
        const totalTheta = theta + thetaOffset;
        const dhMatrix = createDHMatrix(a, alpha, d, totalTheta);

        const prevMatrix = currentMatrix.clone();
        currentMatrix.multiply(dhMatrix);

        const startPoint = new THREE.Vector3().setFromMatrixPosition(prevMatrix);
        const endPoint = new THREE.Vector3().setFromMatrixPosition(currentMatrix);

        if (showAxes) {
            const axesHelper = new THREE.AxesHelper(1);
            axesHelper.applyMatrix4(currentMatrix);
            robotGroup.add(axesHelper);

            const axisLabels = createAxisLabels(1.1, index + 1);
            axisLabels.applyMatrix4(currentMatrix);
            robotGroup.add(axisLabels);
        }

        // Joint at the end of the new link
        const jointGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const jointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
        jointMesh.position.copy(endPoint);
        robotGroup.add(jointMesh);

        // Create a separate matrix for visualizing links, without the final alpha rotation and a translation.
        const visMatrixNoAlpha = new THREE.Matrix4();
        visMatrixNoAlpha.multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(totalTheta)));
        visMatrixNoAlpha.multiply(new THREE.Matrix4().makeTranslation(0, 0, d));
        
        const offsetLinkEndMatrix = prevMatrix.clone().multiply(visMatrixNoAlpha);

        // d link (z-axis offset)
        if (Math.abs(d) > 0.001) {
            const dLinkStart = startPoint;
            
            const zRotOnlyMatrix = prevMatrix.clone().multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(totalTheta)));
            const dLinkEnd = new THREE.Vector3().setFromMatrixPosition(zRotOnlyMatrix.clone().multiply(new THREE.Matrix4().makeTranslation(0,0,d)));

            const dLinkVector = new THREE.Vector3().subVectors(dLinkEnd, dLinkStart);

            const offsetLinkGeom = new THREE.CylinderGeometry(0.08, 0.08, dLinkVector.length(), 32);
            const offsetLinkMesh = new THREE.Mesh(offsetLinkGeom, offsetLinkMaterial);

            offsetLinkMesh.position.copy(dLinkStart).add(dLinkVector.clone().multiplyScalar(0.5));
            offsetLinkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dLinkVector.clone().normalize());

            robotGroup.add(offsetLinkMesh);
        }
        
        // a link (x-axis length)
        if (Math.abs(a) > 0.001) {
            const linkGeom = new THREE.CylinderGeometry(0.1, 0.1, a, 32);
            const linkMesh = new THREE.Mesh(linkGeom, linkMaterial);

            const linkStartPoint = new THREE.Vector3().setFromMatrixPosition(offsetLinkEndMatrix);

            const xTransOnlyMatrix = offsetLinkEndMatrix.clone().multiply(new THREE.Matrix4().makeTranslation(a, 0, 0));
            const linkEndPoint = new THREE.Vector3().setFromMatrixPosition(xTransOnlyMatrix);
            
            const linkVector = new THREE.Vector3().subVectors(linkEndPoint, linkStartPoint);
            
            linkMesh.position.copy(linkStartPoint).add(linkVector.clone().multiplyScalar(0.5));
            linkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), linkVector.clone().normalize());
            
            robotGroup.add(linkMesh);
        }
    });

    if (onPositionUpdate) {
        onPositionUpdate(new THREE.Vector3().setFromMatrixPosition(currentMatrix));
    }

    if (controlsRef.current) {
        controlsRef.current.target.set(0,1,0);
    }

  }, [params, showAxes, onPositionUpdate]);

  return <div ref={mountRef} className="w-full h-full" />;
}
