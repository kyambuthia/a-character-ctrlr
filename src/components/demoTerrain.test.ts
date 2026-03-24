import { describe, expect, it } from "vitest";
import {
  DEMO_TERRAIN_CAPSULE_SPAWN_CLEARANCE,
  DEMO_TERRAIN_SPAWN_X,
  DEMO_TERRAIN_SPAWN_Z,
  getDemoTerrainSpawnPosition,
  sampleDemoTerrainHeight,
  sampleDemoTerrainNormal,
} from "./demoTerrain";

describe("demo terrain helpers", () => {
  it("returns deterministic heights", () => {
    expect(sampleDemoTerrainHeight(12.5, -8.75)).toBeCloseTo(
      sampleDemoTerrainHeight(12.5, -8.75),
      8,
    );
  });

  it("keeps the default spawn shelf gentle enough for the capsule controller", () => {
    const centerHeight = sampleDemoTerrainHeight(
      DEMO_TERRAIN_SPAWN_X,
      DEMO_TERRAIN_SPAWN_Z,
    );
    const neighborHeight = sampleDemoTerrainHeight(
      DEMO_TERRAIN_SPAWN_X + 2,
      DEMO_TERRAIN_SPAWN_Z - 2,
    );
    const fartherHeight = sampleDemoTerrainHeight(
      DEMO_TERRAIN_SPAWN_X + 6,
      DEMO_TERRAIN_SPAWN_Z + 3,
    );
    const normal = sampleDemoTerrainNormal(
      DEMO_TERRAIN_SPAWN_X,
      DEMO_TERRAIN_SPAWN_Z,
    );

    expect(Math.abs(centerHeight - neighborHeight)).toBeLessThan(0.05);
    expect(Math.abs(centerHeight - fartherHeight)).toBeLessThan(0.12);
    expect(normal.y).toBeGreaterThan(0.985);
  });

  it("applies spawn clearance above the sampled terrain height", () => {
    const clearance = DEMO_TERRAIN_CAPSULE_SPAWN_CLEARANCE;
    const [, y] = getDemoTerrainSpawnPosition(4, 7, clearance);

    expect(y - sampleDemoTerrainHeight(4, 7)).toBeCloseTo(clearance, 8);
  });
});
