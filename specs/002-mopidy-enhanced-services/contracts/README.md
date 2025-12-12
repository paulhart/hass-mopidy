# Contracts: Mopidy Enhanced Services

**Feature**: Mopidy Enhanced Services  
**Date**: 2025-12-11

## Overview

This feature introduces 12 new Home Assistant services (3 query services with response data, 9 action services) and one new entity attribute. All services follow existing Home Assistant service patterns and integrate with Mopidy HTTP API.

## New Service Contracts

### Queue Management Services (Action Services)

#### `mopidy.move_track`
**Type**: Action service (no response data)  
**Purpose**: Reorder tracks in queue by moving from one position to another

**Parameters**:
- `from_position: int` (required) - Source position (1-based, first track = 1)
- `to_position: int` (required) - Destination position (1-based)

**Behavior**:
- Converts 1-based positions to 0-based for Mopidy API
- Validates positions are in valid range (1 to queue_length)
- Moves track(s) from `from_position` to `to_position`
- Updates entity state after operation

**Errors**:
- Invalid position: `ValueError` with message showing valid range
- Empty queue: `ValueError` with "Queue is empty" message
- Server unavailable: `reConnectionError` with context

#### `mopidy.remove_track`
**Type**: Action service (no response data)  
**Purpose**: Remove one or more tracks from queue by position(s)

**Parameters**:
- `position: int | None` (optional) - Single position to remove (1-based)
- `positions: list[int] | None` (optional) - Multiple positions to remove (1-based)

**Behavior**:
- At least one of `position` or `positions` must be provided
- Converts 1-based positions to 0-based for Mopidy API
- Validates all positions are in valid range
- Removes tracks in single operation (removes from highest to lowest to maintain indices)
- Updates entity state after operation

**Errors**:
- Invalid position: `ValueError` with message showing valid range
- Empty queue: `ValueError` with "Queue is empty" message
- Neither parameter provided: `ValueError` with "position or positions required" message

#### `mopidy.filter_tracks`
**Type**: Action service (no response data)  
**Purpose**: Remove tracks from queue matching specified criteria

**Parameters**:
- `criteria: dict[str, str]` (required) - Filter criteria dict with fields:
  - `artist: str | None` (optional) - Artist name to match
  - `album: str | None` (optional) - Album name to match
  - `genre: str | None` (optional) - Genre to match
  - `track_name: str | None` (optional) - Track name to match

**Behavior**:
- At least one criteria field must be provided
- Matching is case-insensitive
- Multiple criteria use AND logic (all must match)
- Iterates queue tracks, checks metadata against criteria, removes matches
- Updates entity state after operation

**Errors**:
- Empty criteria: `ValueError` with "At least one criteria field required" message
- Empty queue: `ValueError` with "Queue is empty" message

### Playback History Services

#### `mopidy.get_history`
**Type**: Query service (`SupportsResponse.ONLY`)  
**Purpose**: Retrieve recently played tracks with metadata

**Parameters**:
- `limit: int | None` (optional, default: 20) - Maximum number of tracks to return

**Response Format**:
```python
{
    entity_id: {
        'result': [
            {
                'uri': str,
                'artist': str | None,
                'album': str | None,
                'track_name': str | None,
                'timestamp': str  # ISO format datetime
            },
            ...
        ]
    }
}
```

**Behavior**:
- Returns most recently played tracks first (index 0 = most recent)
- If fewer tracks played than limit, returns all available
- Empty history returns empty list (not error)

**Errors**:
- Server unavailable: `reConnectionError` with context

#### `mopidy.play_from_history`
**Type**: Action service (no response data)  
**Purpose**: Play a track from playback history by index

**Parameters**:
- `index: int` (required) - History index (0 = most recent)

**Behavior**:
- Retrieves history entry at specified index
- Extracts track URI from history entry
- Plays track via `play_media` service

**Errors**:
- Invalid index: `ValueError` with "Index out of range" message
- Empty history: `ValueError` with "No playback history available" message
- Server unavailable: `reConnectionError` with context

### Playlist Management Services (Action Services)

#### `mopidy.create_playlist`
**Type**: Action service (no response data)  
**Purpose**: Create new playlist from current queue

**Parameters**:
- `name: str` (required) - Playlist name

**Behavior**:
- Checks if playlist with name already exists
- If exists: overwrites existing playlist with queue contents
- If not exists: creates new playlist with queue contents
- Validates queue is not empty before operation
- Refreshes playlist list after creation

**Errors**:
- Empty queue: `ValueError` with "Queue is empty" message
- Invalid name: `ValueError` with "Playlist name required" message
- Backend not supported: `NotImplementedError` with "Playlist creation not supported by backend" message

#### `mopidy.delete_playlist`
**Type**: Action service (no response data)  
**Purpose**: Delete a playlist from Mopidy server

**Parameters**:
- `uri: str` (required) - Playlist URI

**Behavior**:
- Deletes playlist by URI
- Refreshes playlist list after deletion

**Errors**:
- Playlist not found: `ValueError` with "Playlist not found" message
- Invalid URI: `ValueError` with "Invalid playlist URI" message
- Backend not supported: `NotImplementedError` with "Playlist deletion not supported by backend" message

#### `mopidy.save_playlist`
**Type**: Action service (no response data)  
**Purpose**: Save current queue to existing playlist

**Parameters**:
- `uri: str` (required) - Playlist URI

**Behavior**:
- Validates queue is not empty before operation
- Saves current queue tracks to existing playlist (overwrites contents)
- Refreshes playlist list after save

**Errors**:
- Empty queue: `ValueError` with "Queue is empty" message
- Playlist not found: `ValueError` with "Playlist not found" message
- Invalid URI: `ValueError` with "Invalid playlist URI" message
- Backend not supported: `NotImplementedError` with "Playlist save not supported by backend" message

#### `mopidy.refresh_playlists`
**Type**: Action service (no response data)  
**Purpose**: Refresh playlist list from backend

**Parameters**: None

**Behavior**:
- Refreshes playlist list from Mopidy server
- Updates entity `source_list` attribute

**Errors**:
- Server unavailable: `reConnectionError` with context

### Track Metadata Services (Query Services)

#### `mopidy.lookup_track`
**Type**: Query service (`SupportsResponse.ONLY`)  
**Purpose**: Get detailed track metadata for a track URI

**Parameters**:
- `uri: str` (required) - Track URI

**Response Format**:
```python
{
    entity_id: {
        'result': {
            'uri': str,
            'name': str,
            'artists': list[dict],
            'album': dict | None,
            'length': int,  # milliseconds
            'track_no': int | None,
            'date': str | None,
            'genre': str | None,
            # Additional fields as available
        }
    }
}
```

**Behavior**:
- Looks up track by URI from Mopidy library
- Returns full track metadata object
- Metadata availability varies by backend

**Errors**:
- Track not found: `ValueError` with "Track not found" message
- Invalid URI: `ValueError` with "Invalid track URI" message
- Server unavailable: `reConnectionError` with context

#### `mopidy.find_exact`
**Type**: Query service (`SupportsResponse.ONLY`)  
**Purpose**: Find tracks matching exact criteria (case-insensitive full string match)

**Parameters**:
- `query: dict[str, str]` (required) - Query criteria with fields:
  - `artist: str | None` (optional) - Artist name (exact match)
  - `album: str | None` (optional) - Album name (exact match)
  - `track_name: str | None` (optional) - Track name (exact match)

**Response Format**:
```python
{
    entity_id: {
        'result': [str, ...]  # List of track URIs
    }
}
```

**Behavior**:
- At least one query field must be provided
- Matching is case-insensitive full string match
- Multiple fields use AND logic (all must match)
- Returns list of matching track URIs

**Errors**:
- Empty query: `ValueError` with "At least one query field required" message
- No matches: Returns empty list (not error)
- Server unavailable: `reConnectionError` with context

## New Entity Attribute

### `media_history`
**Type**: Entity state attribute  
**Purpose**: Expose recently played tracks for automations and display

**Format**:
```python
[
    {
        'uri': str,
        'artist': str | None,
        'album': str | None,
        'track_name': str | None,
        'timestamp': str  # ISO format datetime
    },
    ...  # Up to 20 entries (most recent first)
]
```

**Behavior**:
- Cached in entity state (last 20 tracks)
- Refreshed on entity update cycle
- Index 0 = most recently played track
- Empty if no playback history

## External Contracts (Unchanged)

- **Mopidy HTTP API**: Uses standard API methods (`tracklist.move`, `tracklist.remove`, `history.get_history`, etc.)
- **Home Assistant Service API**: Follows existing service registration patterns
- **Entity Platform**: No changes to entity platform structure

## Backward Compatibility

- All new services are additive (no changes to existing services)
- Existing entity attributes unchanged
- No breaking changes to public APIs
- Services gracefully handle backend feature availability

## Error Handling Contract

All services follow existing error handling patterns:
- Connection errors: `reConnectionError` with context (hostname, port, operation)
- Validation errors: `ValueError` with descriptive messages
- Backend unsupported: `NotImplementedError` with clear message
- All errors logged with appropriate context

