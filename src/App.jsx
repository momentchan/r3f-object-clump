import { Debug, Physics } from "@react-three/cannon";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import Pointer from "./Pointer";
import Clump from "./Clump";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";

export default function App() {
    return <>
        <Canvas
            gl={{ antialias: false }}
            dpr={[1, 1.5]}
            shadows
            camera={{
                fov: 35,
                near: 1,
                far: 40,
                position: [0, 0, 20]
            }}>

            <color attach='background' args={["#dfdfdf"]} />

            {/* add light variances  */}
            <Environment files="adamsbridge.hdr" />
            <ambientLight intensity={1.5} />
            <spotLight intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />

            <Physics gravity={[0, 2, 0]} iterations={10}>
                <Debug color="black" scale={1.1}>
                    <Pointer />
                    <Clump />
                    {/* children */}
                </Debug>
            </Physics>


            <EffectComposer disableNormalPass multisampling={0}>
                <N8AO halfRes color='black' aoRadius={2} intensity={1} aoSamples={6} denoiseSamples={4} />
                <SMAA />
            </EffectComposer>
        </Canvas>
    </>
}