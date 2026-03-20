export type CharacterCtrlrMovementMode =
  | "idle"
  | "walk"
  | "run"
  | "crouch"
  | "jump"
  | "fall";

export type CharacterCtrlrSupportState = "none" | "left" | "right" | "double";

export type CharacterCtrlrVec3 = [number, number, number];

export type CharacterCtrlrInputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  crouch: boolean;
  jump: boolean;
};

export type CharacterCtrlrPlayerSnapshot = {
  position: CharacterCtrlrVec3;
  focusPosition?: CharacterCtrlrVec3;
  facing: number;
  movementMode: CharacterCtrlrMovementMode;
  grounded: boolean;
  supportState: CharacterCtrlrSupportState;
  velocity: CharacterCtrlrVec3;
};

export const DEFAULT_CHARACTER_CTRLR_INPUT: CharacterCtrlrInputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false,
  crouch: false,
  jump: false,
};

export function mergeCharacterCtrlrInput(
  ...inputs: Array<Partial<CharacterCtrlrInputState> | null | undefined>
): CharacterCtrlrInputState {
  return inputs.reduce<CharacterCtrlrInputState>(
    (accumulator, input) => ({
      forward: accumulator.forward || Boolean(input?.forward),
      backward: accumulator.backward || Boolean(input?.backward),
      left: accumulator.left || Boolean(input?.left),
      right: accumulator.right || Boolean(input?.right),
      run: accumulator.run || Boolean(input?.run),
      crouch: accumulator.crouch || Boolean(input?.crouch),
      jump: accumulator.jump || Boolean(input?.jump),
    }),
    { ...DEFAULT_CHARACTER_CTRLR_INPUT },
  );
}
