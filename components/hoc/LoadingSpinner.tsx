"use client"

import { useRef, useEffect, useState } from "react"
import * as BABYLON from "@babylonjs/core"
import { Progress } from "@/components/ui/progress"

const AnimatedLogoSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new BABYLON.Engine(canvasRef.current, true)
    const scene = new BABYLON.Scene(engine)

    const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene)
    camera.minZ = 0.001
    camera.attachControl(canvasRef.current, true)

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 4, segments: 64 }, scene)

    const material = new BABYLON.StandardMaterial("sphereMaterial", scene)

    const texture = new BABYLON.Texture(
      "/ssg-logo.jpg",
      scene,
      true,
      false,
      BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
      () => {
        console.log("Texture loaded successfully")
        setError(null)
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (message?: string, exception?: any) => {
        console.error("Error loading texture:", message, exception)
        setError("Failed to load the image. Please check the file path.")
      },
    )

    material.diffuseTexture = texture
    material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2)
    material.specularPower = 32
    sphere.material = material

    const rotationAnimation = new BABYLON.Animation(
      "rotationAnimation",
      "rotation.y",
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    )

    const rotationKeys = [
      { frame: 0, value: 0 },
      { frame: 100, value: 2 * Math.PI },
    ]
    rotationAnimation.setKeys(rotationKeys)
    sphere.animations.push(rotationAnimation)

    const pulsatingAnimation = new BABYLON.Animation(
      "pulsatingAnimation",
      "scaling",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    )

    const pulsatingKeys = [
      { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
      { frame: 50, value: new BABYLON.Vector3(1.05, 1.05, 1.05) },
      { frame: 100, value: new BABYLON.Vector3(1, 1, 1) },
    ]
    pulsatingAnimation.setKeys(pulsatingKeys)
    sphere.animations.push(pulsatingAnimation)

    scene.beginAnimation(sphere, 0, 100, true)

    const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 10, -10), scene)
    light.intensity = 0.8

    let alpha = 0
    scene.registerBeforeRender(() => {
      alpha += 0.01
      setProgress(Math.sin(alpha) * 50 + 50)
    })

    engine.runRenderLoop(() => {
      scene.render()
    })

    window.addEventListener("resize", () => {
      engine.resize()
    })

    return () => {
      engine.dispose()
    }
  }, [])

  return (
    <div className="loading-container w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center bg-gray-800">
      <canvas ref={canvasRef} className="w-full h-[600px] mb-8" />
      <div className="w-full max-w-md">
        <label htmlFor="loading-progress" className="sr-only">
          Loading progress
        </label>
        <Progress id="loading-progress" value={progress} className="w-full h-2 bg-gray-200" />
      </div>
      {error ? (
        <p className="mt-4 text-lg font-semibold text-red-500" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-lg font-semibold text-white">Loading: {Math.round(progress)}%</p>
      )}
    </div>
  )
}

export default AnimatedLogoSphere

