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

export function PrimitiveHero(props: {
  movementMode: MovementMode;
  rig: PrimitiveHeroRig;
}) {
  const bodyColor = BODY_COLORS[props.movementMode];

  return (
    <group ref={props.rig.rootRef} position={[0, 0.02, 0]}>
      <group ref={props.rig.pelvisRef} position={[0, 0.9, 0]}>
        <mesh castShadow position={[0, -0.06, 0]} scale={[0.7, 0.28, 0.32]}>
          <boxGeometry />
          <meshStandardMaterial color="#213248" roughness={0.72} />
        </mesh>

        <group ref={props.rig.spineRef} position={[0, 0.38, 0]}>
          <mesh castShadow position={[0, 0.42, 0]} scale={[0.78, 0.96, 0.36]}>
            <boxGeometry />
            <meshStandardMaterial color={bodyColor} roughness={0.44} metalness={0.12} />
          </mesh>
          <mesh castShadow position={[0, 0.94, 0.02]} scale={[0.84, 0.18, 0.3]}>
            <boxGeometry />
            <meshStandardMaterial color="#d8dee9" roughness={0.48} />
          </mesh>
          <mesh castShadow position={[0, 0.16, 0.19]} scale={[0.36, 0.22, 0.1]}>
            <boxGeometry />
            <meshStandardMaterial color="#111827" roughness={0.52} />
          </mesh>
          <mesh castShadow position={[-0.18, 0.34, 0.2]} scale={[0.16, 0.16, 0.12]}>
            <boxGeometry />
            <meshStandardMaterial color="#fde68a" roughness={0.46} />
          </mesh>

          <group ref={props.rig.headRef} position={[0, 1.15, 0.04]}>
            <mesh castShadow>
              <sphereGeometry args={[0.27, 24, 24]} />
              <meshStandardMaterial color="#f1d7b8" roughness={0.88} />
            </mesh>
            <mesh castShadow position={[0, 0.02, 0.18]} scale={[0.46, 0.16, 0.16]}>
              <boxGeometry />
              <meshStandardMaterial color="#1f2937" roughness={0.56} />
            </mesh>
            <mesh castShadow position={[0, -0.29, -0.02]} scale={[0.18, 0.12, 0.18]}>
              <boxGeometry />
              <meshStandardMaterial color="#e8c39e" roughness={0.84} />
            </mesh>
          </group>

          <group ref={props.rig.leftUpperArmRef} position={[-0.56, 0.78, 0]}>
            <mesh castShadow position={[0, -0.31, 0]} scale={[0.2, 0.66, 0.2]}>
              <boxGeometry />
              <meshStandardMaterial color="#5c89d6" roughness={0.58} />
            </mesh>
            <group ref={props.rig.leftLowerArmRef} position={[0, -0.63, 0]}>
              <mesh castShadow position={[0, -0.28, 0]} scale={[0.18, 0.62, 0.18]}>
                <boxGeometry />
                <meshStandardMaterial color="#3f6fa9" roughness={0.62} />
              </mesh>
              <mesh castShadow position={[0, -0.62, 0.03]} scale={[0.17, 0.14, 0.22]}>
                <boxGeometry />
                <meshStandardMaterial color="#f1d7b8" roughness={0.84} />
              </mesh>
            </group>
          </group>

          <group ref={props.rig.rightUpperArmRef} position={[0.56, 0.78, 0]}>
            <mesh castShadow position={[0, -0.31, 0]} scale={[0.2, 0.66, 0.2]}>
              <boxGeometry />
              <meshStandardMaterial color="#5c89d6" roughness={0.58} />
            </mesh>
            <group ref={props.rig.rightLowerArmRef} position={[0, -0.63, 0]}>
              <mesh castShadow position={[0, -0.28, 0]} scale={[0.18, 0.62, 0.18]}>
                <boxGeometry />
                <meshStandardMaterial color="#3f6fa9" roughness={0.62} />
              </mesh>
              <mesh castShadow position={[0, -0.62, 0.03]} scale={[0.17, 0.14, 0.22]}>
                <boxGeometry />
                <meshStandardMaterial color="#f1d7b8" roughness={0.84} />
              </mesh>
            </group>
          </group>
        </group>

        <group ref={props.rig.leftUpperLegRef} position={[-0.24, -0.08, 0]}>
          <mesh castShadow position={[0, -0.4, 0]} scale={[0.26, 0.82, 0.26]}>
            <boxGeometry />
            <meshStandardMaterial color="#203244" roughness={0.68} />
          </mesh>
          <group ref={props.rig.leftLowerLegRef} position={[0, -0.82, 0]}>
            <mesh castShadow position={[0, -0.35, 0]} scale={[0.22, 0.74, 0.22]}>
              <boxGeometry />
              <meshStandardMaterial color="#162434" roughness={0.72} />
            </mesh>
            <mesh castShadow position={[0, -0.76, 0.08]} scale={[0.28, 0.1, 0.44]}>
              <boxGeometry />
              <meshStandardMaterial color="#2d3748" roughness={0.62} />
            </mesh>
          </group>
        </group>

        <group ref={props.rig.rightUpperLegRef} position={[0.24, -0.08, 0]}>
          <mesh castShadow position={[0, -0.4, 0]} scale={[0.26, 0.82, 0.26]}>
            <boxGeometry />
            <meshStandardMaterial color="#203244" roughness={0.68} />
          </mesh>
          <group ref={props.rig.rightLowerLegRef} position={[0, -0.82, 0]}>
            <mesh castShadow position={[0, -0.35, 0]} scale={[0.22, 0.74, 0.22]}>
              <boxGeometry />
              <meshStandardMaterial color="#162434" roughness={0.72} />
            </mesh>
            <mesh castShadow position={[0, -0.76, 0.08]} scale={[0.28, 0.1, 0.44]}>
              <boxGeometry />
              <meshStandardMaterial color="#2d3748" roughness={0.62} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
