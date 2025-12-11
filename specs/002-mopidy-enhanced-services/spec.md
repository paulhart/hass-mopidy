# Feature Specification: Mopidy Enhanced Services

**Feature Branch**: `002-mopidy-enhanced-services`  
**Created**: 2025-12-11  
**Status**: Draft  
**Input**: User description: "from @CAPABILITIES_PROPOSAL.md implement the four high-priority items, while ensuring that all code will be compatible with python 3.13.9 or abovel."

## Clarifications

### Session 2025-12-11

- Q: Which services should return data vs. just succeed/fail? → A: Only query services return data (`get_history`, `lookup_track`, `find_exact`); action services return success/failure only
- Q: What fields should `get_history` and `media_history` include for each track? → A: URI, artist, album, track_name, timestamp (when played)
- Q: Which fields can be used in `filter_tracks` criteria? → A: Artist, album, genre, track_name (match existing search service fields)
- Q: For `find_exact`, what does "exact match" mean? → A: Case-insensitive full string match

## User Scenarios & Testing

### User Story 1 - Queue Management (Priority: P1)

As a Home Assistant user, I want to manage tracks in my Mopidy playback queue so that I can reorder, remove, or filter tracks without clearing the entire queue and rebuilding it.

**Why this priority**: Essential for practical queue management workflows. Users frequently need to skip unwanted tracks, reorder upcoming songs, or remove tracks matching certain criteria. Without these capabilities, users must clear and rebuild queues, which is inefficient and loses context.

**Independent Test**: Can be fully tested by calling the three new services (`move_track`, `remove_track`, `filter_tracks`) on a Mopidy instance with tracks in the queue and verifying the queue state changes correctly without affecting playback.

**Acceptance Scenarios**:

1. **Given** a Mopidy queue with 5 tracks, **When** I call `mopidy.move_track` with `from_position: 1` and `to_position: 5`, **Then** the first track moves to the end of the queue and other tracks shift accordingly (positions displayed as 1-based to users, internally handled as 0-based)
2. **Given** a Mopidy queue with multiple tracks, **When** I call `mopidy.remove_track` with `position: 2`, **Then** the track at position 2 is removed and subsequent tracks shift forward
3. **Given** a Mopidy queue with tracks from multiple artists, **When** I call `mopidy.filter_tracks` with `criteria: {artist: "Artist A"}`, **Then** all tracks by "Artist A" are removed from the queue
4. **Given** a Mopidy queue with tracks from multiple artists and albums, **When** I call `mopidy.filter_tracks` with `criteria: {artist: "Artist A", album: "Album B"}`, **Then** only tracks matching BOTH criteria (by Artist A AND from Album B) are removed
5. **Given** a Mopidy queue, **When** I call `mopidy.remove_track` with `positions: [1, 3, 5]`, **Then** all specified tracks are removed in a single operation
6. **Given** a Mopidy queue with a currently playing track at position 2, **When** I call `mopidy.remove_track` with `position: 2`, **Then** the track is removed and playback continues with the next track in queue

---

### User Story 2 - Playback History (Priority: P1)

As a Home Assistant user, I want to access my recently played tracks so that I can quickly replay songs I enjoyed or reference what was playing earlier.

**Why this priority**: High user value for music discovery and replay workflows. Enables "recently played" features common in music applications and allows users to quickly return to tracks without searching again.

**Independent Test**: Can be fully tested by playing several tracks on a Mopidy instance, then calling `mopidy.get_history` and verifying it returns the correct recently played tracks with metadata. The `play_from_history` service can be tested independently by calling it with a valid history index.

**Acceptance Scenarios**:

1. **Given** a Mopidy instance that has played 10 tracks, **When** I call `mopidy.get_history` with `limit: 5`, **Then** I receive the 5 most recently played tracks with their metadata (URI, artist, album, track_name, timestamp)
2. **Given** a Mopidy instance with playback history, **When** I inspect the `media_history` entity attribute, **Then** I see a list of the last N played tracks (default 20) with metadata (URI, artist, album, track_name, timestamp)
3. **Given** a Mopidy instance with playback history, **When** I call `mopidy.play_from_history` with `index: 0`, **Then** the most recently played track starts playing
4. **Given** a Mopidy instance with no playback history, **When** I call `mopidy.get_history`, **Then** I receive an empty list or appropriate "no history" response

---

### User Story 3 - Playlist Lifecycle Management (Priority: P1)

As a Home Assistant user, I want to create, save, and delete playlists from my Mopidy server so that I can organize my music collection and save queues as permanent playlists.

**Why this priority**: Completes the playlist management workflow. Currently users can only read playlists; adding write capabilities enables full playlist lifecycle management, allowing users to save queues, create new playlists, and manage their collection.

**Independent Test**: Can be fully tested by creating a playlist from the current queue, verifying it appears in the playlist list, saving updates to it, refreshing the playlist list, and finally deleting it. Each operation can be tested independently.

**Acceptance Scenarios**:

1. **Given** a Mopidy instance with tracks in the queue, **When** I call `mopidy.create_playlist` with `name: "My Playlist"`, **Then** a new playlist is created containing the current queue tracks and appears in the playlist list
2. **Given** an existing playlist named "My Playlist" and a queue with different tracks, **When** I call `mopidy.create_playlist` with `name: "My Playlist"`, **Then** the existing playlist is overwritten with the current queue contents
3. **Given** a Mopidy instance with an empty queue, **When** I call `mopidy.create_playlist` with `name: "My Playlist"`, **Then** an error is returned indicating the queue is empty
4. **Given** an existing playlist URI, **When** I call `mopidy.delete_playlist` with that URI, **Then** the playlist is removed from the Mopidy server
5. **Given** a Mopidy instance with tracks in the queue and an existing playlist URI, **When** I call `mopidy.save_playlist` with that URI, **Then** the current queue replaces the playlist contents
6. **Given** a Mopidy instance with an empty queue and an existing playlist URI, **When** I call `mopidy.save_playlist` with that URI, **Then** an error is returned indicating the queue is empty
7. **Given** playlists that were modified externally, **When** I call `mopidy.refresh_playlists`, **Then** the playlist list updates to reflect current server state

---

### User Story 4 - Track Metadata Lookup (Priority: P1)

As a Home Assistant user, I want to retrieve detailed track information and find exact track matches so that I can build more sophisticated automations and access rich metadata for tracks.

**Why this priority**: Enables richer automation workflows and provides access to detailed track metadata that isn't always exposed through standard media player attributes. The exact matching capability is more reliable than search for automation use cases.

**Independent Test**: Can be fully tested by calling `mopidy.lookup_track` with a valid track URI and verifying complete metadata is returned. The `find_exact` service can be tested independently with various query combinations.

**Acceptance Scenarios**:

1. **Given** a valid track URI, **When** I call `mopidy.lookup_track` with that URI, **Then** I receive complete track metadata including artist, album, duration, genre, track number, and other available fields
2. **Given** a track URI that doesn't exist, **When** I call `mopidy.lookup_track`, **Then** I receive an appropriate error indicating the track was not found
3. **Given** a query with artist, album, and track_name, **When** I call `mopidy.find_exact` with that query, **Then** I receive matching track URIs that exactly match all specified criteria (case-insensitive full string match)
4. **Given** a query with `artist: "Beatles"`, **When** I call `mopidy.find_exact`, **Then** I receive tracks where artist field exactly matches "Beatles" (case-insensitive, so "beatles" or "BEATLES" also match, but "Beatles White Album" does not)
5. **Given** a query with partial information, **When** I call `mopidy.find_exact`, **Then** I receive tracks matching the provided criteria or an empty result if no exact match exists

---

### Edge Cases

- What happens when `move_track` is called with invalid positions (negative, beyond queue length)? **Answer**: System validates positions and returns an error with clear message indicating valid range (1 to queue length).
- How does the system handle `remove_track` when the queue is empty? **Answer**: System returns an error indicating the queue is empty.
- What happens when `filter_tracks` removes all tracks from the queue? **Answer**: All matching tracks are removed, queue becomes empty, playback stops if currently playing track was removed.
- What happens when `move_track` or `remove_track` operates on the currently playing track? **Answer**: Playback continues with the next track in queue (standard Mopidy behavior).
- When `filter_tracks` receives multiple criteria (e.g., `{artist: "A", album: "B"}`), how are they combined? **Answer**: Tracks must match ALL criteria (AND logic) - all specified criteria must match for a track to be removed.
- How does `get_history` behave when fewer tracks have been played than the requested limit? **Answer**: Returns all available history tracks (fewer than requested limit).
- What happens when `create_playlist` is called with a name that already exists? **Answer**: Existing playlist with that name is overwritten with the new queue contents.
- What happens when `create_playlist` or `save_playlist` is called with an empty queue? **Answer**: System returns an error indicating the queue is empty and the operation cannot be performed.
- How does `delete_playlist` handle a non-existent playlist URI? **Answer**: System returns an error indicating the playlist was not found.
- What happens when `lookup_track` is called with an invalid or malformed URI? **Answer**: System returns an error indicating the URI is invalid or the track was not found.
- How does `find_exact` handle queries with missing required fields? **Answer**: System uses only provided fields for matching; if no fields provided, returns an error.
- What happens when services are called while Mopidy server is unavailable? **Answer**: System returns an error with clear message indicating server connection failure.
- How does the system handle playlist operations when the backend doesn't support playlist modification? **Answer**: System returns an error indicating the operation is not supported by the backend.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a `mopidy.move_track` service that reorders tracks in the queue by moving a track from one position to another (positions displayed as 1-based to users, internally handled as 0-based). This is an action service that returns success/failure only (no data returned)
- **FR-002**: System MUST provide a `mopidy.remove_track` service that removes one or more tracks from the queue by position(s) (positions displayed as 1-based to users, internally handled as 0-based). This is an action service that returns success/failure only (no data returned)
- **FR-003**: System MUST provide a `mopidy.filter_tracks` service that removes tracks from the queue matching specified criteria. Supported criteria fields are: artist, album, genre, track_name (matching existing search service fields). When multiple criteria are provided, tracks must match ALL criteria (AND logic) to be removed. This is an action service that returns success/failure only (no data returned)
- **FR-004**: System MUST provide a `mopidy.get_history` service that returns recently played tracks with metadata. Each track entry MUST include: URI, artist, album, track_name, and timestamp (when played). This service MUST support response variables (use `SupportsResponse.ONLY`) and return data in the format `{entity_id: {'result': [track_data]}}` following existing `get_search_result` pattern
- **FR-005**: System MUST expose `media_history` as an entity attribute containing the last N played tracks (default 20). Each track entry MUST include: URI, artist, album, track_name, and timestamp (when played)
- **FR-006**: System MUST provide a `mopidy.play_from_history` service that plays a track from the playback history by index. This is an action service that returns success/failure only (no data returned)
- **FR-007**: System MUST provide a `mopidy.create_playlist` service that creates a new playlist from the current queue. If a playlist with the same name already exists, it MUST be overwritten with the new queue contents. The service MUST return an error if the queue is empty. This is an action service that returns success/failure only (no data returned)
- **FR-008**: System MUST provide a `mopidy.delete_playlist` service that removes a playlist from the Mopidy server. This is an action service that returns success/failure only (no data returned)
- **FR-009**: System MUST provide a `mopidy.save_playlist` service that saves the current queue to an existing playlist. The service MUST return an error if the queue is empty. This is an action service that returns success/failure only (no data returned)
- **FR-010**: System MUST provide a `mopidy.refresh_playlists` service that refreshes the playlist list from the backend. This is an action service that returns success/failure only (no data returned)
- **FR-011**: System MUST provide a `mopidy.lookup_track` service that returns detailed metadata for a track URI. This service MUST support response variables (use `SupportsResponse.ONLY`) and return data in the format `{entity_id: {'result': track_metadata}}`
- **FR-012**: System MUST provide a `mopidy.find_exact` service that finds tracks matching exact criteria (artist, album, track_name). Matching MUST be case-insensitive full string match (e.g., "Beatles" matches "beatles" but not "Beatles White Album"). This service MUST support response variables (use `SupportsResponse.ONLY`) and return data in the format `{entity_id: {'result': [track_uris]}}`
- **FR-013**: All new services MUST handle errors gracefully with clear error messages when Mopidy server is unavailable
- **FR-014**: All new services MUST validate input parameters and provide meaningful error messages for invalid inputs
- **FR-015**: All code MUST be compatible with Python 3.13.9 or above
- **FR-016**: All new services MUST follow existing Home Assistant service patterns and conventions
- **FR-017**: System MUST update entity state appropriately after queue modification operations
- **FR-018**: System MUST handle cases where backend doesn't support certain features (e.g., playlist modification) gracefully

### Key Entities

- **Queue Track**: Represents a track in the playback queue, has position, URI, and metadata
- **Playback History Entry**: Represents a previously played track, contains URI, artist, album, track_name, and timestamp (when played)
- **Playlist**: Represents a saved collection of tracks, has URI, name, and track list
- **Track Metadata**: Represents detailed information about a track, includes artist, album, duration, genre, track number, and other available fields
- **Filter Criteria**: Represents search/filter parameters, includes artist, album, genre, and track_name fields (matching existing search service fields)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can reorder tracks in a queue of 20 tracks in under 2 seconds
- **SC-002**: Users can remove multiple tracks from a queue in a single operation without affecting playback
- **SC-003**: Users can retrieve playback history of up to 100 tracks in under 1 second
- **SC-004**: Users can create a playlist from a queue of 50 tracks in under 3 seconds
- **SC-005**: Users can lookup track metadata for any valid URI in under 500ms
- **SC-006**: All new services respond to user commands within 1 second (per existing integration standard)
- **SC-007**: 95% of service calls complete successfully when Mopidy server is available
- **SC-008**: All services provide clear error messages when operations fail
- **SC-009**: Entity attributes update correctly after queue modification operations
- **SC-010**: All code passes Python 3.13.9 compatibility checks

## Assumptions

- Mopidy server supports the standard HTTP API methods (`tracklist.move`, `tracklist.remove`, `tracklist.filter`, `history.get_history`, `playlists.create`, `playlists.delete`, `playlists.save`, `playlists.refresh`, `library.lookup`, `library.find_exact`). If a backend doesn't support certain features (e.g., playlist modification), the system will handle this gracefully per FR-018
- Playback history is maintained by the Mopidy server and persists across restarts (backend-dependent)
- Track metadata availability varies by backend (local files vs streaming services)
- Users have appropriate permissions to modify playlists (if backend requires authentication)
- Queue operations do not interrupt currently playing track unless explicitly intended. If the currently playing track is moved or removed, playback continues with the next track in queue
- Python 3.13.9+ compatibility means using only language features and standard library APIs available in that version
- Queue positions are displayed to users as 1-based (first track is position 1) but handled internally as 0-based for Mopidy API compatibility
- Filter criteria use AND logic: when multiple criteria are provided, tracks must match all criteria to be filtered
- Playlist name conflicts are resolved by overwriting existing playlists with the same name
- Empty queue operations for playlist creation/saving return errors rather than creating empty playlists

## Dependencies

- Existing Mopidy integration codebase (`custom_components/mopidy/`)
- Mopidy HTTP API client (`mopidyapi` library)
- Home Assistant core media player integration framework
- Python 3.13.9 or above runtime environment

## Constraints

- Must maintain backward compatibility with existing Mopidy integration installations
- Must follow existing code patterns and error handling conventions
- Must not break existing services or entity attributes
- All new code must be compatible with Python 3.13.9+
- Must handle backend feature availability gracefully (not all Mopidy backends support all features)
