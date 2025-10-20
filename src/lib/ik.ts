
import * as THREE from 'three';
import type { DHParams } from '@/types';
import { createDHMatrix } from './dh';

// This function computes the world positions of each joint based on the DH parameters.
const getForwardKinematics = (dhParams: Omit<DHParams, "id">[], baseOrientation: {x: number, y: number, z: number}) => {
    const joints: { position: THREE.Vector3; axis: THREE.Vector3; }[] = [];
    const baseMatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(
            THREE.MathUtils.degToRad(baseOrientation.x),
            THREE.MathUtils.degToRad(baseOrientation.y),
            THREE.MathUtils.degToRad(baseOrientation.z),
            'XYZ'
        )
    );

    let currentMatrix = baseMatrix.clone();

    // Add base joint
    const basePosition = new THREE.Vector3();
    currentMatrix.decompose(basePosition, new THREE.Quaternion(), new THREE.Vector3());
    joints.push({ position: basePosition, axis: new THREE.Vector3(0, 0, 1) }); // Base axis, won't be used but good for consistency

    for (let i = 0; i < dhParams.length; i++) {
        const p = dhParams[i];
        const { a, alpha, d, dOffset, theta, thetaOffset } = p;
        const totalTheta = theta + thetaOffset;
        const totalD = d + dOffset;
        
        const dhMatrix = createDHMatrix(a, alpha, totalD, totalTheta);

        const zAxisBefore = new THREE.Vector3();
        currentMatrix.extractBasis(new THREE.Vector3(), new THREE.Vector3(), zAxisBefore);

        currentMatrix.multiply(dhMatrix);
        
        const position = new THREE.Vector3();
        currentMatrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

        joints.push({ position: position, axis: zAxisBefore.normalize() });
    }

    return joints;
};


// Solves Inverse Kinematics using the Cyclic Coordinate Descent (CCD) algorithm.
export const solveIK = (
    initialParams: Omit<DHParams, "id">[],
    baseOrientation: {x: number, y: number, z: number},
    target: THREE.Vector3,
    iterations = 30,
    tolerance = 0.01
): Promise<Omit<DHParams, "id">[] | null> => {
    return new Promise((resolve) => {
        let currentParams = JSON.parse(JSON.stringify(initialParams));

        const variableJointIndices = currentParams
            .map((p: Omit<DHParams, "id">, i: number) => (!p.thetaIsFixed || p.dIsVariable) ? i : -1)
            .filter((i: number) => i !== -1);

        for (let iter = 0; iter < iterations; iter++) {
            const joints = getForwardKinematics(currentParams, baseOrientation);
            const endEffectorPosition = joints[joints.length - 1].position;
            
            const distance = endEffectorPosition.distanceTo(target);
            if (distance < tolerance) {
                resolve(currentParams);
                return;
            }

            // Iterate backwards from the joint before the end-effector to the base
            for (let i = variableJointIndices.length - 1; i >= 0; i--) {
                const paramIndex = variableJointIndices[i];
                const jointPosition = joints[paramIndex].position;
                const jointAxis = joints[paramIndex+1].axis; // The axis of rotation/translation is from the *previous* frame's Z
                const param = currentParams[paramIndex];
                
                const toEndEffector = new THREE.Vector3().subVectors(endEffectorPosition, jointPosition);
                const toTarget = new THREE.Vector3().subVectors(target, jointPosition);

                if (param.dIsVariable) { // Prismatic joint
                    const projection = toTarget.dot(jointAxis) - toEndEffector.dot(jointAxis);
                    param.d += projection;
                    // Clamp within limits
                    param.d = Math.max(-5, Math.min(5, param.d));

                } else { // Revolute joint
                    toEndEffector.projectOnPlane(jointAxis);
                    toTarget.projectOnPlane(jointAxis);
                    toEndEffector.normalize();
                    toTarget.normalize();
                    
                    let angle = toEndEffector.angleTo(toTarget);
                    const cross = new THREE.Vector3().crossVectors(toEndEffector, toTarget);
                    
                    if (jointAxis.dot(cross) < 0) {
                        angle = -angle;
                    }
                    
                    param.theta += THREE.MathUtils.radToDeg(angle);
                    // Clamp within limits
                    param.theta = Math.max(-180, Math.min(180, param.theta));
                }
                 // Update kinematics for the next joint in the loop
                 const updatedJoints = getForwardKinematics(currentParams, baseOrientation);
                 endEffectorPosition.copy(updatedJoints[updatedJoints.length-1].position);
            }
        }
        
        // After all iterations, check one last time if we're close enough
        const finalJoints = getForwardKinematics(currentParams, baseOrientation);
        if (finalJoints[finalJoints.length-1].position.distanceTo(target) < tolerance * 5) {
            resolve(currentParams);
        } else {
            resolve(null);
        }
    });
};
