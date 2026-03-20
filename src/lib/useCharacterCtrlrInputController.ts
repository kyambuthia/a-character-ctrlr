import { useRef } from "react";
import {
  DEFAULT_CHARACTER_CTRLR_INPUT,
  type CharacterCtrlrInputState,
} from "./types";

type InputUpdater =
  | Partial<CharacterCtrlrInputState>
  | ((current: CharacterCtrlrInputState) => Partial<CharacterCtrlrInputState> | CharacterCtrlrInputState);

export function useCharacterCtrlrInputController(
  initialState?: Partial<CharacterCtrlrInputState>,
) {
  const inputRef = useRef<CharacterCtrlrInputState>({
    ...DEFAULT_CHARACTER_CTRLR_INPUT,
    ...initialState,
  });
  const apiRef = useRef<{
    inputRef: typeof inputRef;
    setInput: (updater: InputUpdater) => void;
    replaceInput: (nextState?: Partial<CharacterCtrlrInputState>) => void;
    pressInput: (key: keyof CharacterCtrlrInputState, pressed?: boolean) => void;
    resetInput: () => void;
  } | null>(null);

  if (!apiRef.current) {
    apiRef.current = {
      inputRef,
      setInput: (updater: InputUpdater) => {
        const next =
          typeof updater === "function" ? updater(inputRef.current) : updater;

        inputRef.current = {
          ...inputRef.current,
          ...next,
        };
      },
      replaceInput: (nextState?: Partial<CharacterCtrlrInputState>) => {
        inputRef.current = {
          ...DEFAULT_CHARACTER_CTRLR_INPUT,
          ...nextState,
        };
      },
      pressInput: (key: keyof CharacterCtrlrInputState, pressed = true) => {
        inputRef.current = {
          ...inputRef.current,
          [key]: pressed,
        };
      },
      resetInput: () => {
        inputRef.current = { ...DEFAULT_CHARACTER_CTRLR_INPUT };
      },
    };
  }

  return apiRef.current;
}
