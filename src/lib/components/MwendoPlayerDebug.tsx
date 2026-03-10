import { Billboard, Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { startTransition, useRef, useState, type RefObject } from "react";
import { DoubleSide, Vector3, type Group } from "three";
import type { MwendoMovementMode, MwendoVec3 } from "../types";

type JointRefMap = {
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

type PlayerDebugStateRef = RefObject<{
  facing: number;
  movementMode: MwendoMovementMode;
} | null>;

type JointSnapshot = {
  key: string;
  position: MwendoVec3;
};

type PlayerDebugSnapshot = {
  bodyPosition: MwendoVec3;
  velocityEnd: MwendoVec3;
  facingEnd: MwendoVec3;
  movementMode: MwendoMovementMode;
  joints: JointSnapshot[];
};

type MwendoPlayerDebugProps = {
  bodyRef: RefObject<RapierRigidBody | null>;
  capsuleHalfHeight: number;
  capsuleRadius: number;
  debugStateRef: PlayerDebugStateRef;
  joints: JointRefMap;
};

const tempVector = new Vector3();
const linkPairs = [
  ["pelvis", "spine"],
  ["spine", "head"],
  ["spine", "leftUpperArm"],
  ["leftUpperArm", "leftLowerArm"],
  ["spine", "rightUpperArm"],
  ["rightUpperArm", "rightLowerArm"],
  ["pelvis", "leftUpperLeg"],
  ["leftUpperLeg", "leftLowerLeg"],
  ["pelvis", "rightUpperLeg"],
  ["rightUpperLeg", "rightLowerLeg"],
] as const;

function toTuple(vector: { x: number; y: number; z: number }): MwendoVec3 {
  return [vector.x, vector.y, vector.z];
}

function getGroupPosition(ref: RefObject<Group | null>) {
  const object = ref.current;

  if (!object) {
    return null;
  }

  object.getWorldPosition(tempVector);
  return toTuple(tempVector);
}

export function MwendoPlayerDebug({
  bodyRef,
  capsuleHalfHeight,
  capsuleRadius,
  debugStateRef,
  joints,
}: MwendoPlayerDebugProps) {
  const [snapshot, setSnapshot] = useState<PlayerDebugSnapshot | null>(null);
  const frameCounter = useRef(0);

  useFrame(() => {
    frameCounter.current += 1;

    if (frameCounter.current % 2 !== 0) {
      return;
    }

    const body = bodyRef.current;
    const debugState = debugStateRef.current;

    if (!body || !debugState) {
      return;
    }

    const translation = body.translation();
    const velocity = body.linvel();
    const velocityScale = 0.2;
    const facingScale = 1;
    const bodyPosition: MwendoVec3 = [translation.x, translation.y, translation.z];
    const velocityEnd: MwendoVec3 = [
      translation.x + velocity.x * velocityScale,
      translation.y + 0.35 + velocity.y * velocityScale,
      translation.z + velocity.z * velocityScale,
    ];
    const facingEnd: MwendoVec3 = [
      translation.x + Math.sin(debugState.facing) * facingScale,
      translation.y + 0.6,
      translation.z + Math.cos(debugState.facing) * facingScale,
    ];
    const jointRefs: Array<[string, RefObject<Group | null>]> = [
      ["pelvis", joints.pelvisRef],
      ["spine", joints.spineRef],
      ["head", joints.headRef],
      ["leftUpperArm", joints.leftUpperArmRef],
      ["leftLowerArm", joints.leftLowerArmRef],
      ["rightUpperArm", joints.rightUpperArmRef],
      ["rightLowerArm", joints.rightLowerArmRef],
      ["leftUpperLeg", joints.leftUpperLegRef],
      ["leftLowerLeg", joints.leftLowerLegRef],
      ["rightUpperLeg", joints.rightUpperLegRef],
      ["rightLowerLeg", joints.rightLowerLegRef],
    ];
    const jointEntries: JointSnapshot[] = jointRefs.flatMap(([key, ref]) => {
      const position = getGroupPosition(ref);
      return position ? [{ key, position }] : [];
    });

    startTransition(() => {
      setSnapshot({
        bodyPosition,
        velocityEnd,
        facingEnd,
        movementMode: debugState.movementMode,
        joints: jointEntries,
      });
    });
  });

  if (!snapshot) {
    return null;
  }

  const jointMap = new Map(snapshot.joints.map((joint) => [joint.key, joint.position]));
  const debugLabelPosition: MwendoVec3 = [
    snapshot.bodyPosition[0],
    snapshot.bodyPosition[1] + 2.15,
    snapshot.bodyPosition[2],
  ];
  const capsulePosition: MwendoVec3 = [
    snapshot.bodyPosition[0],
    snapshot.bodyPosition[1] + capsuleHalfHeight + capsuleRadius,
    snapshot.bodyPosition[2],
  ];

  return (
    <group>
      <mesh position={capsulePosition} renderOrder={12}>
        <capsuleGeometry args={[capsuleRadius, capsuleHalfHeight * 2, 8, 16]} />
        <meshBasicMaterial
          color="#8fe6ff"
          depthTest={false}
          depthWrite={false}
          opacity={0.28}
          side={DoubleSide}
          transparent
          wireframe
        />
      </mesh>

      <Line
        color="#ff9f5b"
        depthTest={false}
        lineWidth={1.5}
        points={[
          [
            snapshot.bodyPosition[0],
            snapshot.bodyPosition[1] + 0.6,
            snapshot.bodyPosition[2],
          ],
          snapshot.facingEnd,
        ]}
      />
      <Line
        color="#56dbff"
        depthTest={false}
        lineWidth={1.3}
        points={[
          [
            snapshot.bodyPosition[0],
            snapshot.bodyPosition[1] + 0.35,
            snapshot.bodyPosition[2],
          ],
          snapshot.velocityEnd,
        ]}
      />

      {linkPairs.flatMap(([from, to]) => {
        const start = jointMap.get(from);
        const end = jointMap.get(to);

        if (!start || !end) {
          return [];
        }

        return (
          <Line
            key={`${from}:${to}`}
            color="#f4f7fb"
            depthTest={false}
            lineWidth={1.1}
            points={[start, end]}
          />
        );
      })}

      {snapshot.joints.map((joint) => (
        <mesh key={joint.key} position={joint.position} renderOrder={14}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial
            color="#ffde8a"
            depthTest={false}
            depthWrite={false}
            opacity={0.86}
            transparent
          />
        </mesh>
      ))}

      <Billboard position={debugLabelPosition}>
        <group>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[2.4, 0.78]} />
            <meshBasicMaterial
              color="#081725"
              depthWrite={false}
              opacity={0.58}
              side={DoubleSide}
              transparent
            />
          </mesh>
          <Text
            anchorX="center"
            anchorY="middle"
            color="#e8f8ff"
            fontSize={0.12}
            position={[0, 0.12, 0]}
          >
            PLAYER DEBUG
          </Text>
          <Text
            anchorX="center"
            anchorY="middle"
            color="#9fd6e8"
            fontSize={0.09}
            position={[0, -0.08, 0]}
          >
            {snapshot.movementMode}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
