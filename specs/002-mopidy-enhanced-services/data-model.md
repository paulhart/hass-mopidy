# Data Model: Mopidy Enhanced Services

**Feature**: Mopidy Enhanced Services  
**Date**: 2025-12-11

## Overview

This feature introduces new data structures for playback history, filter criteria, and extends existing queue/playlist models with new operations. No persistent storage is required - all data is managed by Mopidy server or cached in entity state.

## New Data Structures

### Playback History Entry

**Purpose**: Represents a previously played track with metadata for display and replay.

**Fields**:
- `uri: str` - Track URI (unique identifier)
- `artist: str | None` - Artist name (may be None for some tracks)
- `album: str | None` - Album name (may be None for some tracks)
- `track_name: str | None` - Track title (may be None for some tracks)
- `timestamp: datetime.datetime` - When the track was played (UTC)

**Storage**:
- Primary: Mopidy server (`history.get_history()`)
- Cache: Entity attribute `media_history` (last 20 entries, refreshed on update)

**Lifecycle**:
- Created: When track finishes playing (managed by Mopidy server)
- Retrieved: Via `history.get_history()` API call
- Cached: In entity `media_history` attribute (bounded to 20 entries)
- Used: For `play_from_history` service and entity attribute display

### Filter Criteria

**Purpose**: Represents search/filter parameters for removing tracks from queue.

**Fields**:
- `artist: str | None` - Artist name to match (optional)
- `album: str | None` - Album name to match (optional)
- `genre: str | None` - Genre to match (optional)
- `track_name: str | None` - Track name to match (optional)

**Validation Rules**:
- At least one field MUST be provided (not all None)
- String values are case-insensitive for matching
- Multiple fields use AND logic (all must match)

**Usage**:
- Input: Service parameter `criteria: dict[str, str]`
- Processing: Iterate queue tracks, check metadata against criteria
- Output: List of matching track tlids for removal

### Track Metadata (Lookup Result)

**Purpose**: Detailed track information returned by `lookup_track` service.

**Fields** (from Mopidy track object):
- `uri: str` - Track URI
- `name: str` - Track title
- `artists: list[dict]` - List of artist objects (name, uri)
- `album: dict | None` - Album object (name, uri, date)
- `length: int` - Duration in milliseconds
- `track_no: int | None` - Track number in album
- `date: str | None` - Release date
- `genre: str | None` - Genre
- Additional fields as available from backend

**Storage**: Returned from Mopidy API, not cached (lookup is fast)

## Modified Data Structures

### Queue Track (Extended Operations)

**Existing Fields**: position, URI, metadata (via `MopidyQueue.queue` dict)

**New Operations**:
- `move(from_position, to_position)` - Reorder tracks
- `remove(positions)` - Remove tracks by position(s)
- `filter(criteria)` - Remove tracks matching criteria

**Position Handling**:
- User-facing: 1-based positions (first track = 1)
- Internal: 0-based positions for Mopidy API
- Conversion: `api_position = user_position - 1`

### Playlist (Extended Operations)

**Existing Fields**: URI, name, track list (via `MopidyLibrary.playlists`)

**New Operations**:
- `create(name, tracks)` - Create new playlist from queue
- `delete(uri)` - Delete playlist
- `save(uri, tracks)` - Save queue to existing playlist
- `refresh()` - Refresh playlist list from backend

**Conflict Resolution**:
- Name conflicts: Overwrite existing playlist (per spec clarification)

## State Transitions

### Queue State
- **Queue Modified** → **State Update**: After `move_track`, `remove_track`, or `filter_tracks`, entity state updates to reflect new queue
- **Queue Empty** → **Error**: When `create_playlist` or `save_playlist` called with empty queue

### History State
- **Track Played** → **History Entry Created**: Mopidy server adds entry to history
- **History Retrieved** → **Entity Cache Updated**: `media_history` attribute refreshed (last 20 entries)

### Playlist State
- **Playlist Created** → **Playlist List Updated**: New playlist appears in `source_list`
- **Playlist Deleted** → **Playlist List Updated**: Playlist removed from `source_list`
- **Playlist Saved** → **Playlist Contents Updated**: Existing playlist overwritten with queue

## Validation Rules

### Position Validation
- Queue positions MUST be in range: `1 <= position <= queue_length`
- Invalid positions MUST return error with valid range message
- Position conversion: `api_position = user_position - 1` (1-based → 0-based)

### Filter Criteria Validation
- At least one criteria field MUST be provided
- String matching is case-insensitive
- Multiple criteria use AND logic (all must match)

### History Validation
- History index MUST be non-negative integer
- History index MUST be less than history length
- Empty history returns empty list (not error)

### Playlist Validation
- Playlist name MUST be non-empty string
- Playlist URI MUST be valid Mopidy URI format
- Queue MUST not be empty for `create_playlist` or `save_playlist`

### Track Lookup Validation
- Track URI MUST be valid Mopidy URI format
- Invalid URI returns error (not empty result)

## Relationships

- `MopidySpeaker` → `MopidyQueue` → Queue tracks (modified via new operations)
- `MopidySpeaker` → `MopidyLibrary` → Playlists (created/deleted/saved)
- `MopidyMediaPlayerEntity` → `media_history` attribute (cached history entries)
- History entries → Mopidy server (persisted by backend)
- Filter criteria → Queue tracks (matching logic)

## Data Flow

### Queue Management Flow
1. User calls service with 1-based positions
2. Service converts to 0-based positions
3. Service calls Mopidy API with 0-based positions
4. Queue state changes on Mopidy server
5. Entity state updates to reflect changes

### History Flow
1. Track finishes playing (Mopidy server adds to history)
2. `get_history()` retrieves entries from Mopidy server
3. History entries formatted with required fields
4. Cached in `media_history` entity attribute (last 20)
5. `play_from_history()` uses cached or fresh history data

### Playlist Flow
1. User calls `create_playlist` with queue tracks
2. Service checks for name conflict
3. If conflict: overwrite existing playlist
4. If no conflict: create new playlist
5. Playlist list refreshes (via `refresh_playlists` or automatic)

### Track Lookup Flow
1. User provides track URI
2. `lookup_track()` calls Mopidy `library.lookup()`
3. Track metadata returned from Mopidy
4. Formatted and returned to user (not cached)

