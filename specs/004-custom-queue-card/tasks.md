# Tasks: Custom Queue Management Card

**Input**: Design documents from `/specs/004-custom-queue-card/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing per quickstart.md validation guide (no automated test infrastructure currently exists in codebase)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `custom_components/mopidy/` at repository root
- **Frontend**: `www/community/mopidy/` at repository root
- Paths shown below use absolute paths from repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for custom card development

- [X] T001 Create frontend directory structure `www/community/mopidy/` for custom card
- [X] T002 [P] Initialize TypeScript project configuration in `www/community/mopidy/` (tsconfig.json, package.json)
- [X] T003 [P] Install and configure build dependencies (Lit, SortableJS, TypeScript compiler, bundler) - Note: Dependencies defined in package.json, installation requires `npm install` when ready to build
- [X] T004 [P] Create HACS metadata file `www/community/mopidy/hacs.json` for card distribution
- [X] T005 [P] Create README.md in `www/community/mopidy/` with installation and usage instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend services and attributes that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement `queue_tracks` entity attribute in `custom_components/mopidy/media_player.py` (exposes full track list with metadata as array)
- [X] T007 Implement helper method to format queue tracks array in `custom_components/mopidy/speaker.py` (converts Mopidy tracklist to queue_tracks format)
- [X] T008 Update `update_queue_information()` method in `custom_components/mopidy/speaker.py` to populate queue_tracks data
- [X] T009 Implement `play_track_at_position` method in `custom_components/mopidy/speaker.py` (plays track at position without reordering)
- [X] T010 Implement `service_play_track_at_position` method in `custom_components/mopidy/media_player.py` (service handler with validation)
- [X] T011 Register `play_track_at_position` service in `custom_components/mopidy/media_player.py` using `async_register_entity_service()`
- [X] T012 Add `play_track_at_position` service definition to `custom_components/mopidy/services.yaml` with schema and description
- [X] T013 Update `extra_state_attributes` property in `custom_components/mopidy/media_player.py` to include `queue_tracks` attribute

**Checkpoint**: Foundation ready - backend services and attributes implemented. User story implementation can now begin.

---

## Phase 3: User Story 1 - Interactive Queue Display (Priority: P1) 🎯 MVP

**Goal**: Display the Mopidy playback queue as an interactive list of tracks with metadata, showing currently playing track and handling empty/unavailable states.

**Independent Test**: Display custom card for Mopidy entity with tracks in queue, verify all tracks shown with metadata (title, artist, album, position), confirm currently playing track is visually distinguished, test empty state and error states.

### Implementation for User Story 1

- [X] T014 [US1] Create base Lit custom card class `MopidyQueueCard` in `www/community/mopidy/src/mopidy-queue-card.ts` extending `LitElement` (card receives `hass` object via configuration)
- [X] T015 [US1] Define card configuration interface `MopidyQueueCardConfig` in `www/community/mopidy/src/mopidy-queue-card.ts` (type, entity, optional title/show_artwork/max_height)
- [X] T016 [US1] Implement card properties and state management in `www/community/mopidy/src/mopidy-queue-card.ts` (queueTracks, queuePosition, queueSize, isLoading, error)
- [X] T017 [US1] Implement entity state subscription in `connectedCallback()` in `www/community/mopidy/src/mopidy-queue-card.ts` using `hass.connection.subscribeEntities()`
- [X] T018 [US1] Implement entity state update handler `_updateEntityState()` in `www/community/mopidy/src/mopidy-queue-card.ts` to extract queue_tracks, queue_position, queue_size attributes
- [X] T019 [US1] Implement `render()` method in `www/community/mopidy/src/mopidy-queue-card.ts` to display loading spinner when `isLoading` is true
- [X] T020 [US1] Implement track list rendering in `render()` method in `www/community/mopidy/src/mopidy-queue-card.ts` displaying position, title, artist for each track
- [X] T021 [US1] Implement currently playing track visual distinction in `www/community/mopidy/src/mopidy-queue-card.ts` (highlight, icon, or different styling when track position matches queue_position)
- [X] T022 [US1] Implement empty state display in `www/community/mopidy/src/mopidy-queue-card.ts` showing clear message when queue_size is 0
- [X] T023 [US1] Implement error state display in `www/community/mopidy/src/mopidy-queue-card.ts` showing inline error message with retry button when entity is unavailable
- [X] T024 [US1] Implement missing metadata handling in `www/community/mopidy/src/mopidy-queue-card.ts` displaying "Unknown Artist", "Unknown Album", "Unknown Title" for None values
- [X] T025 [US1] Implement retry functionality in `www/community/mopidy/src/mopidy-queue-card.ts` to re-fetch entity state when retry button is clicked
- [X] T026 [US1] Add CSS styles for card layout, track list, loading spinner, and error states in `www/community/mopidy/src/mopidy-queue-card.ts`
- [X] T027 [US1] Compile TypeScript to JavaScript bundle `www/community/mopidy/mopidy-queue-card.js` for distribution

**Checkpoint**: At this point, User Story 1 should be fully functional - card displays queue with metadata, shows currently playing track, handles empty and error states. Can be tested independently.

---

## Phase 4: User Story 2 - Drag and Drop Reordering (Priority: P1)

**Goal**: Enable users to reorder tracks in the queue by dragging and dropping them, with visual feedback during drag operations.

**Independent Test**: Display custom card with multiple tracks, drag track from one position to another, verify visual feedback during drag, confirm queue order updates on Mopidy server after drop operation completes.

### Implementation for User Story 2

- [ ] T028 [US2] Install and bundle SortableJS library in `www/community/mopidy/mopidy-queue-card.ts` (bundle with card to create single JavaScript file, no external dependency)
- [ ] T029 [US2] Initialize SortableJS instance on track list container in `www/community/mopidy/mopidy-queue-card.ts` with touch support enabled
- [ ] T030 [US2] Configure SortableJS with 10px movement threshold in `www/community/mopidy/mopidy-queue-card.ts` to distinguish drag from tap gestures
- [ ] T031 [US2] Implement drag start handler in `www/community/mopidy/mopidy-queue-card.ts` setting `isDragging` state and showing visual feedback (semi-transparent, cursor change)
- [ ] T032 [US2] Implement drag over handler in `www/community/mopidy/mopidy-queue-card.ts` showing insertion indicator (line or highlighted area) at drop position
- [ ] T033 [US2] Implement drag end handler in `www/community/mopidy/mopidy-queue-card.ts` calculating from_position and to_position (1-based) from drag operation
- [ ] T034 [US2] Implement service call to `mopidy.move_track` in drag end handler in `www/community/mopidy/mopidy-queue-card.ts` using `hass.callService()` with from_position and to_position
- [ ] T035 [US2] Implement error handling for drag-and-drop service calls in `www/community/mopidy/mopidy-queue-card.ts` showing error message and maintaining queue state on failure
- [ ] T036 [US2] Implement operation feedback during drag-and-drop in `www/community/mopidy/mopidy-queue-card.ts` (disabled state or spinner while operation in progress)
- [ ] T037 [US2] Handle drag to same position in `www/community/mopidy/mopidy-queue-card.ts` (no service call, no state change)
- [ ] T038 [US2] Add CSS styles for drag visual feedback in `www/community/mopidy/mopidy-queue-card.ts` (semi-transparent, insertion indicators, drop zones)
- [ ] T039 [US2] Test drag-and-drop on touch devices (iOS app, mobile browser) to verify touch event handling works correctly

**Checkpoint**: At this point, User Story 2 should be fully functional - drag-and-drop reordering works with visual feedback, updates queue on server, handles errors gracefully. Can be tested independently.

---

## Phase 5: User Story 3 - Tap to Play Track (Priority: P1)

**Goal**: Enable users to tap on any track in the queue to start playing it immediately without modifying the queue order.

**Independent Test**: Display custom card with multiple tracks, tap on track that is not currently playing, verify track starts playing on Mopidy server without changing queue order.

### Implementation for User Story 3

- [X] T040 [US3] Implement tap/click event handler on track items in `www/community/mopidy/src/mopidy-queue-card.ts` detecting tap gestures (<10px movement)
- [X] T041 [US3] Implement tap-to-play logic in `www/community/mopidy/src/mopidy-queue-card.ts` getting track position from queueTracks array
- [X] T042 [US3] Implement service call to `mopidy.play_track_at_position` in tap handler in `www/community/mopidy/src/mopidy-queue-card.ts` using `hass.callService()` with position parameter
- [X] T043 [US3] Implement currently playing track tap behavior in `www/community/mopidy/src/mopidy-queue-card.ts` (restart track from beginning when tapping currently playing track)
- [X] T044 [US3] Implement error handling for tap-to-play service calls in `www/community/mopidy/src/mopidy-queue-card.ts` showing error message and maintaining queue state on failure
- [X] T045 [US3] Implement operation feedback during tap-to-play in `www/community/mopidy/src/mopidy-queue-card.ts` (disabled state or spinner while operation in progress)
- [ ] T046 [US3] Ensure tap-to-play works correctly with touch events in `www/community/mopidy/src/mopidy-queue-card.ts` (test on mobile devices)
- [X] T047 [US3] Update visual indicator to move to new playing position after tap-to-play in `www/community/mopidy/src/mopidy-queue-card.ts` (reactive update via entity subscription)

**Checkpoint**: At this point, User Story 3 should be fully functional - tap-to-play works correctly, starts playback without reordering queue, handles errors gracefully. Can be tested independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance optimization, documentation, and distribution

- [ ] T048 [P] Optimize card rendering performance for large queues (100+ tracks) in `www/community/mopidy/src/mopidy-queue-card.ts` (virtual scrolling or pagination if needed) - Note: CSS already handles scrolling efficiently, virtual scrolling deferred unless performance issues observed
- [X] T049 [P] Handle long track titles and artist names in `www/community/mopidy/src/mopidy-queue-card.ts` (truncate with ellipsis or wrap appropriately) - CSS text-overflow: ellipsis implemented
- [X] T050 [P] Implement graceful handling of rapid successive operations in `www/community/mopidy/src/mopidy-queue-card.ts` (queue operations or cancel previous) - Operation queuing implemented with _pendingOperations Set
- [X] T051 [P] Handle drag operation interruption (navigation away, browser focus loss) in `www/community/mopidy/src/mopidy-queue-card.ts` (cancel gracefully, maintain state) - SortableJS handles this automatically, state maintained via entity subscription
- [X] T052 [P] Handle external queue modifications during drag in `www/community/mopidy/src/mopidy-queue-card.ts` (cancel drag with error message when queue changes externally) - Implemented queue state validation in onEnd handler
- [X] T053 [P] Add comprehensive error messages for all error scenarios in `www/community/mopidy/src/mopidy-queue-card.ts` (network errors, service failures, invalid states) - Comprehensive error messages implemented
- [X] T054 [P] Update README.md in repository root with custom card installation and usage instructions
- [X] T055 [P] Update mopidy-CHANGELOG.md with version 2.7.0 entry documenting custom card feature
- [X] T056 [P] Bump version in `custom_components/mopidy/manifest.json` from 2.6.0 to 2.7.0
- [ ] T057 Run quickstart.md validation steps to verify all functionality works correctly (Phase 1-10 validation)
- [ ] T058 Test custom card in Home Assistant iOS app to verify identical functionality to web interface
- [ ] T059 Test custom card performance with 100 tracks to verify responsive scrolling and interactions (60fps, instant tap response)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (US1 → US2 → US3)
  - US2 and US3 can be worked on in parallel after US1 is complete (if staffed)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) and US1 - Uses queue display from US1, adds drag-and-drop functionality
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) and US1 - Uses queue display from US1, adds tap-to-play functionality

### Within Each User Story

- Card structure before rendering
- Entity subscription before state updates
- State management before interactions
- Core display before advanced features (drag, tap)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- All Foundational backend tasks can run in parallel within Phase 2 (T006-T013 are mostly independent)
- User Stories 2 and 3 can be worked on in parallel after US1 is complete (different interaction modes)
- All Polish tasks marked [P] can run in parallel (T048-T056)

---

## Parallel Example: User Story 1

```bash
# Launch foundational backend tasks in parallel (after setup):
Task: "Implement queue_tracks entity attribute in custom_components/mopidy/media_player.py"
Task: "Implement helper method to format queue tracks array in custom_components/mopidy/speaker.py"
Task: "Implement play_track_at_position method in custom_components/mopidy/speaker.py"
Task: "Add play_track_at_position service definition to custom_components/mopidy/services.yaml"
```

---

## Parallel Example: User Stories 2 and 3

```bash
# After US1 is complete, US2 and US3 can be worked on in parallel:
# Developer A: User Story 2 (Drag and Drop)
Task: "Install and configure SortableJS library in www/community/mopidy/mopidy-queue-card.ts"
Task: "Implement drag start handler in www/community/mopidy/mopidy-queue-card.ts"

# Developer B: User Story 3 (Tap to Play)
Task: "Implement tap/click event handler on track items in www/community/mopidy/mopidy-queue-card.ts"
Task: "Implement service call to mopidy.play_track_at_position in tap handler in www/community/mopidy/mopidy-queue-card.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (frontend structure, dependencies)
2. Complete Phase 2: Foundational (backend services and attributes) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (Interactive Queue Display)
4. **STOP and VALIDATE**: Test User Story 1 independently - card displays queue, shows currently playing track, handles empty/error states
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (backend services and attributes available)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - queue display works!)
3. Add User Story 2 → Test independently → Deploy/Demo (drag-and-drop reordering added)
4. Add User Story 3 → Test independently → Deploy/Demo (tap-to-play added)
5. Polish phase → Final optimizations and documentation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (queue display)
   - Developer B: Prepare for User Story 2 (research SortableJS integration)
3. Once US1 is complete:
   - Developer A: User Story 2 (drag-and-drop)
   - Developer B: User Story 3 (tap-to-play)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Backend services (Phase 2) MUST be complete before frontend card development (Phase 3+)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Test in both web interface and iOS app for cross-platform compatibility
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

