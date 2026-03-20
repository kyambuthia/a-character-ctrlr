import { describe, expect, it } from "vitest";
import { DEFAULT_CHARACTER_CTRLR_INPUT, mergeCharacterCtrlrInput } from "./types";

describe("mergeCharacterCtrlrInput", () => {
  it("keeps the default all-false shape", () => {
    expect(DEFAULT_CHARACTER_CTRLR_INPUT).toEqual({
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      crouch: false,
      jump: false,
    });
  });

  it("merges multiple partial inputs additively", () => {
    expect(
      mergeCharacterCtrlrInput(
        { forward: true, run: true },
        { right: true },
        { crouch: false, jump: true },
      ),
    ).toEqual({
      forward: true,
      backward: false,
      left: false,
      right: true,
      run: true,
      crouch: false,
      jump: true,
    });
  });

  it("ignores nullish sources", () => {
    expect(
      mergeCharacterCtrlrInput(
        undefined,
        null,
        { backward: true, left: true },
      ),
    ).toEqual({
      forward: false,
      backward: true,
      left: true,
      right: false,
      run: false,
      crouch: false,
      jump: false,
    });
  });
});
