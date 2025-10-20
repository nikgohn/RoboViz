# RoboViz: A Denavit-Hartenberg Robotics Visualizer

RoboViz is a web-based educational tool for designing, visualizing, and analyzing robotic manipulators using the Denavit-Hartenberg (DH) convention. It provides an interactive environment for students, educators, and hobbyists to understand the principles of robot kinematics.

This application is built with Next.js, React, Three.js for 3D rendering, and shadcn/ui for components.


## Features

- **DH Parameter Editor**: Interactively add, remove, and modify the `a` (length), `α` (twist), `d` (offset), and `θ` (angle) parameters for each link of a robotic arm.
- **Real-Time 3D Visualization**: See your robot model update instantly in a 3D canvas as you adjust its parameters.
- **Forward Kinematics**: Use sliders to manually control the variable joints (`θ` for revolute, `d` for prismatic) and see the end-effector's position update in real-time.
- **Inverse Kinematics (IK)**: Set a target 3D coordinate for the end-effector and use the built-in Cyclic Coordinate Descent (CCD) solver to automatically calculate the required joint configurations.
- **Workspace Configuration**: Define the operational limits (min/max) for each variable joint, which constrains both manual control and IK solutions.
- **Kinematic Analysis**: View automatically generated tables for:
    - Kinematic Pairs (Joints)
    - Mechanism Links
    - Cumulative Euler Angles for each link frame.
- **Transformation Matrices**: Inspect the symbolic and numeric transformation matrices (`Aᵢ`) for each link, as well as the final transformation matrix from the base to the end-effector.
- **IK Algorithm Explorer**: Understand how the CCD algorithm works with a step-by-step breakdown of the formulas applied to your specific robot configuration.
- **Import/Export**: Save your robot designs to a CSV file and import them later to continue your work.
- **Multi-language Support**: The interface is available in English and Russian.

## Getting Started

To get this project running locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or later)
- npm, yarn, or pnpm

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

## Application Structure

The application is organized into several pages, each focusing on a different aspect of robot kinematics:

- **Editor**: The main page for defining DH parameters.
- **Kinematics**: A focused view for controlling the robot's joints manually.
- **Matrices**: Displays the symbolic and numeric transformation matrices.
- **Analysis**: Provides tables for kinematic pairs, links, and Euler angles.
- **Workspace**: Set the minimum and maximum limits for each variable joint.
- **IK (Inverse Kinematics)**: The interface for setting a target and running the IK solver.
- **IK Solution**: An educational page that explains the IK algorithm as it applies to your robot.
