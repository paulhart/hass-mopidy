# Research: Mopidy Enhanced Services

**Feature**: Mopidy Enhanced Services  
**Date**: 2025-12-11  
**Status**: Complete

## Research Objectives

Determine technical approach for implementing four high-priority Mopidy capabilities (queue management, playback history, playlist lifecycle, track lookup) while ensuring Python 3.13.9+ compatibility and maintaining Home Assistant integration patterns.

## Decisions Made

### Decision 1: Python 3.13.9+ Compatibility
**Decision**: Use Python 3.13.9+ language features and standard library APIs only  
**Rationale**: Explicit requirement from spec (FR-015). Python 3.13.9 is a recent release; need to ensure no deprecated features or breaking changes are used.  
**Key considerations**:
- Python 3.13 introduced improvements to type hints (`X | Y` syntax already used in codebase)
- No breaking changes that would affect this integration
- Standard library modules (`collections`, `asyncio`, `typing`) are stable
- `mopidyapi` library compatibility with Python 3.13.9+ assumed (standard HTTP client library)

**Alternatives considered**: 
- Target Python 3.9+ (HA minimum): Rejected - spec explicitly requires 3.13.9+
- Use 3.13-specific features: Accepted - if beneficial, but not required

### Decision 2: Mopidy API Method Signatures
**Decision**: Use standard Mopidy HTTP API methods with expected signatures:
- `tracklist.move(start, end, to_position)` - Move tracks from start:end to to_position
- `tracklist.remove(criteria)` - Remove tracks matching criteria (tlid list or filter dict)
- `tracklist.filter(criteria)` - Filter tracks by criteria dict
- `history.get_history(limit)` - Get history entries (returns list of track objects with timestamp)
- `history.get_length()` - Get history length
- `playlists.create(name, tracks)` - Create playlist with name and track URIs
- `playlists.delete(uri)` - Delete playlist by URI
- `playlists.save(playlist)` - Save playlist object
- `playlists.refresh(uri_scheme)` - Refresh playlists from backend
- `library.lookup(uri)` - Lookup track by URI (returns track object)
- `library.find_exact(query)` - Find exact matches (returns list of track objects)

**Rationale**: These are standard Mopidy HTTP API methods documented in Mopidy API reference. Implementation will use `mopidyapi` library which wraps these calls.  
**Alternatives considered**: 
- Custom API calls: Rejected - `mopidyapi` library already provides these methods
- Direct HTTP calls: Rejected - violates existing code patterns

### Decision 3: Position Index Conversion (1-based UI, 0-based API)
**Decision**: Convert user-provided 1-based positions to 0-based for Mopidy API calls  
**Rationale**: Users expect 1-based indexing (first track = position 1), but Mopidy API uses 0-based indexing. Conversion function will handle this transparently.  
**Implementation**: 
- Service parameters accept 1-based positions
- Convert to 0-based before calling Mopidy API: `api_position = user_position - 1`
- Validate range: `1 <= user_position <= queue_length`
- Error messages show 1-based positions to users

**Alternatives considered**: 
- Use 0-based in UI: Rejected - violates user expectations (spec clarification)
- Use 1-based in API: Rejected - Mopidy API requires 0-based

### Decision 4: Filter Criteria Implementation
**Decision**: Use dict-based criteria matching track metadata fields (artist, album, genre, track_name)  
**Rationale**: Matches existing search service pattern. Filter logic iterates queue tracks, checks metadata against criteria dict, removes matches. AND logic when multiple criteria provided.  
**Implementation**:
- Criteria dict: `{artist: "Name", album: "Title", genre: "Rock", track_name: "Song"}`
- For each track in queue, check if all provided criteria match (case-insensitive string comparison)
- Remove matching tracks using `tracklist.remove()` with tlid list

**Alternatives considered**: 
- Use Mopidy's `tracklist.filter()` API: Preferred if available - more efficient
- Manual iteration: Fallback if filter API doesn't support criteria dict format

### Decision 5: History Data Structure
**Decision**: History entries include: URI, artist, album, track_name, timestamp  
**Rationale**: Spec clarification (Q2) specifies these fields. Timestamp enables sorting and "recently played" features.  
**Implementation**:
- `history.get_history()` returns list of history entry objects from Mopidy
- Extract required fields from each entry
- Format as list of dicts: `[{"uri": "...", "artist": "...", "album": "...", "track_name": "...", "timestamp": "..."}]`
- Cache in entity attribute `media_history` (last 20 entries)

**Alternatives considered**: 
- Full metadata: Rejected - too verbose, not needed for history display
- URI only: Rejected - insufficient for user display

### Decision 6: Service Response Patterns
**Decision**: Query services (`get_history`, `lookup_track`, `find_exact`) use `SupportsResponse.ONLY` and return data; action services return success/failure only  
**Rationale**: Spec clarification (Q1) and existing pattern (`get_search_result` uses `SupportsResponse.ONLY`).  
**Implementation**:
- Query services: Register with `supports_response=SupportsResponse.ONLY`, return `{entity_id: {'result': data}}`
- Action services: Register without `supports_response`, return None (success) or raise exception (failure)

**Alternatives considered**: 
- All services return data: Rejected - violates spec clarification
- No services return data: Rejected - breaks automation workflows

### Decision 7: Playlist Name Conflict Resolution
**Decision**: Overwrite existing playlist when name conflict occurs  
**Rationale**: Spec clarification (Q4) - overwrite behavior.  
**Implementation**:
- Check if playlist with name exists (search `playlists.as_list()`)
- If exists, get URI and use `playlists.save()` to overwrite
- If not exists, use `playlists.create()` to create new

**Alternatives considered**: 
- Append number: Rejected - violates spec clarification
- Return error: Rejected - violates spec clarification

### Decision 8: Empty Queue Error Handling
**Decision**: Return error when `create_playlist` or `save_playlist` called with empty queue  
**Rationale**: Spec clarification (Q5) - error behavior.  
**Implementation**:
- Check queue size before operation: `if queue_size == 0: raise ValueError("Queue is empty")`
- Provide clear error message

**Alternatives considered**: 
- Create empty playlist: Rejected - violates spec clarification
- Silent success: Rejected - violates spec clarification

### Decision 9: Exact Match Implementation
**Decision**: Case-insensitive full string match for `find_exact`  
**Rationale**: Spec clarification (Q4) - case-insensitive full string match.  
**Implementation**:
- Convert query values to lowercase for comparison
- Use exact string equality (not substring matching)
- Example: "Beatles" matches "beatles" and "BEATLES" but not "Beatles White Album"

**Alternatives considered**: 
- Case-sensitive: Rejected - violates spec clarification
- Partial match: Rejected - violates spec clarification

### Decision 10: History Index Direction
**Decision**: Index 0 = most recently played track (newest first)  
**Rationale**: Standard convention for "recently played" lists. Mopidy `history.get_history()` returns newest first.  
**Implementation**:
- `get_history()` returns list with index 0 = most recent
- `play_from_history(index=0)` plays most recent track
- Entity attribute `media_history` follows same ordering

**Alternatives considered**: 
- Oldest first: Rejected - violates user expectations for "recently played"

### Decision 11: Error Handling for Unsupported Features
**Decision**: Catch `NotImplementedError` or similar exceptions from Mopidy API, return user-friendly error  
**Rationale**: Some backends don't support all features (e.g., playlist modification). Must handle gracefully per spec FR-018.  
**Implementation**:
- Wrap API calls in try/except
- Catch backend-specific exceptions (may vary by backend)
- Return error message: "Operation not supported by backend"
- Log at debug level with backend details

**Alternatives considered**: 
- Fail silently: Rejected - violates error handling discipline
- Check feature support first: Considered - but Mopidy doesn't provide feature detection API

### Decision 12: Entity State Updates After Queue Operations
**Decision**: Trigger entity state update after queue modification operations  
**Rationale**: Spec FR-017 requires entity state updates. Queue operations change queue state, so entity should reflect changes.  
**Implementation**:
- After `move_track`, `remove_track`, `filter_tracks`: Call `self.entity.force_update_ha_state()` or schedule update
- Queue position/size attributes will refresh on next update cycle

**Alternatives considered**: 
- Manual attribute updates: Considered - but update() method already handles this
- No explicit update: Rejected - violates spec FR-017

## Open Questions Resolved

1. **Q**: Does Mopidy API `tracklist.filter()` support criteria dict or only tlid list?  
   **A**: Need to verify - if not, implement manual filtering by iterating queue and checking metadata.

2. **Q**: What format does `history.get_history()` return?  
   **A**: Returns list of history entry objects with track info and timestamp. Extract required fields (URI, artist, album, track_name, timestamp).

3. **Q**: How to handle playlist name conflicts when creating?  
   **A**: Overwrite existing playlist (per spec clarification Q4).

## Technical Standards (from Existing Code)

- **Service Registration**: Use `platform.async_register_entity_service()` with `voluptuous` schema
- **Response Services**: Use `supports_response=SupportsResponse.ONLY` for query services
- **Error Handling**: Use `reConnectionError` for network failures, specific exceptions for validation
- **Logging**: Include context (hostname, port, operation) in error logs
- **Async Patterns**: Use `async_add_executor_job()` for Mopidy API calls
- **Type Hints**: Use `typing` module with Python 3.13.9+ syntax (`X | Y` union types)
- **Constants**: Define in `const.py` if needed (none required for this feature)

## Python 3.13.9+ Compatibility Notes

- Type hints: Use `X | Y` syntax (already in use) - compatible
- Standard library: All used modules (`collections`, `asyncio`, `typing`, `datetime`) are stable
- No deprecated features will be used
- No 3.13-specific features required (but compatible if beneficial)

## Next Steps

1. ✅ Resolved: All technical decisions documented
2. Create data model for new entities (history entries, filter criteria)
3. Define service contracts (parameters, return values, error cases)
4. Implement following existing code patterns

