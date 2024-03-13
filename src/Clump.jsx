import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { Outlines } from './r3f-gist/effect/Outlines'
import { useMemo, useRef } from 'react'
import ThreeCustomShaderMaterial from 'three-custom-shader-material'
import { patchShaders } from 'gl-noise'
import { InstancedRigidBodies, vec3 } from '@react-three/rapier'

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
    const texture = useTexture('eye.png')
    const { outlines } = useControls({ outlines: { value: 0.0, step: 0.01, min: 0, max: 0.05 } })
    const speedBuffer = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);

    const rigidBodies = useRef();
    const mesh = useRef()
    const instances = useMemo(() => {
        const instances = [];

        for (let i = 0; i < count; i++) {
            instances.push({
                key: "instance_" + i,
                position: [rfs(20), rfs(20), rfs(20)],
                rotation: [Math.random(), Math.random(), Math.random()],
            })
        }
        return instances
    }, [])

    useFrame((state, delta) => {
        if (!rigidBodies.current)
            return

        for (let i = 0; i < count; i++) {
            const api = rigidBodies.current[i]
            if (api == null) continue
            const pos = vec3(api.translation())
            api.applyImpulse(pos.normalize().multiplyScalar(-1))
            const vel = api.linvel()
            const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
            speedBuffer.setX(i, Math.pow(speed / 20, 2))
        }

        speedBuffer.needsUpdate = true
        mesh.current.geometry.setAttribute('speedBuffer', speedBuffer);
    })

    return (
        <InstancedRigidBodies
            ref={rigidBodies}
            instances={instances}
            friction={1}
            restitution={0}
            colliders='ball'>

            <instancedMesh
                ref={mesh}
                castShadow receiveShadow args={[null, null, count]}>
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
        </InstancedRigidBodies>
    )
}