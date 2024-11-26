"use client"; // Ensure this is a client-side component

import { useRef, useEffect } from "react";
import * as BABYLON from "@babylonjs/core"; // Import Babylon.js core module

const LoadingSpinner = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Reference for the canvas element

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the Babylon.js engine and scene
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);

    // Create the camera, light, and 3D torus knot
    const camera = new BABYLON.ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 4,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.minZ = 0.001;
    camera.attachControl(canvasRef.current, true);

    const light = new BABYLON.HemisphericLight(
      "light1",
      BABYLON.Vector3.Up(),
      scene
    );
    light.intensity = 0.7;

    // Create a torus knot with a glowing effect
    const torusKnot = BABYLON.MeshBuilder.CreateTorusKnot(
      "torusKnot",
      {
        radius: 1,
        radialSegments: 64, // Sets the radial segments of the knot
        tubularSegments: 32, // Sets the tubular segments of the knot
      },
      scene
    );
    torusKnot.position.y = 1;

    const material = new BABYLON.StandardMaterial("torusMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0.51, 0.32, 0.99); // Violet color
    material.emissiveColor = new BABYLON.Color3(0.51, 0.32, 0.99); // Emissive effect for a glowing look
    torusKnot.material = material;

    // Start the render loop
    engine.runRenderLoop(() => {
      scene.render();
      torusKnot.rotation.y += 0.01; // Rotate the torus knot to animate
    });

    // Resize the engine when the window is resized
    window.addEventListener("resize", () => {
      engine.resize();
    });

    // Cleanup on component unmount
    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <div className="loading-container w-full h-full absolute top-0 left-0 flex items-center justify-center bg-black/50">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Render the Babylon.js scene inside the canvas */}
    </div>
  );
};

export default LoadingSpinner;
