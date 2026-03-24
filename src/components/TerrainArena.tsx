import { RigidBody, TrimeshCollider } from "@react-three/rapier";
import { useMemo } from "react";
import {
  createDemoTerrainGeometry,
  getDemoTerrainSpawnPosition,
  sampleDemoTerrainHeight,
} from "./demoTerrain";

function TerrainOutcrop(props: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  const [x, z] = [props.position[0], props.position[2]];
  const baseHeight = sampleDemoTerrainHeight(x, z);

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={[x, baseHeight + props.position[1], z]}
      rotation={props.rotation}
    >
      <mesh castShadow receiveShadow scale={props.scale}>
        <boxGeometry />
        <meshStandardMaterial
          color={props.color}
          metalness={0.03}
          roughness={0.94}
        />
      </mesh>
    </RigidBody>
  );
}

export function TerrainArena() {
  const terrain = useMemo(() => createDemoTerrainGeometry(), []);

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <TrimeshCollider
          args={[terrain.colliderVertices, terrain.colliderIndices]}
          friction={1.15}
          restitution={0}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={terrain.geometry}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#798165"
            metalness={0.02}
            roughness={0.98}
            vertexColors
          />
        </mesh>
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]} receiveShadow>
        <circleGeometry args={[140, 80]} />
        <meshStandardMaterial color="#8f7a5d" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.37, 0]}>
        <ringGeometry args={[24, 58, 72]} />
        <meshBasicMaterial color="#a5b989" transparent opacity={0.14} />
      </mesh>

      <TerrainOutcrop
        color="#726a60"
        position={[18, 0.75, -14]}
        rotation={[0.12, -0.4, -0.16]}
        scale={[7.2, 1.4, 5.4]}
      />
      <TerrainOutcrop
        color="#625c55"
        position={[-26, 0.9, 8]}
        rotation={[0.18, 0.52, 0.12]}
        scale={[5.8, 1.6, 6.6]}
      />
      <TerrainOutcrop
        color="#7d7568"
        position={[38, 0.65, 30]}
        rotation={[-0.08, 0.22, 0.18]}
        scale={[6.4, 1.2, 4.2]}
      />

      <mesh
        position={getDemoTerrainSpawnPosition(0, 18, 0.08)}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.7, 2.25, 48]} />
        <meshBasicMaterial color="#d8ebba" transparent opacity={0.32} />
      </mesh>
    </>
  );
}
