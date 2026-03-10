import type { RefObject } from "react";
import type { Group } from "three";
import type { MovementMode } from "../store/useGameStore";

type PrimitiveHeroRig = {
  rootRef: RefObject<Group | null>;
  pelvisRef: RefObject<Group | null>;
  spineRef: RefObject<Group | null>;
  headRef: RefObject<Group | null>;
  leftUpperArmRef: RefObject<Group | null>;
  leftLowerArmRef: RefObject<Group | null>;
  rightUpperArmRef: RefObject<Group | null>;
  rightLowerArmRef: RefObject<Group | null>;
  leftUpperLegRef: RefObject<Group | null>;
  leftLowerLegRef: RefObject<Group | null>;
  rightUpperLegRef: RefObject<Group | null>;
  rightLowerLegRef: RefObject<Group | null>;
};

const BODY_COLORS: Record<MovementMode, string> = {
  idle: "#314158",
  walk: "#2d6cdf",
  run: "#f97316",
  crouch: "#10b981",
};

function TubeSegment(props: {
  color: string;
  length: number;
  radius: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  roughness?: number;
  metalness?: number;
}) {
  return (
    <mesh
      castShadow
      position={props.position}
      rotation={props.rotation}
    >
      <capsuleGeometry args={[props.radius, props.length, 10, 18]} />
      <meshStandardMaterial
        color={props.color}
        roughness={props.roughness ?? 0.58}
        metalness={props.metalness ?? 0.06}
      />
    </mesh>
  );
}

function JointSphere(props: {
  color: string;
  radius: number;
  position?: [number, number, number];
  roughness?: number;
  metalness?: number;
}) {
  return (
    <mesh castShadow position={props.position}>
      <sphereGeometry args={[props.radius, 20, 20]} />
      <meshStandardMaterial
        color={props.color}
        roughness={props.roughness ?? 0.7}
        metalness={props.metalness ?? 0.04}
      />
    </mesh>
  );
}

export function PrimitiveHero(props: {
  movementMode: MovementMode;
  rig: PrimitiveHeroRig;
}) {
  const bodyColor = BODY_COLORS[props.movementMode];

  return (
    <group ref={props.rig.rootRef} position={[0, 0.02, 0]}>
      <group ref={props.rig.pelvisRef} position={[0, 0.9, 0]}>
        <TubeSegment
          color="#213248"
          length={0.44}
          radius={0.14}
          position={[0, -0.05, 0]}
          rotation={[0, 0, Math.PI / 2]}
          roughness={0.7}
        />
        <JointSphere color="#314158" radius={0.11} position={[-0.24, -0.05, 0]} />
        <JointSphere color="#314158" radius={0.11} position={[0.24, -0.05, 0]} />

        <group ref={props.rig.spineRef} position={[0, 0.38, 0]}>
          <TubeSegment
            color={bodyColor}
            length={0.96}
            radius={0.28}
            position={[0, 0.44, 0]}
            roughness={0.42}
            metalness={0.12}
          />
          <TubeSegment
            color="#d8dee9"
            length={0.66}
            radius={0.08}
            position={[0, 0.95, 0.02]}
            rotation={[0, 0, Math.PI / 2]}
            roughness={0.46}
          />
          <JointSphere color="#fde68a" radius={0.07} position={[-0.17, 0.36, 0.22]} roughness={0.4} />
          <JointSphere color="#f4f7fb" radius={0.04} position={[0.17, 0.28, 0.22]} roughness={0.3} />

          <group ref={props.rig.headRef} position={[0, 1.15, 0.04]}>
            <TubeSegment
              color="#e8c39e"
              length={0.12}
              radius={0.07}
              position={[0, -0.26, -0.02]}
              roughness={0.84}
            />
            <mesh castShadow>
              <sphereGeometry args={[0.27, 24, 24]} />
              <meshStandardMaterial color="#f1d7b8" roughness={0.88} />
            </mesh>
            <TubeSegment
              color="#1f2937"
              length={0.26}
              radius={0.06}
              position={[0, 0.04, 0.18]}
              rotation={[0, 0, Math.PI / 2]}
              roughness={0.54}
            />
          </group>

          <group ref={props.rig.leftUpperArmRef} position={[-0.56, 0.78, 0]}>
            <JointSphere color="#7aa4e0" radius={0.09} />
            <TubeSegment color="#5c89d6" length={0.5} radius={0.09} position={[0, -0.32, 0]} />
            <group ref={props.rig.leftLowerArmRef} position={[0, -0.63, 0]}>
              <JointSphere color="#7aa4e0" radius={0.08} />
              <TubeSegment color="#3f6fa9" length={0.48} radius={0.08} position={[0, -0.28, 0]} />
              <TubeSegment color="#f1d7b8" length={0.12} radius={0.06} position={[0, -0.56, 0.02]} />
            </group>
          </group>

          <group ref={props.rig.rightUpperArmRef} position={[0.56, 0.78, 0]}>
            <JointSphere color="#7aa4e0" radius={0.09} />
            <TubeSegment color="#5c89d6" length={0.5} radius={0.09} position={[0, -0.32, 0]} />
            <group ref={props.rig.rightLowerArmRef} position={[0, -0.63, 0]}>
              <JointSphere color="#7aa4e0" radius={0.08} />
              <TubeSegment color="#3f6fa9" length={0.48} radius={0.08} position={[0, -0.28, 0]} />
              <TubeSegment color="#f1d7b8" length={0.12} radius={0.06} position={[0, -0.56, 0.02]} />
            </group>
          </group>
        </group>

        <group ref={props.rig.leftUpperLegRef} position={[-0.24, -0.08, 0]}>
          <JointSphere color="#314158" radius={0.1} />
          <TubeSegment color="#203244" length={0.64} radius={0.11} position={[0, -0.4, 0]} roughness={0.66} />
          <group ref={props.rig.leftLowerLegRef} position={[0, -0.82, 0]}>
            <JointSphere color="#314158" radius={0.09} />
            <TubeSegment color="#162434" length={0.56} radius={0.095} position={[0, -0.34, 0]} roughness={0.7} />
            <TubeSegment
              color="#2d3748"
              length={0.24}
              radius={0.08}
              position={[0, -0.74, 0.1]}
              rotation={[Math.PI / 2, 0, 0]}
              roughness={0.62}
            />
          </group>
        </group>

        <group ref={props.rig.rightUpperLegRef} position={[0.24, -0.08, 0]}>
          <JointSphere color="#314158" radius={0.1} />
          <TubeSegment color="#203244" length={0.64} radius={0.11} position={[0, -0.4, 0]} roughness={0.66} />
          <group ref={props.rig.rightLowerLegRef} position={[0, -0.82, 0]}>
            <JointSphere color="#314158" radius={0.09} />
            <TubeSegment color="#162434" length={0.56} radius={0.095} position={[0, -0.34, 0]} roughness={0.7} />
            <TubeSegment
              color="#2d3748"
              length={0.24}
              radius={0.08}
              position={[0, -0.74, 0.1]}
              rotation={[Math.PI / 2, 0, 0]}
              roughness={0.62}
            />
          </group>
        </group>
      </group>
    </group>
  );
}
