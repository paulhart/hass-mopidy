# Tasks: Mopidy Enhanced Services

**Input**: Design documents from `/specs/002-mopidy-enhanced-services/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual smoke testing per quickstart.md - no automated test tasks included per spec requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `custom_components/mopidy/` at repository root
- Paths shown below use actual file locations

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add any shared constants or helper functions needed across multiple user stories

- [ ] T001 Add position conversion helper function `_convert_user_position_to_api()` in `custom_components/mopidy/speaker.py` to convert 1-based user positions to 0-based API positions
- [ ] T002 Add position validation helper function `_validate_queue_position()` in `custom_components/mopidy/speaker.py` to validate 1-based positions are in valid range (1 to queue_length)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create helper function `_format_history_entry()` in `custom_components/mopidy/speaker.py` to format Mopidy history entries with required fields (URI, artist, album, track_name, timestamp)
- [ ] T004 Create helper function `_match_filter_criteria()` in `custom_components/mopidy/speaker.py` to check if a track matches filter criteria (case-insensitive, AND logic)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Queue Management (Priority: P1) 🎯 MVP

**Goal**: Enable users to reorder, remove, and filter tracks in the playback queue without clearing and rebuilding

**Independent Test**: Can be fully tested by calling the three new services (`move_track`, `remove_track`, `filter_tracks`) on a Mopidy instance with tracks in the queue and verifying the queue state changes correctly without affecting playback.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Add service schema `MOVE_TRACK_SCHEMA` to `custom_components/mopidy/media_player.py` with `from_position` and `to_position` parameters (both required integers)
- [ ] T006 [P] [US1] Add service schema `REMOVE_TRACK_SCHEMA` to `custom_components/mopidy/media_player.py` with `position` (optional int) and `positions` (optional list of ints) parameters
- [ ] T007 [P] [US1] Add service schema `FILTER_TRACKS_SCHEMA` to `custom_components/mopidy/media_player.py` with `criteria` parameter (required dict with optional artist, album, genre, track_name fields)
- [ ] T008 [P] [US1] Add service definition for `mopidy.move_track` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T009 [P] [US1] Add service definition for `mopidy.remove_track` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T010 [P] [US1] Add service definition for `mopidy.filter_tracks` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T011 [US1] Implement `move_track()` method in `custom_components/mopidy/speaker.py` that calls `api.tracklist.move()` with position conversion and validation
- [ ] T012 [US1] Implement `remove_track()` method in `custom_components/mopidy/speaker.py` that handles single or multiple positions and calls `api.tracklist.remove()` with position conversion
- [ ] T013 [US1] Implement `filter_tracks()` method in `custom_components/mopidy/speaker.py` that iterates queue tracks, matches against criteria using `_match_filter_criteria()`, and removes matches
- [ ] T014 [US1] Add error handling to `move_track()` in `custom_components/mopidy/speaker.py` with specific exceptions and context logging (hostname, port, operation)
- [ ] T015 [US1] Add error handling to `remove_track()` in `custom_components/mopidy/speaker.py` with specific exceptions and context logging
- [ ] T016 [US1] Add error handling to `filter_tracks()` in `custom_components/mopidy/speaker.py` with specific exceptions and context logging
- [ ] T017 [US1] Implement `service_move_track()` method in `custom_components/mopidy/media_player.py` that calls `speaker.move_track()` and updates entity state
- [ ] T018 [US1] Implement `service_remove_track()` method in `custom_components/mopidy/media_player.py` that calls `speaker.remove_track()` and updates entity state
- [ ] T019 [US1] Implement `service_filter_tracks()` method in `custom_components/mopidy/media_player.py` that calls `speaker.filter_tracks()` and updates entity state
- [ ] T020 [US1] Register `mopidy.move_track` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `MOVE_TRACK_SCHEMA`
- [ ] T021 [US1] Register `mopidy.remove_track` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `REMOVE_TRACK_SCHEMA`
- [ ] T022 [US1] Register `mopidy.filter_tracks` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `FILTER_TRACKS_SCHEMA`
- [ ] T023 [US1] Add type hints to `move_track()`, `remove_track()`, and `filter_tracks()` methods in `custom_components/mopidy/speaker.py`
- [ ] T024 [US1] Add type hints to `service_move_track()`, `service_remove_track()`, and `service_filter_tracks()` methods in `custom_components/mopidy/media_player.py`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Playback History (Priority: P1)

**Goal**: Enable users to access recently played tracks and replay them quickly

**Independent Test**: Can be fully tested by playing several tracks on a Mopidy instance, then calling `mopidy.get_history` and verifying it returns the correct recently played tracks with metadata. The `play_from_history` service can be tested independently by calling it with a valid history index.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Add service schema `GET_HISTORY_SCHEMA` to `custom_components/mopidy/media_player.py` with `limit` parameter (optional int, default 20)
- [ ] T026 [P] [US2] Add service schema `PLAY_FROM_HISTORY_SCHEMA` to `custom_components/mopidy/media_player.py` with `index` parameter (required int)
- [ ] T027 [P] [US2] Add service definition for `mopidy.get_history` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T028 [P] [US2] Add service definition for `mopidy.play_from_history` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T029 [US2] Implement `get_history()` method in `custom_components/mopidy/speaker.py` that calls `api.history.get_history()` and formats entries using `_format_history_entry()`
- [ ] T030 [US2] Implement `play_from_history()` method in `custom_components/mopidy/speaker.py` that retrieves history entry by index and plays track via `play_media()`
- [ ] T031 [US2] Add error handling to `get_history()` in `custom_components/mopidy/speaker.py` with specific exceptions and context logging
- [ ] T032 [US2] Add error handling to `play_from_history()` in `custom_components/mopidy/speaker.py` with specific exceptions and context logging (including index validation)
- [ ] T033 [US2] Implement `service_get_history()` method in `custom_components/mopidy/media_player.py` that calls `speaker.get_history()` and returns formatted response with `SupportsResponse.ONLY`
- [ ] T034 [US2] Implement `service_play_from_history()` method in `custom_components/mopidy/media_player.py` that calls `speaker.play_from_history()`
- [ ] T035 [US2] Register `mopidy.get_history` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` with `supports_response=SupportsResponse.ONLY`
- [ ] T036 [US2] Register `mopidy.play_from_history` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py`
- [ ] T037 [US2] Add `media_history` property to `MopidyMediaPlayerEntity` class in `custom_components/mopidy/media_player.py` that returns cached history entries (last 20)
- [ ] T038 [US2] Update `update()` method in `custom_components/mopidy/media_player.py` to refresh `media_history` attribute from speaker history
- [ ] T039 [US2] Add type hints to `get_history()` and `play_from_history()` methods in `custom_components/mopidy/speaker.py`
- [ ] T040 [US2] Add type hints to `service_get_history()`, `service_play_from_history()`, and `media_history` property in `custom_components/mopidy/media_player.py`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Playlist Lifecycle Management (Priority: P1)

**Goal**: Enable users to create, save, and delete playlists from Mopidy server

**Independent Test**: Can be fully tested by creating a playlist from the current queue, verifying it appears in the playlist list, saving updates to it, refreshing the playlist list, and finally deleting it. Each operation can be tested independently.

### Implementation for User Story 3

- [ ] T041 [P] [US3] Add service schema `CREATE_PLAYLIST_SCHEMA` to `custom_components/mopidy/media_player.py` with `name` parameter (required string)
- [ ] T042 [P] [US3] Add service schema `DELETE_PLAYLIST_SCHEMA` to `custom_components/mopidy/media_player.py` with `uri` parameter (required string)
- [ ] T043 [P] [US3] Add service schema `SAVE_PLAYLIST_SCHEMA` to `custom_components/mopidy/media_player.py` with `uri` parameter (required string)
- [ ] T044 [P] [US3] Add service schema `REFRESH_PLAYLISTS_SCHEMA` to `custom_components/mopidy/media_player.py` (empty schema, no parameters)
- [ ] T045 [P] [US3] Add service definition for `mopidy.create_playlist` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T046 [P] [US3] Add service definition for `mopidy.delete_playlist` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T047 [P] [US3] Add service definition for `mopidy.save_playlist` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T048 [P] [US3] Add service definition for `mopidy.refresh_playlists` to `custom_components/mopidy/services.yaml` with description
- [ ] T049 [US3] Implement `create_playlist()` method in `custom_components/mopidy/speaker.py` that checks for name conflicts by iterating `library.playlists` to find matching name, gets queue tracks, and calls `api.playlists.create()` or `api.playlists.save()` for overwrite
- [ ] T050 [US3] Implement `delete_playlist()` method in `custom_components/mopidy/speaker.py` that calls `api.playlists.delete()` with URI
- [ ] T051 [US3] Implement `save_playlist()` method in `custom_components/mopidy/speaker.py` that gets queue tracks and calls `api.playlists.save()` with playlist URI
- [ ] T052 [US3] Implement `refresh_playlists()` method in `custom_components/mopidy/speaker.py` that calls `api.playlists.refresh()` and updates `_attr_source_list`
- [ ] T053 [US3] Add error handling to `create_playlist()` in `custom_components/mopidy/speaker.py` with validation for empty queue and backend unsupported errors
- [ ] T054 [US3] Add error handling to `delete_playlist()` in `custom_components/mopidy/speaker.py` with validation for playlist not found and backend unsupported errors
- [ ] T055 [US3] Add error handling to `save_playlist()` in `custom_components/mopidy/speaker.py` with validation for empty queue and backend unsupported errors
- [ ] T056 [US3] Add error handling to `refresh_playlists()` in `custom_components/mopidy/speaker.py` with specific exceptions and context logging
- [ ] T057 [US3] Implement `service_create_playlist()` method in `custom_components/mopidy/media_player.py` that calls `speaker.create_playlist()` and triggers playlist list refresh
- [ ] T058 [US3] Implement `service_delete_playlist()` method in `custom_components/mopidy/media_player.py` that calls `speaker.delete_playlist()` and triggers playlist list refresh
- [ ] T059 [US3] Implement `service_save_playlist()` method in `custom_components/mopidy/media_player.py` that calls `speaker.save_playlist()` and triggers playlist list refresh
- [ ] T060 [US3] Implement `service_refresh_playlists()` method in `custom_components/mopidy/media_player.py` that calls `speaker.refresh_playlists()`
- [ ] T061 [US3] Register `mopidy.create_playlist` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `CREATE_PLAYLIST_SCHEMA`
- [ ] T062 [US3] Register `mopidy.delete_playlist` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `DELETE_PLAYLIST_SCHEMA`
- [ ] T063 [US3] Register `mopidy.save_playlist` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `SAVE_PLAYLIST_SCHEMA`
- [ ] T064 [US3] Register `mopidy.refresh_playlists` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` using `async_register_entity_service()` with `REFRESH_PLAYLISTS_SCHEMA`
- [ ] T065 [US3] Add type hints to `create_playlist()`, `delete_playlist()`, `save_playlist()`, and `refresh_playlists()` methods in `custom_components/mopidy/speaker.py`
- [ ] T066 [US3] Add type hints to all playlist service methods in `custom_components/mopidy/media_player.py`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Track Metadata Lookup (Priority: P1)

**Goal**: Enable users to retrieve detailed track information and find exact track matches for automation workflows

**Independent Test**: Can be fully tested by calling `mopidy.lookup_track` with a valid track URI and verifying complete metadata is returned. The `find_exact` service can be tested independently with various query combinations.

### Implementation for User Story 4

- [ ] T067 [P] [US4] Add service schema `LOOKUP_TRACK_SCHEMA` to `custom_components/mopidy/media_player.py` with `uri` parameter (required string)
- [ ] T068 [P] [US4] Add service schema `FIND_EXACT_SCHEMA` to `custom_components/mopidy/media_player.py` with `query` parameter (required dict with optional artist, album, track_name fields)
- [ ] T069 [P] [US4] Add service definition for `mopidy.lookup_track` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T070 [P] [US4] Add service definition for `mopidy.find_exact` to `custom_components/mopidy/services.yaml` with description and field definitions
- [ ] T071 [US4] Implement `lookup_track()` method in `custom_components/mopidy/speaker.py` that calls `api.library.lookup()` and returns formatted track metadata
- [ ] T072 [US4] Implement `find_exact()` method in `custom_components/mopidy/speaker.py` that calls `api.library.find_exact()` with case-insensitive full string matching and returns list of track URIs
- [ ] T073 [US4] Add error handling to `lookup_track()` in `custom_components/mopidy/speaker.py` with validation for invalid URI and track not found errors
- [ ] T074 [US4] Add error handling to `find_exact()` in `custom_components/mopidy/speaker.py` with validation for empty query and specific exceptions
- [ ] T075 [US4] Implement `service_lookup_track()` method in `custom_components/mopidy/media_player.py` that calls `speaker.lookup_track()` and returns formatted response with `SupportsResponse.ONLY`
- [ ] T076 [US4] Implement `service_find_exact()` method in `custom_components/mopidy/media_player.py` that calls `speaker.find_exact()` and returns formatted response with `SupportsResponse.ONLY`
- [ ] T077 [US4] Register `mopidy.lookup_track` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` with `supports_response=SupportsResponse.ONLY`
- [ ] T078 [US4] Register `mopidy.find_exact` service in `async_setup_entry()` in `custom_components/mopidy/media_player.py` with `supports_response=SupportsResponse.ONLY`
- [ ] T079 [US4] Add type hints to `lookup_track()` and `find_exact()` methods in `custom_components/mopidy/speaker.py`
- [ ] T080 [US4] Add type hints to `service_lookup_track()` and `service_find_exact()` methods in `custom_components/mopidy/media_player.py`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, release management, and cross-cutting improvements

- [ ] T081 [P] Run quickstart.md validation steps to verify all new services work correctly
- [ ] T082 [P] Verify all error handlers include context (hostname, port, operation) in log messages
- [ ] T083 [P] Verify position conversion (1-based to 0-based) works correctly for all queue operations
- [ ] T084 [P] Verify filter criteria AND logic works correctly (multiple criteria must all match)
- [ ] T085 [P] Verify history entries formatted correctly with all required fields (URI, artist, album, track_name, timestamp)
- [ ] T086 [P] Verify query services return data in correct format `{entity_id: {'result': data}}`
- [ ] T087 [P] Verify action services return success/failure only (no data)
- [ ] T088 [P] Verify entity state updates correctly after queue modification operations
- [ ] T089 [P] Verify `media_history` attribute updates correctly and is bounded to 20 entries
- [ ] T090 [P] Verify all new code is compatible with Python 3.13.9+
- [ ] T091 [P] Run linter/type checker and verify zero new warnings introduced
- [ ] T092 [P] Code cleanup and formatting consistency check
- [ ] T093 Increment version in `custom_components/mopidy/manifest.json` from "2.4.2" to "2.5.0" (MINOR bump for new features)
- [ ] T094 Add new changelog entry section `## [2.5.0] - YYYY-MM-DD` to `mopidy-CHANGELOG.md` at the top
- [ ] T095 Categorize changes in changelog under "Added" section: queue management services, playback history services, playlist lifecycle services, track metadata lookup services
- [ ] T096 Verify version number in changelog matches version in `manifest.json`
- [ ] T097 Final review: All constitution principles satisfied, all user stories independently testable
- [ ] T098 [P] Validate SC-001: Queue operations (move_track, remove_track, filter_tracks) complete in under 2 seconds for 20 tracks
- [ ] T099 [P] Validate SC-003: History retrieval (get_history) completes in under 1 second for up to 100 tracks
- [ ] T100 [P] Validate SC-004: Playlist creation (create_playlist) completes in under 3 seconds for 50 tracks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (all are P1, so order is flexible)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Service schemas before service registration
- Speaker methods before entity service methods
- Service registration after service method implementation
- Error handling integrated with method implementation
- Type hints added during implementation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all User Stories can start in parallel
- Service schema definitions marked [P] can run in parallel (different schemas)
- Service definitions in services.yaml marked [P] can run in parallel (different services)
- Speaker method implementations marked [P] can run in parallel (different methods, different files)
- Entity service method implementations marked [P] can run in parallel (different methods)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all service schema definitions together:
Task: "Add service schema MOVE_TRACK_SCHEMA to media_player.py"
Task: "Add service schema REMOVE_TRACK_SCHEMA to media_player.py"
Task: "Add service schema FILTER_TRACKS_SCHEMA to media_player.py"

# Launch all service.yaml definitions together:
Task: "Add service definition for mopidy.move_track to services.yaml"
Task: "Add service definition for mopidy.remove_track to services.yaml"
Task: "Add service definition for mopidy.filter_tracks to services.yaml"

# Launch all speaker method implementations together:
Task: "Implement move_track() method in speaker.py"
Task: "Implement remove_track() method in speaker.py"
Task: "Implement filter_tracks() method in speaker.py"
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
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (queue management)
   - Developer B: User Story 2 (playback history)
   - Developer C: User Story 3 (playlist lifecycle)
   - Developer D: User Story 4 (track lookup)
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
- Position conversion: Always convert 1-based user positions to 0-based API positions
- Error handling: Always include context (hostname, port, operation) in error logs
- Type hints: Add to all new methods and properties
- Python 3.13.9+ compatibility: Use only language features available in that version

