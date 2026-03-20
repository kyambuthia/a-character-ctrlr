import { describe, expect, it } from "vitest";
import {
  CHARACTER_CTRLR_HUMANOID_BODY_DEFINITIONS,
  CHARACTER_CTRLR_HUMANOID_JOINT_DEFINITIONS,
} from "./CharacterCtrlrHumanoidData";

describe("CHARACTER_CTRLR_HUMANOID_JOINT_DEFINITIONS", () => {
  it("keeps every joint anchor aligned in the bind pose", () => {
    const bodyPositions = Object.fromEntries(
      CHARACTER_CTRLR_HUMANOID_BODY_DEFINITIONS.map((body) => [body.key, body.position]),
    );

    for (const joint of CHARACTER_CTRLR_HUMANOID_JOINT_DEFINITIONS) {
      const bodyAPosition = bodyPositions[joint.bodyA];
      const bodyBPosition = bodyPositions[joint.bodyB];
      const worldAnchorA = joint.anchorA.map(
        (value, index) => value + bodyAPosition[index],
      );
      const worldAnchorB = joint.anchorB.map(
        (value, index) => value + bodyBPosition[index],
      );
      const alignmentError = Math.hypot(
        worldAnchorA[0] - worldAnchorB[0],
        worldAnchorA[1] - worldAnchorB[1],
        worldAnchorA[2] - worldAnchorB[2],
      );

      expect(
        alignmentError,
        `${joint.key} starts with ${alignmentError.toFixed(4)}m of anchor preload`,
      ).toBeLessThan(1e-6);
    }
  });

  it("keeps the head collider clear of the chest in the bind pose", () => {
    const chest = CHARACTER_CTRLR_HUMANOID_BODY_DEFINITIONS.find((body) => body.key === "chest");
    const head = CHARACTER_CTRLR_HUMANOID_BODY_DEFINITIONS.find((body) => body.key === "head");

    expect(chest).toBeDefined();
    expect(head).toBeDefined();

    if (!chest || !head || chest.shape.kind !== "box" || head.shape.kind !== "sphere") {
      return;
    }

    const chestTop = chest.position[1] + chest.shape.size[1] * 0.5;
    const headBottom = head.position[1] - head.shape.radius;

    expect(headBottom - chestTop).toBeGreaterThanOrEqual(0.03);
  });
});
