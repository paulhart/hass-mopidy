# Quickstart: Mopidy Enhanced Services

**Feature**: Mopidy Enhanced Services  
**Date**: 2025-12-11

## Purpose

Validate that all new Mopidy services and features are implemented correctly and function as specified.

## Prerequisites

- Home Assistant instance running
- Mopidy server accessible with tracks in library
- Mopidy server with playback history (play some tracks first)
- Access to Home Assistant Developer Tools → Services
- Access to Home Assistant logs

## Validation Steps

### 1. Queue Management Services

#### Test: `mopidy.move_track`
1. Add tracks to queue (play an album or playlist)
2. Note current queue order
3. Call `mopidy.move_track` service:
   - `entity_id`: Your Mopidy entity
   - `from_position`: 1 (first track)
   - `to_position`: 5 (or last position)
4. **Expected**: First track moves to position 5, other tracks shift accordingly
5. **Verify**: Queue order updated, playback continues normally

#### Test: `mopidy.remove_track` (single position)
1. Queue has multiple tracks
2. Call `mopidy.remove_track` service:
   - `entity_id`: Your Mopidy entity
   - `position`: 2
3. **Expected**: Track at position 2 removed, subsequent tracks shift forward
4. **Verify**: Queue size decreased by 1

#### Test: `mopidy.remove_track` (multiple positions)
1. Queue has at least 5 tracks
2. Call `mopidy.remove_track` service:
   - `entity_id`: Your Mopidy entity
   - `positions`: [1, 3, 5]
3. **Expected**: All specified tracks removed in single operation
4. **Verify**: Queue size decreased by 3

#### Test: `mopidy.filter_tracks` (single criteria)
1. Queue has tracks from multiple artists
2. Call `mopidy.filter_tracks` service:
   - `entity_id`: Your Mopidy entity
   - `criteria`: `{artist: "Artist Name"}`
3. **Expected**: All tracks by that artist removed
4. **Verify**: Queue updated, matching tracks gone

#### Test: `mopidy.filter_tracks` (multiple criteria - AND logic)
1. Queue has tracks from multiple artists and albums
2. Call `mopidy.filter_tracks` service:
   - `entity_id`: Your Mopidy entity
   - `criteria`: `{artist: "Artist A", album: "Album B"}`
3. **Expected**: Only tracks matching BOTH criteria removed
4. **Verify**: Tracks matching only one criteria remain

#### Test: Position validation
1. Queue has 5 tracks
2. Call `mopidy.move_track` with `from_position: 10` (invalid)
3. **Expected**: Error message indicating valid range (1 to 5)
4. **Verify**: Queue unchanged, error logged

### 2. Playback History Services

#### Test: `mopidy.get_history` (with response)
1. Play several tracks on Mopidy (at least 5)
2. Call `mopidy.get_history` service:
   - `entity_id`: Your Mopidy entity
   - `limit`: 5
   - Use `response_variable` to capture result
3. **Expected**: Returns 5 most recently played tracks with metadata (URI, artist, album, track_name, timestamp)
4. **Verify**: Response variable contains list of track dicts, index 0 = most recent

#### Test: `media_history` entity attribute
1. Play several tracks (at least 10)
2. Inspect entity attributes in Developer Tools → States
3. Find `media_history` attribute
4. **Expected**: List of last 20 played tracks (or fewer if less than 20 played)
5. **Verify**: Each entry has URI, artist, album, track_name, timestamp

#### Test: `mopidy.play_from_history`
1. Ensure playback history exists (play some tracks)
2. Call `mopidy.play_from_history` service:
   - `entity_id`: Your Mopidy entity
   - `index`: 0 (most recent)
3. **Expected**: Most recently played track starts playing
4. **Verify**: Track plays correctly

#### Test: Empty history handling
1. Fresh Mopidy instance with no playback history
2. Call `mopidy.get_history`
3. **Expected**: Returns empty list (not error)
4. **Verify**: No exceptions raised

### 3. Playlist Management Services

#### Test: `mopidy.create_playlist`
1. Queue has tracks (at least 3)
2. Call `mopidy.create_playlist` service:
   - `entity_id`: Your Mopidy entity
   - `name`: "Test Playlist"
3. **Expected**: New playlist created with queue contents
4. **Verify**: Playlist appears in source list, contains queue tracks

#### Test: `mopidy.create_playlist` (name conflict - overwrite)
1. Playlist "Test Playlist" exists from previous test
2. Queue has different tracks
3. Call `mopidy.create_playlist` with same name
4. **Expected**: Existing playlist overwritten with new queue contents
5. **Verify**: Playlist updated, old contents replaced

#### Test: `mopidy.create_playlist` (empty queue error)
1. Clear queue (or ensure queue is empty)
2. Call `mopidy.create_playlist` service
3. **Expected**: Error message "Queue is empty"
4. **Verify**: No playlist created, error logged

#### Test: `mopidy.save_playlist`
1. Queue has tracks
2. Get existing playlist URI from source list
3. Call `mopidy.save_playlist` service:
   - `entity_id`: Your Mopidy entity
   - `uri`: Playlist URI
4. **Expected**: Playlist contents replaced with current queue
5. **Verify**: Playlist updated, contains queue tracks

#### Test: `mopidy.delete_playlist`
1. Get playlist URI from source list
2. Call `mopidy.delete_playlist` service:
   - `entity_id`: Your Mopidy entity
   - `uri`: Playlist URI
3. **Expected**: Playlist removed from server
4. **Verify**: Playlist no longer appears in source list

#### Test: `mopidy.refresh_playlists`
1. Create/modify playlist externally (via Mopidy web UI or another client)
2. Call `mopidy.refresh_playlists` service:
   - `entity_id`: Your Mopidy entity
3. **Expected**: Playlist list updates to reflect external changes
4. **Verify**: Source list updated

### 4. Track Metadata Services

#### Test: `mopidy.lookup_track` (with response)
1. Get a track URI (from queue, history, or search)
2. Call `mopidy.lookup_track` service:
   - `entity_id`: Your Mopidy entity
   - `uri`: Track URI
   - Use `response_variable` to capture result
3. **Expected**: Returns detailed track metadata (URI, name, artists, album, length, etc.)
4. **Verify**: Response contains complete track information

#### Test: `mopidy.lookup_track` (invalid URI)
1. Call `mopidy.lookup_track` with invalid URI:
   - `uri`: "invalid://uri"
2. **Expected**: Error message "Track not found" or "Invalid track URI"
3. **Verify**: Error logged, no crash

#### Test: `mopidy.find_exact` (single field)
1. Call `mopidy.find_exact` service:
   - `entity_id`: Your Mopidy entity
   - `query`: `{artist: "Beatles"}`
   - Use `response_variable` to capture result
2. **Expected**: Returns list of track URIs where artist exactly matches "Beatles" (case-insensitive)
3. **Verify**: URIs returned, case-insensitive matching works

#### Test: `mopidy.find_exact` (multiple fields - AND logic)
1. Call `mopidy.find_exact` service:
   - `entity_id`: Your Mopidy entity
   - `query`: `{artist: "Beatles", album: "Abbey Road"}`
2. **Expected**: Returns tracks matching BOTH artist AND album
3. **Verify**: Only exact matches returned (case-insensitive)

#### Test: `mopidy.find_exact` (case-insensitive matching)
1. Call `mopidy.find_exact` with:
   - `query`: `{artist: "beatles"}` (lowercase)
2. **Expected**: Matches "Beatles", "BEATLES", "beatles" but not "Beatles White Album"
3. **Verify**: Full string match (not substring), case-insensitive

### 5. Error Handling Validation

#### Test: Server unavailable
1. Stop Mopidy server
2. Call any new service
3. **Expected**: Error message with context (hostname, port, operation)
4. **Verify**: Error logged, no unhandled exceptions

#### Test: Invalid input validation
1. Call `mopidy.move_track` with negative position
2. **Expected**: Error message indicating valid range
3. **Verify**: Clear error message, no crash

### 6. Entity State Updates

#### Test: Queue modification updates state
1. Modify queue (move, remove, or filter tracks)
2. Check entity state attributes (`queue_size`, `queue_position`)
3. **Expected**: Attributes update to reflect new queue state
4. **Verify**: State refreshed automatically

## Success Criteria Validation

- **SC-001**: Queue operations complete in under 2 seconds for 20 tracks ✅
- **SC-002**: Multiple track removal works in single operation ✅
- **SC-003**: History retrieval completes in under 1 second for 100 tracks ✅
- **SC-004**: Playlist creation completes in under 3 seconds for 50 tracks ✅
- **SC-005**: Track lookup completes in under 500ms ✅
- **SC-006**: All services respond within 1 second ✅
- **SC-007**: 95% success rate when server available ✅
- **SC-008**: Clear error messages for all failures ✅
- **SC-009**: Entity attributes update correctly ✅
- **SC-010**: Python 3.13.9+ compatibility verified ✅

## Troubleshooting

### Issue: Services not appearing in Developer Tools
- **Check**: Verify `services.yaml` updated with new service definitions
- **Check**: Restart Home Assistant after code changes
- **Check**: Verify service registration in `media_player.py`

### Issue: Response services not returning data
- **Check**: Verify `SupportsResponse.ONLY` used for query services
- **Check**: Verify response format matches `{entity_id: {'result': data}}`
- **Check**: Verify `response_variable` used in service call

### Issue: Position conversion errors
- **Check**: Verify 1-based to 0-based conversion implemented correctly
- **Check**: Verify validation checks 1-based range (1 to queue_length)
- **Check**: Verify error messages show 1-based positions to users

### Issue: History not updating
- **Check**: Verify Mopidy server maintains history (backend-dependent)
- **Check**: Verify `media_history` attribute refreshed on entity update
- **Check**: Verify history entries formatted correctly

### Issue: Playlist operations fail
- **Check**: Verify backend supports playlist modification (not all backends do)
- **Check**: Verify error handling for unsupported features
- **Check**: Verify playlist URI format correct

## Rollback Plan

If issues occur:
1. Revert to previous version from git history
2. Restart Home Assistant
3. Verify integration functions normally
4. Report issues for investigation

