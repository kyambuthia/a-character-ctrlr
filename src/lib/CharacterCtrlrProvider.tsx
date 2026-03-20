import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
} from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import type {
  CharacterCtrlrMovementMode,
  CharacterCtrlrPlayerSnapshot,
  CharacterCtrlrSupportState,
  CharacterCtrlrVec3,
} from "./types";

export type CharacterCtrlrControllerState = {
  playerPosition: CharacterCtrlrVec3;
  playerFocusPosition: CharacterCtrlrVec3 | null;
  playerVelocity: CharacterCtrlrVec3;
  playerFacing: number;
  movementMode: CharacterCtrlrMovementMode;
  grounded: boolean;
  supportState: CharacterCtrlrSupportState;
  cameraYaw: number;
  cameraPitch: number;
  setPlayerSnapshot: (payload: CharacterCtrlrPlayerSnapshot) => void;
  adjustCamera: (yawDelta: number, pitchDelta: number) => void;
};

export type CharacterCtrlrStoreInit = Partial<
  Pick<
    CharacterCtrlrControllerState,
    | "playerPosition"
    | "playerFocusPosition"
    | "playerVelocity"
    | "playerFacing"
    | "movementMode"
    | "grounded"
    | "supportState"
    | "cameraYaw"
    | "cameraPitch"
  >
>;

export type CharacterCtrlrStoreApi = StoreApi<CharacterCtrlrControllerState>;

const defaultState: Omit<
  CharacterCtrlrControllerState,
  "setPlayerSnapshot" | "adjustCamera"
> = {
  playerPosition: [0, 2.5, 6],
  playerFocusPosition: null,
  playerVelocity: [0, 0, 0],
  playerFacing: 0,
  movementMode: "idle",
  grounded: false,
  supportState: "none",
  cameraYaw: Math.PI,
  cameraPitch: -0.22,
};

export function createCharacterCtrlrStore(
  initialState: CharacterCtrlrStoreInit = {},
): CharacterCtrlrStoreApi {
  return createStore<CharacterCtrlrControllerState>()((set) => ({
    ...defaultState,
    ...initialState,
    setPlayerSnapshot: ({
      position,
      focusPosition,
      velocity,
      facing,
      movementMode,
      grounded,
      supportState,
    }) =>
      set({
        playerPosition: position,
        playerFocusPosition: focusPosition ?? null,
        playerVelocity: velocity,
        playerFacing: facing,
        movementMode,
        grounded,
        supportState,
      }),
    adjustCamera: (yawDelta, pitchDelta) =>
      set((state) => ({
        cameraYaw: state.cameraYaw + yawDelta,
        cameraPitch: Math.max(
          -1.1,
          Math.min(0.35, state.cameraPitch + pitchDelta),
        ),
      })),
  }));
}

const CharacterCtrlrStoreContext = createContext<CharacterCtrlrStoreApi | null>(null);

export function CharacterCtrlrProvider(props: {
  children: ReactNode;
  initialState?: CharacterCtrlrStoreInit;
}) {
  const storeRef = useRef<CharacterCtrlrStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createCharacterCtrlrStore(props.initialState);
  }

  return (
    <CharacterCtrlrStoreContext.Provider value={storeRef.current}>
      {props.children}
    </CharacterCtrlrStoreContext.Provider>
  );
}

export function useCharacterCtrlrStore<T>(
  selector: (state: CharacterCtrlrControllerState) => T,
) {
  const store = useContext(CharacterCtrlrStoreContext);

  if (!store) {
    throw new Error("CharacterCtrlr components must be rendered inside <CharacterCtrlrProvider />.");
  }

  return useStore(store, selector);
}

export function useCharacterCtrlrStoreApi() {
  const store = useContext(CharacterCtrlrStoreContext);

  if (!store) {
    throw new Error("CharacterCtrlr components must be rendered inside <CharacterCtrlrProvider />.");
  }

  return store;
}
