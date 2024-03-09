import { useSphere } from '@react-three/cannon'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Outlines } from './Outlines'

const count = 40
const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const baubleMaterial = new THREE.MeshStandardMaterial({ colo: "white", roughness: 0, envMapIntensity: 1 })

export default function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }) {

    const { outlines } = useControls({ outlines: { value: 0.0, step: 0.01, min: 0, max: 0.05 } })
    const texture = useTexture('cross.jpg')
    const [ref, api] = useSphere(() => ({ args: [1], mass: 1, angularDamping: 0.1, linearDamping: 0.65, position: [rfs(20), rfs(20), rfs(20)] }))

    useFrame((state) => {
        for (let i = 0; i < count; i++) {
            // Get current sphere
            ref.current.getMatrixAt(i, mat)
            // Normalize the position and multiply by a negative force.
            // This is enough to drive it towards the center-point.
            api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-40).toArray(), [0, 0, 0])
        }
    })

    return (
        <instancedMesh ref={ref} castShadow receiveShadow args={[sphereGeometry, baubleMaterial, count]} material-map={texture}>
            <Outlines thickness={outlines} />
        </instancedMesh>
    )
}