import type { CharacterCtrlrVec3 } from "../types";
import { CharacterCtrlrHumanoidRagdoll } from "./CharacterCtrlrHumanoidRagdoll";

export type CharacterCtrlrRagdollDummyProps = {
  position?: CharacterCtrlrVec3;
  debug?: boolean;
  paused?: boolean;
  timeScale?: number;
  manualStepCount?: number;
};

export function CharacterCtrlrRagdollDummy({
  position = [0, 4.5, 0],
  debug = false,
  paused = false,
  timeScale = 1,
  manualStepCount = 0,
}: CharacterCtrlrRagdollDummyProps) {
  return (
    <CharacterCtrlrHumanoidRagdoll
      debug={debug}
      manualStepCount={manualStepCount}
      paused={paused}
      position={position}
      timeScale={timeScale}
    />
  );
}
