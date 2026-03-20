# Production Active-Ragdoll Roadmap

This roadmap is for the publishable library in `src/lib`, not for demo-only scaffolding. The demo exists to inspect runtime behavior over LAN and in-browser, but the shipping work belongs in the library codepath.

The chosen controller family is documented in [RESEARCH.md](./RESEARCH.md): a `SIMBICON`-style finite-state controller with `capture-point` stepping heuristics and later directional extensions inspired by `Generalized Biped Walking Control`.

## Program constraints

The controller must meet these constraints from day one:

- fixed-step deterministic behavior under Rapier
- no neural inference in the locomotion hot path
- bounded per-frame cost proportional to joint count
- debuggable state transitions and failure reasons
- production-capable on mobile and PC

That means:

- reduce DOFs aggressively where full articulation is not essential
- prefer explicit state machines over opaque blended controllers
- compute only the metrics we can act on in the same frame
- make visual debugging cheap enough to leave available during day-to-day development

## Runtime architecture target

The intended production control pipeline is:

1. `Input command layer`
2. `Locomotion mode selection`
3. `Gait phase / support-state machine`
4. `Balance and step planning`
5. `Joint target synthesis`
6. `Motor drive layer`
7. `Failure detection and recovery`

The main runtime state should eventually include:

- `q`, `qdot`: articulated joint positions and velocities
- `x_pelvis`, `x_chest`, `x_com`: world-space root and COM signals
- `supportState`: `none | left | right | double`
- `supportPolygon`
- `capturePoint`
- `plannedFootTarget`
- `gaitPhase`
- `commandVelocity`
- `measuredVelocity`
- `movementMode`
- `controllerPhase`
- `failureReason`

## Visual debugging is a production subsystem

Debugging is not demo polish. It is required to ship a controller this physical.

The production debug stack should expose:

- COM position and COM ground projection
- support polygon and current stance foot
- capture point and capture-point error
- planned swing-foot landing target
- current gait phase and state-machine phase
- joint target angle vs measured angle
- joint-limit proximity heatmap
- contact normals and contact lifetime
- transition reason when the controller changes state
- failure reason when the controller gives up on balance and enters recovery
- CPU timing for control, debug sampling, and snapshot publication

Rules:

- all debug metrics originate in `src/lib`
- the demo may render them, but it must not be the only place they are computed
- the hot path must support debug levels such as `off`, `state`, `contacts`, `joints`, and `full`
- heavy debug sampling should be ring-buffered and optional

## Phase 0: Numerical and rig foundation

Status: in progress

Objective:

- stabilize the articulated body so locomotion tuning is not wasted on a broken skeleton

Theory basis:

- `SIMBICON` assumes a controllable articulated biped
- PhysX and general rigid-body practice strongly favor reduced DOFs and explicit limits for stability

Primary implementation targets:

- `src/lib/components/CharacterCtrlrHumanoidData.ts`
- `src/lib/components/CharacterCtrlrHumanoidRagdoll.tsx`

Tasks:

- finalize body proportions, masses, and joint anchor preload
- use fixed joints where relative motion is not useful for gameplay control
- use revolute joints where only one angular DOF is required
- keep spherical joints only where the controller truly benefits from them
- tune damping, solver iterations, CCD, and contact skin for the articulated player profile
- add bind-pose regression checks for anchor alignment and collider overlap

Exit criteria:

- no persistent self-collapse in idle due to rig definition alone
- no large initial joint preload
- no head/chest or leg-chain overlap in bind pose

## Phase 1: Library-level observability

Status: not started

Objective:

- make the controller measurable before adding more behavior

Theory basis:

- `Capture Point` only helps if COM and support geometry are visible and logged
- `SIMBICON` tuning depends on viewing phase, tracking error, and support timing

Primary implementation targets:

- `src/lib/components/CharacterCtrlrRagdollDebug.tsx`
- `src/lib/CharacterCtrlrProvider.tsx`
- `src/lib/components/CharacterCtrlrActiveRagdollPlayer.tsx`

Tasks:

- publish COM, support polygon, and capture point from the controller
- add planned footfall and current support-foot visualization
- add per-joint target/error overlays for hips, knees, ankles, shoulders, and elbows
- add transition markers when the gait FSM changes state
- add reason-coded failure diagnostics such as `lost_support`, `joint_saturation`, `pelvis_too_low`, and `unstable_yaw`
- add lightweight profiling counters for controller time and debug time

Exit criteria:

- every locomotion failure is explainable from the debug overlay or recorded snapshot
- the debug overlay can be enabled over LAN on mobile without tanking the simulation

## Phase 2: Standing controller and turn-in-place

Status: not started

Objective:

- establish a stable standing controller before translating the body across the ground

Theory basis:

- `SIMBICON` uses feedback-modulated target poses
- standing is the zero-velocity boundary condition of walking and must work first

Primary implementation target:

- `src/lib/components/CharacterCtrlrActiveRagdollPlayer.tsx`

Tasks:

- define a standing pose vector for pelvis, chest, hips, knees, ankles, shoulders, elbows
- stabilize pelvis pitch/roll and chest pitch/roll in world space
- regulate pelvis height over current support
- hold COM projection inside support polygon in quiet standing
- add turn-in-place control driven by yaw error and heading command
- expose gain schedules for `idle`, `walk`, `run`, `airborne`

Technical notes:

- use stance ankle and hip torques to keep the COM projection near the center of support
- use explicit gain clamping to prevent oscillation under low frame-rate mobile conditions
- prioritize stable yaw tracking over aggressive heading changes

Exit criteria:

- stable idle for long durations without jitter buildup
- controllable turn-in-place without leg collapse or shoulder flail

## Phase 3: Forward walking and running

Status: in progress

Objective:

- implement a robust forward locomotion controller before any omnidirectional expansion

Theory basis:

- `SIMBICON`
- `Capture Point`

Primary implementation target:

- `src/lib/components/CharacterCtrlrActiveRagdollPlayer.tsx`

Tasks:

- implement a compact gait FSM such as:
  - `double_support_start`
  - `left_stance_right_swing`
  - `double_support_mid`
  - `right_stance_left_swing`
- synthesize phase-specific targets for hips, knees, ankles, torso lean, and arm counter-swing
- choose swing-foot landing targets from:
  - command velocity
  - measured COM velocity
  - heading error
  - capture-point error
- separate gait cadence from achieved velocity so walk can start from rest
- keep run as a parameterized extension of walk, not a second unrelated controller

Technical notes:

- use `omega_0 = sqrt(g / z_com)` and `x_cp = x_com + v_com / omega_0` as a stepping heuristic
- clamp landing targets to reachable regions relative to pelvis and stance foot
- track phase time and support-contact confirmation separately to avoid premature transitions

Exit criteria:

- stable walk startup from rest
- stable continuous forward walk
- stable transition walk -> run -> walk
- no persistent leg scissoring or foot chatter in steady gait

## Phase 4: Backpedal, strafe, and curved locomotion

Status: not started

Objective:

- extend the forward gait into directional movement without losing stability

Theory basis:

- `Generalized Biped Walking Control`

Primary implementation targets:

- `src/lib/components/CharacterCtrlrActiveRagdollPlayer.tsx`
- `src/lib/types.ts`

Tasks:

- parameterize the gait by desired planar velocity instead of only forward speed
- add backpedal as a reduced-speed, higher-stability gait family
- add left/right strafe as explicit gait variants with narrower step width limits
- support curved locomotion under simultaneous translation and heading commands
- add braking and start/stop transitions instead of instantaneous mode switches

Technical notes:

- do not mirror forward gait blindly for backward locomotion
- widen hysteresis on support transitions for strafe/backpedal because lateral stability margins are smaller
- decouple torso facing from instantaneous velocity when the product design wants aim-style movement later

Exit criteria:

- backward locomotion is slower but stable
- strafing does not immediately destabilize the pelvis
- heading changes during locomotion are smooth and measurable

## Phase 5: Jumping, airtime, and landing

Status: not started

Objective:

- treat jumping as a dedicated controller mode, not as a walking state with an impulse added

Theory basis:

- standard physically based locomotion practice
- later DeepMimic-style ideas may inform recovery, but not the baseline jump controller

Primary implementation target:

- `src/lib/components/CharacterCtrlrActiveRagdollPlayer.tsx`

Tasks:

- define explicit `takeoff`, `airborne`, and `landing` phases
- prepare takeoff pose by compressing stance chain before impulse
- limit angular momentum injection during takeoff
- add airborne pose stabilization for torso and legs
- detect landing quality from support timing, vertical speed, pelvis attitude, and COM position
- route bad landings into stumble or recovery instead of pretending they are normal locomotion

Exit criteria:

- jump does not explode the chain
- landing can re-enter locomotion only after support is re-established
- bad landings are diagnosable and recoverable

## Phase 6: Disturbance rejection and recovery

Status: not started

Objective:

- let the controller absorb realistic errors instead of requiring perfect conditions

Theory basis:

- `Capture Point`
- long-term inspiration from `DeepMimic`

Primary implementation targets:

- `src/lib/components/CharacterCtrlrActiveRagdollPlayer.tsx`
- future recovery helpers in `src/lib/components`

Tasks:

- classify disturbances by severity:
  - recover in place
  - recover with a step
  - transition to stumble
  - transition to fall
- add recovery-step logic when capture point exits support polygon
- add controlled stumble states rather than binary success/failure
- add fall-entry criteria based on pelvis height, trunk attitude, support loss duration, and joint saturation
- define deterministic re-entry conditions for locomotion after partial recovery

Exit criteria:

- moderate perturbations produce visible stepping recovery
- severe perturbations fall cleanly instead of exploding numerically
- recovery transitions are traceable from debug output

## Phase 7: Production hardening

Status: not started

Objective:

- make the controller suitable for downstream library consumers, not just internal iteration

Primary implementation targets:

- all files in `src/lib`
- tests and docs

Tasks:

- add regression tests for:
  - gait-state transitions
  - support-state changes
  - capture-point step triggers
  - jump phase transitions
  - fall-entry and recovery-entry rules
- add low-overhead snapshot recording for deterministic replay of failures
- split expensive debug rendering from cheap production metrics
- document all public tunables, default gains, and known failure modes
- profile mobile-class behavior and trim allocations from the hot path
- confirm demo-only code remains a thin wrapper over library behavior

Exit criteria:

- `src/lib` contains the complete production control path
- debug data can be replayed or inspected after failure
- docs explain how to tune and ship the active-ragdoll controller

## Immediate execution order

1. Finish Phase 0 and Phase 1 together so locomotion tuning starts from a stable, observable rig.
2. Finish Phase 2 before adding any more locomotion modes.
3. Finish Phase 3 before attempting backward or strafe movement.
4. Add jump only after forward gait and landing support metrics are trustworthy.
5. Add recovery only after failure classification can be debugged deterministically.

## Definition of done for the first publishable active-ragdoll release

The first release should not promise everything. It should promise:

- stable idle
- stable turn-in-place
- stable forward walk
- stable forward run
- deterministic jump and landing
- production-grade debug instrumentation
- documented tunables and failure modes

Backward locomotion, strafing, partial-ragdoll reactions, and advanced recovery can land after that baseline is solid.
