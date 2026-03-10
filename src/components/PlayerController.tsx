import { CapsuleCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils, Vector3 } from "three";
import { PrimitiveHero } from "./PrimitiveHero";
import { usePlayerInput } from "../systems/usePlayerInput";
import { type MovementMode, useGameStore } from "../store/useGameStore";

const forward = new Vector3();
const right = new Vector3();
const movement = new Vector3();
const MAX_SPEED = 7;

function dampAxis(
  ref: React.RefObject<Group | null>,
  axis: "x" | "y" | "z",
  target: number,
  delta: number,
  lambda = 12,
) {
  const object = ref.current;

  if (!object) {
    return;
  }

  object.rotation[axis] = MathUtils.damp(object.rotation[axis], target, lambda, delta);
}

export function PlayerController() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const visualRef = useRef<Group>(null);
  const pelvisRef = useRef<Group>(null);
  const spineRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftUpperArmRef = useRef<Group>(null);
  const leftLowerArmRef = useRef<Group>(null);
  const rightUpperArmRef = useRef<Group>(null);
  const rightLowerArmRef = useRef<Group>(null);
  const leftUpperLegRef = useRef<Group>(null);
  const leftLowerLegRef = useRef<Group>(null);
  const rightUpperLegRef = useRef<Group>(null);
  const rightLowerLegRef = useRef<Group>(null);
  const gaitPhaseRef = useRef(0);
  const input = usePlayerInput();
  const setPlayerSnapshot = useGameStore((state) => state.setPlayerSnapshot);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const visual = visualRef.current;
    const pelvis = pelvisRef.current;

    if (!body || !visual || !pelvis) {
      return;
    }

    const keys = input.current;
    const yaw = useGameStore.getState().cameraYaw;

    forward.set(Math.sin(yaw), 0, Math.cos(yaw));
    right.set(forward.z, 0, -forward.x);
    movement.set(0, 0, 0);

    if (keys.forward) movement.add(forward);
    if (keys.backward) movement.sub(forward);
    if (keys.right) movement.add(right);
    if (keys.left) movement.sub(right);

    const hasMovementInput = movement.lengthSq() > 0;
    if (hasMovementInput) {
      movement.normalize();
    }

    const movementMode: MovementMode = keys.crouch
      ? "crouch"
      : hasMovementInput && keys.run
        ? "run"
        : hasMovementInput
          ? "walk"
          : "idle";

    const speed =
      movementMode === "run" ? MAX_SPEED :
      movementMode === "walk" ? 4 :
      movementMode === "crouch" ? 2 :
      0;

    const currentVelocity = body.linvel();
    body.setLinvel(
      {
        x: movement.x * speed,
        y: currentVelocity.y,
        z: movement.z * speed,
      },
      true,
    );

    const position = body.translation();
    const facing = hasMovementInput ? Math.atan2(movement.x, movement.z) : useGameStore.getState().playerFacing;
    const speedRatio = speed / MAX_SPEED;
    const crouchAmount = movementMode === "crouch" ? 1 : 0;

    visual.rotation.y = MathUtils.damp(visual.rotation.y, facing, 10, delta);

    gaitPhaseRef.current += delta * MathUtils.lerp(1.8, 8.8, speedRatio);
    const stride = Math.sin(gaitPhaseRef.current);
    const mirroredStride = Math.sin(gaitPhaseRef.current + Math.PI);
    const bounce = Math.sin(gaitPhaseRef.current * 2) * 0.04 * speedRatio;
    const idleBreath = Math.sin(gaitPhaseRef.current * 0.55) * 0.02;
    const torsoTwist = Math.sin(gaitPhaseRef.current) * 0.08 * speedRatio;
    const legSwing = 0.82 * speedRatio;
    const armSwing = 0.68 * speedRatio;

    visual.position.y = MathUtils.damp(visual.position.y, 0.02 + idleBreath * 0.3, 8, delta);
    pelvis.position.y = MathUtils.damp(
      pelvis.position.y,
      0.9 - crouchAmount * 0.24 + bounce - idleBreath,
      10,
      delta,
    );
    pelvis.rotation.y = MathUtils.damp(pelvis.rotation.y, torsoTwist * 0.35, 10, delta);

    dampAxis(spineRef, "x", -0.04 + crouchAmount * 0.34 - speedRatio * 0.02, delta);
    dampAxis(spineRef, "y", torsoTwist, delta);
    dampAxis(spineRef, "z", Math.sin(gaitPhaseRef.current * 2) * 0.04 * speedRatio, delta);
    dampAxis(headRef, "x", 0.08 - crouchAmount * 0.18 - idleBreath * 1.4, delta);
    dampAxis(headRef, "y", -torsoTwist * 0.45, delta);

    dampAxis(leftUpperArmRef, "x", mirroredStride * armSwing - crouchAmount * 0.16, delta);
    dampAxis(rightUpperArmRef, "x", stride * armSwing - crouchAmount * 0.16, delta);
    dampAxis(leftUpperArmRef, "z", -0.08 + crouchAmount * 0.1, delta);
    dampAxis(rightUpperArmRef, "z", 0.08 - crouchAmount * 0.1, delta);
    dampAxis(leftLowerArmRef, "x", Math.max(0, -mirroredStride) * 0.46 * speedRatio + crouchAmount * 0.22, delta);
    dampAxis(rightLowerArmRef, "x", Math.max(0, -stride) * 0.46 * speedRatio + crouchAmount * 0.22, delta);

    dampAxis(leftUpperLegRef, "x", stride * legSwing - crouchAmount * 0.48, delta);
    dampAxis(rightUpperLegRef, "x", mirroredStride * legSwing - crouchAmount * 0.48, delta);
    dampAxis(leftUpperLegRef, "z", -0.04 * speedRatio, delta);
    dampAxis(rightUpperLegRef, "z", 0.04 * speedRatio, delta);
    dampAxis(leftLowerLegRef, "x", Math.max(0, -stride) * 0.8 * speedRatio + crouchAmount * 0.72, delta);
    dampAxis(rightLowerLegRef, "x", Math.max(0, -mirroredStride) * 0.8 * speedRatio + crouchAmount * 0.72, delta);

    setPlayerSnapshot({
      position: [position.x, position.y, position.z],
      facing,
      movementMode,
    });
  });

  const movementMode = useGameStore((state) => state.movementMode);

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      canSleep={false}
      enabledRotations={[false, false, false]}
      linearDamping={8}
      position={[0, 2.5, 6]}
    >
      <CapsuleCollider args={[0.52, 0.34]} />
      <PrimitiveHero
        movementMode={movementMode}
        rig={{
          rootRef: visualRef,
          pelvisRef,
          spineRef,
          headRef,
          leftUpperArmRef,
          leftLowerArmRef,
          rightUpperArmRef,
          rightLowerArmRef,
          leftUpperLegRef,
          leftLowerLegRef,
          rightUpperLegRef,
          rightLowerLegRef,
        }}
      />
    </RigidBody>
  );
}
