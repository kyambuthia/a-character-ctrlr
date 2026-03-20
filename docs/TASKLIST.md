# CharacterCtrlr Gait Task List

## Phase 1: Locomotion Substrate And Observability

Status: complete

- add a structured locomotion debug state object for the active ragdoll controller
- separate locomotion phase reporting from balance/recovery reporting
- surface support-contact reliability metrics for left and right feet
- route locomotion diagnostics into the in-world ragdoll debug overlay
- centralize joint-drive tuning helpers so later gait phases do not keep duplicating gains

Done when:

- idle standing is stable under zero input
- support state is trustworthy and inspectable
- locomotion and balance state are no longer implicit locals hidden inside the frame loop

## Phase 2: Explicit Gait State Machine

Status: complete

- add deterministic gait phases:
  - `double-support`
  - `left-stance`
  - `right-stance`
  - `airborne`
- add phase timers and normalized phase progress
- add deterministic transition reasons and expose them in debug

## Phase 3: Phase-Based Pose Targets

Status: complete

- replace the implicit gait math with stance-leg, swing-leg, pelvis, chest, and arm target sets
- blend targets by gait phase and locomotion effort
- keep startup and stop behavior separate from steady-state stepping

## Phase 4: Balance Feedback

Status: complete

- estimate support center and COM relationship explicitly
- compute capture-point style stability metrics
- feed balance error into pelvis and swing-foot targets
- distinguish balanced stepping from recovery stepping

## Phase 5: Foot Placement And Clearance

Status: complete

- add step length scaling from commanded speed
- add nonzero step width constraints
- add swing-foot lift and forward placement control
- eliminate leg scissoring and foot chatter

## Phase 6: Parameterized Locomotion Families

Status: complete

- create data-driven tuning sets for `idle`, `walk`, `run`, and `crouch`
- keep the controller architecture unified across locomotion families
- stop baking locomotion tuning into hard-coded formulas

## Phase 7: Recovery And Interruptions

Status: complete

- add stumble, partial-recovery, and recovery-to-gait transitions
- treat jumping and landing as dedicated controller modes
- define deterministic re-entry conditions into locomotion

## Phase 8: Tuning And Validation

Status: in progress

- extend the debug overlay with gait transition markers and joint tracking error
- test stable startup, steady walk, walk-to-run, and disturbance recovery
- ensure every locomotion failure is explainable from captured diagnostics

## Current Focus

- stabilize upright standing and remove the immediate kneeling/collapse on spawn
- keep the rig standing under idle and low-speed double-support before adding a better first step
- once standing is reliable, implement deliberate swing-leg lift in the direction of travel as the next walking milestone
