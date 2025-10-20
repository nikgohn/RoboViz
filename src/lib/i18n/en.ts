
export const en = {
  // General
  editor: 'Editor',
  kinematics: 'Kinematics',
  analysis: 'Analysis',
  matrices: 'Matrices',
  workspace: 'Workspace',
  ik: 'IK',
  ikSolution: 'IK Solution',
  showAxes: 'Show Axes',
  showCoordinates: 'Show Coords',
  reset: 'Reset',
  calculate: 'Calculate',
  calculating: 'Calculating...',
  
  // DH Panel
  dhParameters: 'DH Parameters',
  dhParametersDescription: 'Adjust the parameters for each link of the robotic arm.',
  addLink: 'Add Link',
  import: 'Import',
  export: 'Export',
  exportToExcel: 'Export to Excel',
  link: 'Link',
  linkLength: 'aᵢ (len)',
  linkTwist: 'αᵢ (twist)',
  linkOffset: 'dᵢ (off)',
  thetaOffset: 'θᵢ (off)',
  dVariable: 'dᵢ (var)',
  jointAngle: 'θᵢ (rot)',
  variable: 'Var',
  fixed: 'Fixed',
  baseOrientation: 'Base Orientation',

  // Kinematics Page
  kinematicsControl: 'Kinematics Control',
  kinematicsControlDescription: 'Adjust the variable joints of the robotic arm.',
  endEffectorPosition: 'End-Effector Position',
  noVariableParameters: 'No variable parameters defined. Go to the Editor to set `d` as variable or `theta` as not fixed.',
  offset: 'offset',
  rotation: 'rotation',

  // Analysis Page
  kinematicPairsTableTitle: 'Table 1 - Kinematic Pairs',
  tableHeaderDesignation: 'Designation',
  tableHeaderLinks: 'Links',
  tableHeaderName: 'Name',
  tableHeaderClass: 'Class',
  jointTypeRevolute: 'Revolute',
  jointTypePrismatic: 'Prismatic',
  jointTypeFixed: 'Fixed',

  mechanismLinksTableTitle: 'Table 2 - Links of the mechanism',
  tableHeaderMotionType: 'Type of motion',
  linkTypeBase: 'Base',
  linkTypeSlider: 'Slider',
  linkTypeCrank: 'Crank',
  linkTypeFixed: 'Fixed',
  motionTypeTranslational: 'Translational',
  motionTypeRotational: 'Rotational',

  eulerAnglesTableTitle: 'Table 3 - Euler Angles',
  baseTool: 'Base-Tool',

  // Matrices Page
  transformationMatrices: 'Symbolic Transformation Matrices',
  transformationMatricesDescription: 'Symbolic representation of the transformation matrix for each link.',
  baseTransform: 'Base Transform',
  finalTransformationMatrix: 'Final Transformation Matrix',

  // IK Page
  ikSetup: 'Inverse Kinematics Setup',
  ikSetupDescription: 'Define the target position and orientation for the end-effector.',
  targetPosition: 'Target Position',
  targetOrientation: 'Target Orientation',
  ikNotAvailable: 'IK calculation not yet available.',

  // IK Solution Page
  ikSolutionTitle: 'IK Algorithmic Solution',
  ikSolutionDescription: 'This page describes the Cyclic Coordinate Descent (CCD) algorithm used for inverse kinematics.',
  ikCcdAlgorithm: 'CCD Algorithm',
  ikCcdAlgorithmDescription: 'An iterative method that adjusts one joint at a time to minimize the distance between the end-effector and the target.',
  ikIterationProcess: 'Iteration Process',
  ikIterationProcessStep1: '1. Start from the last joint (n) and move towards the base (joint 1).',
  ikIterationProcessStep2: '2. For each joint, calculate the rotation or translation needed to align the end-effector with the target.',
  ikIterationProcessStep3: '3. Apply the change to the joint variable (θᵢ or dᵢ), respecting its limits.',
  ikIterationProcessStep4: '4. Update the position of the entire kinematic chain.',
  ikIterationProcessStep5: '5. Repeat for a fixed number of iterations or until the end-effector is close enough to the target.',
  ikRevoluteJoints: 'Revolute Joints (θᵢ)',
  ikRevoluteJointsDescription: 'For a revolute joint, we calculate the angle Δθ to rotate the end-effector towards the target.',
  ikPrismaticJoints: 'Prismatic Joints (dᵢ)',
  ikPrismaticJointsDescription: 'For a prismatic joint, we calculate the distance Δd to move the end-effector towards the target along the joint axis.',

  // Workspace Page
  workspaceVisualization: 'Workspace Limits',
  workspaceVisualizationDescription: "Define the minimum and maximum limits for each variable joint (qᵢ). These limits will constrain the robot's movement in the Kinematics and IK modes.",
};
