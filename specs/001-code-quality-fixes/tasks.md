# Tasks: Code Quality & Best-Practice Fixes

**Input**: Design documents from `/specs/001-code-quality-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual smoke testing per quickstart.md - no automated test tasks included per spec requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `custom_components/mopidy/` at repository root
- Paths shown below use actual file locations

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extract constants and set up cache infrastructure that will be used by multiple user stories

- [x] T001 Add new constants to `custom_components/mopidy/const.py`: `RESTORE_RETRY_MAX`, `RESTORE_RETRY_INTERVAL_SECONDS`, `VOLUME_STEP_PERCENT`, `CACHE_MAX_SIZE`
- [x] T002 [P] Import `collections.OrderedDict` in `custom_components/mopidy/const.py` for cache implementation
- [x] T003 [P] Convert `CACHE_ART` from `dict` to `OrderedDict` with size limit enforcement in `custom_components/mopidy/const.py`
- [x] T004 [P] Convert `CACHE_TITLES` from `dict` to `OrderedDict` with size limit enforcement in `custom_components/mopidy/const.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create helper function `_bounded_cache_set()` in `custom_components/mopidy/const.py` to enforce cache size limits with LRU eviction
- [x] T006 Update all `CACHE_ART[key] = value` assignments to use `_bounded_cache_set(CACHE_ART, key, value)` pattern
- [x] T007 Update all `CACHE_TITLES[key] = value` assignments to use `_bounded_cache_set(CACHE_TITLES, key, value)` pattern

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Resilient Playback & Setup (Priority: P1) 🎯 MVP

**Goal**: Fix error handling and async/sync boundaries to ensure responsive, stable integration with clear error messages

**Independent Test**: Run smoke tests for config flow, playback controls, search, and snapshot/restore with Mopidy both reachable and unreachable; verify no unhandled exceptions and UI remains responsive.

### Implementation for User Story 1

- [x] T008 [US1] Replace bare `except:` clause with specific exception handling in `custom_components/mopidy/config_flow.py` line 85
- [x] T009 [US1] Add error context (hostname, port) to all connection error logs in `custom_components/mopidy/config_flow.py`
- [x] T010 [US1] Add error context (hostname, port, operation) to connection error logs in `custom_components/mopidy/__init__.py`
- [x] T011 [US1] Replace `time.sleep(0.5)` with `asyncio.sleep(0.5)` in `restore_snapshot()` method in `custom_components/mopidy/speaker.py` line 888
- [x] T012 [US1] Make `restore_snapshot()` method async and update call site in `custom_components/mopidy/media_player.py`
- [x] T013 [US1] Add error context to all connection error logs in `custom_components/mopidy/speaker.py` methods
- [x] T014 [US1] Add error context to all connection error logs in `custom_components/mopidy/media_player.py` methods
- [x] T015 [US1] Ensure all error handlers in `custom_components/mopidy/media_player.py` catch specific exception types (no bare except)
- [x] T016 [US1] Ensure all error handlers in `custom_components/mopidy/speaker.py` catch specific exception types (no bare except)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Release Compliance (Priority: P1)

**Goal**: Ensure version bump and changelog updates are included before merge to main

**Independent Test**: Inspect the merge artifacts to confirm `manifest.json` version increment and a corresponding dated section in `mopidy-CHANGELOG.md`.

### Implementation for User Story 2

- [x] T017 [US2] Increment version in `custom_components/mopidy/manifest.json` from "2.4.1" to "2.4.2" (PATCH bump for bug fixes)
- [x] T018 [US2] Add new changelog entry section `## [2.4.2] - YYYY-MM-DD` to `mopidy-CHANGELOG.md` at the top
- [x] T019 [US2] Categorize changes in changelog under "Fixed" section: error handling improvements, async/sync boundary fixes, cache bounding, technical debt cleanup
- [x] T020 [US2] Verify version number in changelog matches version in `manifest.json`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Technical Debt Cleanup (Priority: P2)

**Goal**: Improve code readability and maintainability through type hints, duplicate code removal, and documentation

**Independent Test**: Review updated files to confirm TODO/FIXME removals, duplicate imports eliminated, unused legacy setup paths removed or documented, and caches bounded.

### Implementation for User Story 3

- [x] T021 [P] [US3] Remove duplicate `urllib.parse` import (line 11) in `custom_components/mopidy/media_player.py`
- [x] T022 [US3] Add comprehensive docstring to `async_setup_platform()` function in `custom_components/mopidy/media_player.py` explaining legacy YAML configuration support
- [x] T023 [US3] Remove "# NOTE: Is this still needed?" comment from `async_setup_platform()` in `custom_components/mopidy/media_player.py`
- [x] T024 [P] [US3] Replace magic number `120` with `RESTORE_RETRY_MAX` constant in `custom_components/mopidy/speaker.py` line 883
- [x] T025 [P] [US3] Replace magic number `0.5` with `RESTORE_RETRY_INTERVAL_SECONDS` constant in `custom_components/mopidy/speaker.py` line 888
- [x] T026 [P] [US3] Replace magic number `5` with `VOLUME_STEP_PERCENT` constant in `custom_components/mopidy/speaker.py` volume_up/volume_down methods
- [x] T027 [P] [US3] Add type hints to all public methods in `custom_components/mopidy/config_flow.py`
- [x] T028 [P] [US3] Add type hints to all public methods in `custom_components/mopidy/__init__.py`
- [x] T029 [P] [US3] Add type hints to all public methods in `custom_components/mopidy/media_player.py`
- [x] T030 [P] [US3] Add type hints to all public methods in `custom_components/mopidy/speaker.py`
- [x] T031 [P] [US3] Add type hints to all class attributes in `custom_components/mopidy/speaker.py` (MopidySpeaker, MopidyQueue, MopidyLibrary)
- [x] T032 [US3] Resolve or document all TODO/FIXME markers in modified files
- [x] T033 [US3] Run linter/type checker and verify zero new warnings introduced

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates

- [ ] T034 [P] Run quickstart.md validation steps to verify all fixes work correctly
- [ ] T035 [P] Verify all error handlers include context (hostname, port, operation) in log messages
- [ ] T036 [P] Verify cache size limits are enforced (test with 1000+ entries)
- [ ] T037 [P] Verify no blocking operations remain in async code paths
- [ ] T038 [P] Verify all public methods have complete type hints
- [ ] T039 [P] Code cleanup and formatting consistency check
- [ ] T040 Final review: All constitution principles satisfied, all technical debt items addressed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent, can run in parallel with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May reference constants from Setup but otherwise independent

### Within Each User Story

- Constants before usage
- Core implementation before integration
- Error handling improvements before type hints (US3)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1 and 2 can start in parallel
- All User Story 3 tasks marked [P] can run in parallel (type hints, magic number replacements)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 3

```bash
# Launch all type hint tasks together:
Task: "Add type hints to all public methods in config_flow.py"
Task: "Add type hints to all public methods in __init__.py"
Task: "Add type hints to all public methods in media_player.py"
Task: "Add type hints to all public methods in speaker.py"
Task: "Add type hints to all class attributes in speaker.py"

# Launch all magic number replacements together:
Task: "Replace magic number 120 with RESTORE_RETRY_MAX"
Task: "Replace magic number 0.5 with RESTORE_RETRY_INTERVAL_SECONDS"
Task: "Replace magic number 5 with VOLUME_STEP_PERCENT"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (error handling, async fixes)
   - Developer B: User Story 2 (release compliance)
   - Developer C: User Story 3 (technical debt cleanup)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks follow strict format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

