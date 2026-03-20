import { useEffect, useRef } from "react";
import { useCharacterCtrlrStoreApi } from "../lib";
import {
  DEFAULT_CHARACTER_CTRLR_INPUT,
  type CharacterCtrlrInputState,
} from "../lib";

const MOVE_DEAD_ZONE = 18;
const RUN_THRESHOLD = 70;

function makeInputFromDelta(dx: number, dy: number): CharacterCtrlrInputState {
  const magnitude = Math.hypot(dx, dy);

  return {
    forward: dy < -MOVE_DEAD_ZONE,
    backward: dy > MOVE_DEAD_ZONE,
    left: dx < -MOVE_DEAD_ZONE,
    right: dx > MOVE_DEAD_ZONE,
    run: magnitude > RUN_THRESHOLD,
    crouch: false,
    jump: false,
  };
}

export function useDemoTouchInput() {
  const storeApi = useCharacterCtrlrStoreApi();
  const inputRef = useRef<CharacterCtrlrInputState | null>({ ...DEFAULT_CHARACTER_CTRLR_INPUT });

  useEffect(() => {
    let moveTouchId: number | null = null;
    let lookTouchId: number | null = null;
    let moveOrigin = { x: 0, y: 0 };
    let lookPrevious = { x: 0, y: 0 };

    const resetMovement = () => {
      inputRef.current = { ...DEFAULT_CHARACTER_CTRLR_INPUT };
    };

    const onTouchStart = (event: TouchEvent) => {
      const viewportMidpoint = window.innerWidth * 0.5;

      for (const touch of event.changedTouches) {
        if (moveTouchId === null && touch.clientX < viewportMidpoint) {
          moveTouchId = touch.identifier;
          moveOrigin = { x: touch.clientX, y: touch.clientY };
          inputRef.current = { ...DEFAULT_CHARACTER_CTRLR_INPUT };
          continue;
        }

        if (lookTouchId === null) {
          lookTouchId = touch.identifier;
          lookPrevious = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      let handled = false;

      for (const touch of event.changedTouches) {
        if (touch.identifier === moveTouchId) {
          const dx = touch.clientX - moveOrigin.x;
          const dy = touch.clientY - moveOrigin.y;
          inputRef.current = makeInputFromDelta(dx, dy);
          handled = true;
        }

        if (touch.identifier === lookTouchId) {
          const dx = touch.clientX - lookPrevious.x;
          const dy = touch.clientY - lookPrevious.y;
          lookPrevious = { x: touch.clientX, y: touch.clientY };
          storeApi.getState().adjustCamera(-dx * 0.006, -dy * 0.0045);
          handled = true;
        }
      }

      if (handled) {
        event.preventDefault();
      }
    };

    const releaseTouch = (touchList: TouchList) => {
      for (const touch of touchList) {
        if (touch.identifier === moveTouchId) {
          moveTouchId = null;
          resetMovement();
        }

        if (touch.identifier === lookTouchId) {
          lookTouchId = null;
        }
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      releaseTouch(event.changedTouches);
    };

    const onTouchCancel = (event: TouchEvent) => {
      releaseTouch(event.changedTouches);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [storeApi]);

  return inputRef;
}
