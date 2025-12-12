# Tasks: Mopidy UI Enhancements

**Input**: Design documents from `/specs/003-ui-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing via Home Assistant UI (no automated test tasks - see quickstart.md for validation steps)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **UI Templates**: `docs/ui-templates/` at repository root
- **Helper Entities**: `docs/ui-templates/helpers.yaml` (example configuration)
- **Documentation**: `README.md` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [ ] T001 Create directory structure for UI templates in docs/ui-templates/
- [ ] T002 [P] Create placeholder README section for UI templates in README.md
- [ ] T003 [P] Verify Mopidy integration (002-mopidy-enhanced-services) is available and services are accessible

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper entities configuration that all UI templates depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create helper entities example configuration in docs/ui-templates/helpers.yaml with input_number helpers for queue positions (from_position, to_position, remove_position)
- [ ] T005 [P] Add input_number helper for history index in docs/ui-templates/helpers.yaml
- [ ] T006 [P] Add input_text helpers for filter criteria (artist, album, genre, track_name) in docs/ui-templates/helpers.yaml
- [ ] T007 [P] Add input_text helper for playlist name in docs/ui-templates/helpers.yaml
- [ ] T008 Document helper entities usage and configuration in docs/ui-templates/helpers.yaml with comments explaining each helper's purpose

**Checkpoint**: Foundation ready - helper entities documented, user story implementation can now begin

---

## Phase 3: User Story 1 - Queue Management Interface (Priority: P1) 🎯 MVP

**Goal**: Provide a visual queue management interface that allows users to reorder, remove, and filter tracks using template-based Lovelace cards.

**Independent Test**: Display queue management template in Home Assistant dashboard, verify queue information (position, size) displays correctly, test move track operation with position inputs, test remove track operation, test filter tracks operation, verify queue state updates after refresh.

### Implementation for User Story 1

- [ ] T009 [US1] Create queue management template file in docs/ui-templates/queue-management.yaml with card structure (type, title, entities)
- [ ] T010 [US1] Add queue state display section in docs/ui-templates/queue-management.yaml showing queue_position and queue_size using template card with Jinja2
- [ ] T011 [US1] Add empty queue state handling in docs/ui-templates/queue-management.yaml with conditional message when queue_size == 0
- [ ] T012 [US1] Add current playing track indicator in docs/ui-templates/queue-management.yaml showing which track is currently playing (highlight queue_position)
- [ ] T013 [US1] Add move track controls section in docs/ui-templates/queue-management.yaml with input_number helpers for from_position and to_position
- [ ] T014 [US1] Add move track button in docs/ui-templates/queue-management.yaml that calls mopidy.move_track service with validation (check positions are within queue_size range)
- [ ] T015 [US1] Add remove track controls section in docs/ui-templates/queue-management.yaml with input_number helper for position
- [ ] T016 [US1] Add remove track button in docs/ui-templates/queue-management.yaml that calls mopidy.remove_track service with validation (check position is within queue_size range)
- [ ] T017 [US1] Add filter tracks controls section in docs/ui-templates/queue-management.yaml with input_text helpers for artist, album, genre, track_name
- [ ] T018 [US1] Add filter tracks button in docs/ui-templates/queue-management.yaml that calls mopidy.filter_tracks service with criteria dictionary
- [ ] T019 [US1] Add input validation error messages in docs/ui-templates/queue-management.yaml using template conditionals to display errors for invalid positions or empty criteria
- [ ] T020 [US1] Add refresh button in docs/ui-templates/queue-management.yaml that calls homeassistant.update_entity service to refresh entity state after operations
- [ ] T020a [US1] Add success message feedback in docs/ui-templates/queue-management.yaml using template variables to display success messages after move/remove/filter operations complete
- [ ] T020b [US1] Add loading indicator feedback in docs/ui-templates/queue-management.yaml using template conditionals to show loading state during service calls (optional, recommended for better UX)
- [ ] T021 [US1] Add entity unavailable error handling in docs/ui-templates/queue-management.yaml with conditional message when entity state is unavailable
- [ ] T022 [US1] Add responsive layout configuration in docs/ui-templates/queue-management.yaml using grid or vertical-stack cards for mobile compatibility (320px+)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - queue management interface complete with all operations

---

## Phase 4: User Story 2 - Playback History Display (Priority: P1)

**Goal**: Provide a visual playback history interface that displays recently played tracks with metadata and allows users to replay tracks.

**Independent Test**: Display playback history template in Home Assistant dashboard, verify history list displays with metadata (title, artist, album, timestamp), test clicking a track to replay it, verify timestamps are formatted in human-readable format, verify missing metadata is handled gracefully.

### Implementation for User Story 2

- [ ] T023 [US2] Create playback history template file in docs/ui-templates/playback-history.yaml with card structure (type, title, entities)
- [ ] T024 [US2] Add history list display section in docs/ui-templates/playback-history.yaml using template card to iterate over media_history attribute
- [ ] T025 [US2] Add track metadata display in docs/ui-templates/playback-history.yaml showing track_name, artist, album with Jinja2 template formatting
- [ ] T026 [US2] Add timestamp formatting in docs/ui-templates/playback-history.yaml using relative_time filter to display human-readable timestamps (e.g., "2 hours ago")
- [ ] T027 [US2] Add missing metadata handling in docs/ui-templates/playback-history.yaml with default values (e.g., "Unknown Artist", "Unknown Album") using Jinja2 default filter
- [ ] T028 [US2] Add track artwork display in docs/ui-templates/playback-history.yaml using picture or picture-entity cards when artwork available (if entity_picture attribute exists)
- [ ] T029 [US2] Add empty history state handling in docs/ui-templates/playback-history.yaml with conditional message when media_history is empty
- [ ] T030 [US2] Add play from history button/action in docs/ui-templates/playback-history.yaml for each track that calls mopidy.play_from_history service with index parameter
- [ ] T031 [US2] Add history index calculation in docs/ui-templates/playback-history.yaml to convert 0-based list index to 1-based service index (index = loop.index)
- [ ] T031a [US2] Add success message feedback in docs/ui-templates/playback-history.yaml to display confirmation when track starts playing from history (optional, recommended for better UX)
- [ ] T032 [US2] Add scrolling support in docs/ui-templates/playback-history.yaml using vertical-stack or entities card with appropriate height for long history lists
- [ ] T033 [US2] Add responsive layout configuration in docs/ui-templates/playback-history.yaml using grid or vertical-stack cards for mobile compatibility (320px+)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - history display interface complete with replay functionality

---

## Phase 5: User Story 3 - Playlist Management Interface (Priority: P2)

**Goal**: Provide a visual playlist management interface that allows users to create, save, and delete playlists using template-based Lovelace cards.

**Independent Test**: Display playlist management template in Home Assistant dashboard, verify playlist list displays with names extracted from URIs, test creating a new playlist from queue, test saving queue to existing playlist, test deleting playlist with confirmation, test refreshing playlist list.

### Implementation for User Story 3

- [ ] T034 [US3] Create playlist management template file in docs/ui-templates/playlist-management.yaml with card structure (type, title, entities)
- [ ] T035 [US3] Add playlist list display section in docs/ui-templates/playlist-management.yaml using template card to iterate over source_list attribute
- [ ] T036 [US3] Add playlist name extraction in docs/ui-templates/playlist-management.yaml using Jinja2 to extract name from URI (remove scheme prefix like "m3u:")
- [ ] T037 [US3] Add create playlist controls section in docs/ui-templates/playlist-management.yaml with input_text helper for playlist name
- [ ] T038 [US3] Add create playlist button in docs/ui-templates/playlist-management.yaml that calls mopidy.create_playlist service with validation (check queue_size > 0, name is non-empty)
- [ ] T039 [US3] Add empty queue validation in docs/ui-templates/playlist-management.yaml with error message when queue is empty for create/save operations
- [ ] T040 [US3] Add save to playlist controls section in docs/ui-templates/playlist-management.yaml with playlist selection (dropdown or button list)
- [ ] T041 [US3] Add save to playlist button in docs/ui-templates/playlist-management.yaml that calls mopidy.save_playlist service with selected playlist URI
- [ ] T042 [US3] Add delete playlist button in docs/ui-templates/playlist-management.yaml with confirmation dialog (using button confirmation option) that calls mopidy.delete_playlist service
- [ ] T043 [US3] Add refresh playlists button in docs/ui-templates/playlist-management.yaml that calls mopidy.refresh_playlists service followed by homeassistant.update_entity
- [ ] T044 [US3] Add playlist operation success feedback in docs/ui-templates/playlist-management.yaml with template variables or messages to indicate operation completion (create, save, delete, refresh)
- [ ] T044a [US3] Add loading indicator feedback in docs/ui-templates/playlist-management.yaml using template conditionals to show loading state during playlist operations (optional, recommended for better UX)
- [ ] T045 [US3] Add empty playlist list handling in docs/ui-templates/playlist-management.yaml with conditional message when source_list is empty
- [ ] T046 [US3] Add responsive layout configuration in docs/ui-templates/playlist-management.yaml using grid or vertical-stack cards for mobile compatibility (320px+)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - playlist management interface complete with all operations

---

## Phase 6: User Story 4 - Enhanced Media Player Card Integration (Priority: P2)

**Goal**: Integrate queue and history access into the standard media player card with clearly labeled controls for quick access.

**Independent Test**: Display enhanced media player card in Home Assistant dashboard, verify "Manage Queue" and "View History" buttons/links are visible, test clicking "Manage Queue" to access queue interface, test clicking "View History" to access history interface, verify queue size is displayed in card, verify controls handle empty queue state.

### Implementation for User Story 4

- [ ] T047 [US4] Create enhanced media player card template file in docs/ui-templates/media-player-enhanced.yaml with media player entity card
- [ ] T048 [US4] Add queue size display in docs/ui-templates/media-player-enhanced.yaml showing queue_size attribute as part of card information using template or custom card
- [ ] T049 [US4] Add "Manage Queue" button/link in docs/ui-templates/media-player-enhanced.yaml that navigates to queue management interface or opens modal
- [ ] T050 [US4] Add "View History" button/link in docs/ui-templates/media-player-enhanced.yaml that navigates to history interface or opens modal
- [ ] T051 [US4] Add empty queue state handling in docs/ui-templates/media-player-enhanced.yaml with disabled state or appropriate indicator for "Manage Queue" when queue is empty
- [ ] T052 [US4] Add responsive layout configuration in docs/ui-templates/media-player-enhanced.yaml ensuring controls are accessible on mobile devices (320px+)
- [ ] T053 [US4] Add integration documentation in docs/ui-templates/media-player-enhanced.yaml with comments explaining how to embed queue/history interfaces inline or as separate views

**Checkpoint**: At this point, all user stories should be independently functional - enhanced media player card integration complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final polish

- [ ] T054 [P] Update README.md with UI templates section explaining how to use templates, where to find them, and installation instructions
- [ ] T055 [P] Add template usage examples in README.md showing how to copy templates into Home Assistant dashboards
- [ ] T056 [P] Add helper entities setup instructions in README.md explaining how to configure input_number and input_text helpers
- [ ] T057 [P] Add troubleshooting section in README.md for common template issues (YAML syntax, entity IDs, service calls)
- [ ] T058 [P] Add template customization guide in README.md explaining how users can modify templates for their needs
- [ ] T059 [P] Add responsive design notes in each template file (docs/ui-templates/*.yaml) with comments about mobile compatibility
- [ ] T060 [P] Add entity ID placeholder documentation in each template file (docs/ui-templates/*.yaml) explaining users must replace with their entity ID
- [ ] T060a [P] Add multiple entity instance documentation in README.md explaining that templates support multiple Mopidy servers by using different entity_id values in service calls
- [ ] T061 [P] Validate all templates for YAML syntax correctness using yamllint or Home Assistant config validation
- [ ] T062 [P] Validate all templates for Jinja2 syntax correctness by testing in Home Assistant dashboard editor
- [ ] T063 [P] Run quickstart.md validation steps to verify all templates work correctly with Mopidy entities
- [ ] T064 [P] Test all templates on mobile devices (320px+ screen width) to verify responsive design
- [ ] T065 [P] Test all templates with large queues (100+ tracks) to verify performance
- [ ] T066 [P] Test all templates with empty states (empty queue, empty history, no playlists) to verify error handling
- [ ] T067 [P] Test all templates with entity unavailable state to verify error messages display correctly
- [ ] T068 [P] Test visual feedback (success messages, loading indicators) in all templates to verify FR-022 compliance
- [ ] T069 Update version in custom_components/mopidy/manifest.json (MINOR version bump: 2.5.0 → 2.6.0)
- [ ] T070 Update changelog in mopidy-CHANGELOG.md with new version entry documenting UI template additions

**Checkpoint**: All templates validated, documented, and ready for release

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (helper entities needed)
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 P1 → US2 P1 → US3 P2 → US4 P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - References US1 and US2 interfaces but can be implemented independently

### Within Each User Story

- Template structure before content
- Basic display before interactive controls
- Service call buttons after input helpers
- Validation and error handling after core functionality
- Responsive design configuration at the end
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational helper entities together:
Task: "Add input_number helper for history index in docs/ui-templates/helpers.yaml"
Task: "Add input_text helpers for filter criteria in docs/ui-templates/helpers.yaml"
Task: "Add input_text helper for playlist name in docs/ui-templates/helpers.yaml"

# Launch User Story 1 template sections together (after structure created):
Task: "Add queue state display section in docs/ui-templates/queue-management.yaml"
Task: "Add empty queue state handling in docs/ui-templates/queue-management.yaml"
Task: "Add current playing track indicator in docs/ui-templates/queue-management.yaml"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Queue Management)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md validation steps
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Polish & Documentation → Final release
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Queue Management)
   - Developer B: User Story 2 (History Display)
   - Developer C: User Story 3 (Playlist Management)
3. After US1-US3 complete:
   - Developer A: User Story 4 (Media Player Integration)
   - Developer B: Documentation (README updates)
   - Developer C: Validation & Testing
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Templates are YAML files - validate syntax before testing in Home Assistant
- Test templates in Home Assistant dashboard editor before finalizing
- Replace entity ID placeholders in templates with actual Mopidy entity IDs
- Helper entities must be configured in Home Assistant before using templates
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Manual testing required - use quickstart.md validation steps for each user story

