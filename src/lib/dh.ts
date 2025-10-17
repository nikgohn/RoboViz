
import * as THREE from 'three';

/**
 * Creates a Denavit-Hartenberg transformation matrix.
 * @param a - link length (translation along new x-axis)
 * @param alpha - link twist (rotation about new x-axis) in degrees
 * @param d - link offset (translation along previous z-axis)
 * @param theta - joint angle (rotation about previous z-axis) in degrees
 * @returns THREE.Matrix4 representing the transformation
 */
export function createDHMatrix(a: number, alpha: number, d: number, theta: number): THREE.Matrix4 {
  const rotZ = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(theta));
  const transZ = new THREE.Matrix4().makeTranslation(0, 0, d);
  const transX = new THREE.Matrix4().makeTranslation(a, 0, 0);
  const rotX = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(alpha));

  // The order of multiplication is T = Rot_z * Trans_z * Trans_x * Rot_x
  const matrix = new THREE.Matrix4();
  matrix.multiply(rotZ);
  matrix.multiply(transZ);
  matrix.multiply(transX);
  matrix.multiply(rotX);

  return matrix;
}

    