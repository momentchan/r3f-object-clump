import { useSphere } from '@react-three/cannon'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Outlines } from './r3f-gist/effect/Outlines'
import { useEffect, useMemo, useRef, useState } from 'react'
import ThreeCustomShaderMaterial from 'three-custom-shader-material'
import { patchShaders } from 'gl-noise'

const count = 200
const rfs = THREE.MathUtils.randFloatSpread

const shader = {
    vertex: /* glsl */ `
      attribute float speedBuffer;
      varying float vSpeedBuffer;
      void main() {
        vSpeedBuffer = speedBuffer;
        csm_PositionRaw = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);
      }
      `,
    fragment: /* glsl */ `
      varying float vSpeedBuffer;
      void main() {
        csm_DiffuseColor.r+= vSpeedBuffer;
      }
      `,
}

export default function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }) {

    const { outlines } = useControls({ outlines: { value: 0.0, step: 0.01, min: 0, max: 0.05 } })
    const texture = useTexture('ME.png')
    const [ref, api] = useSphere(() => ({ args: [1], mass: 1, angularDamping: 0.1, linearDamping: 0.65, position: [rfs(20), rfs(20), rfs(20)] }))

    const speedBuffer = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    const vectorArrayRef = useRef(Array.from({ length: count }, () => new THREE.Vector3()));

    useEffect(() => {
        for (let i = 0; i < count; i++) {
            const unsubscribe = api.at(i).velocity.subscribe((v) => (vectorArrayRef.current[i] = v))
        }
        return () => {
            for (let i = 0; i < count; i++) {
                const unsubscribe = api.at(i).velocity.subscribe((v) => (vectorArrayRef.current[i] = v))
            }
        }
    })
    const args = useMemo(() => [null, null, count], [count])

    useFrame((state, delta) => {
        for (let i = 0; i < count; i++) {
            // Get current sphere
            ref.current.getMatrixAt(i, mat)
            // Normalize the position and multiply by a negative force.
            // This is enough to drive it towards the center-point.

            api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-40).toArray(), [0, 0, 0])

            const vel = vectorArrayRef.current[i]
            var speed = Math.sqrt(vel[0] ** 2 + vel[1] ** 2 + vel[2] ** 2);
            speed = isNaN(speed) ? 0 : speed
            speedBuffer.setX(i, speed / 30)
        }
        speedBuffer.needsUpdate = true
        ref.current.geometry.setAttribute('speedBuffer', speedBuffer);
    })

    return (
        <instancedMesh ref={ref} castShadow receiveShadow args={args}>
            <sphereGeometry args={[1, 32, 32]} />
            <ThreeCustomShaderMaterial
                baseMaterial={THREE.MeshStandardMaterial}
                uniforms={{ uTex: texture }}
                roughness={0}
                envMapIntensity={1}
                color='white'
                map={texture}
                fragmentShader={patchShaders(shader.fragment)}
                vertexShader={patchShaders(shader.vertex)}
            >
            </ThreeCustomShaderMaterial>
            <Outlines thickness={outlines} />
        </instancedMesh>
    )
}