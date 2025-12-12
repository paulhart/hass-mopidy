# Data Model: Mopidy UI Enhancements

**Date**: 2025-12-11  
**Feature**: 003-ui-enhancement

## Overview

This feature does not introduce new data structures or storage. It consumes existing entity attributes and service interfaces from the Mopidy integration (002-mopidy-enhanced-services). The data model describes the data structures that UI templates will display and interact with.

## Entity Attributes (Read-Only)

### Queue State Attributes

**Source**: `media_player.mopidy_*` entity attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `queue_position` | `int` | Current playing track position (1-based) | `3` |
| `queue_size` | `int` | Total number of tracks in queue | `15` |

**Usage in UI**:
- Display current queue state (position X of Y)
- Validate position inputs (must be 1 to queue_size)
- Show empty queue state (queue_size == 0)

**Validation Rules**:
- `queue_position` must be >= 1 and <= `queue_size` (when queue_size > 0)
- `queue_size` must be >= 0
- When `queue_size == 0`, queue is empty

---

### Playback History Attribute

**Source**: `media_player.mopidy_*` entity `media_history` attribute

**Type**: `list[dict[str, Any]]`

**Structure**:
```python
[
    {
        'uri': str,           # Track URI (e.g., "spotify:track:abc123")
        'artist': str | None, # Artist name or None
        'album': str | None,  # Album name or None
        'track_name': str | None, # Track name or None
        'timestamp': str      # ISO 8601 timestamp (e.g., "2025-12-11T10:30:00Z")
    },
    # ... more entries (most recent first, index 0 = most recent)
]
```

**Constraints**:
- List length: Up to 20 entries (default limit)
- Order: Most recent first (index 0 = most recently played)
- Missing metadata: Fields may be `None` if not available from Mopidy

**Usage in UI**:
- Display history list with metadata
- Format timestamps for human-readable display
- Handle missing metadata gracefully (show "Unknown Artist", etc.)
- Enable track replay via `play_from_history` service

---

### Playlist List Attribute

**Source**: `media_player.mopidy_*` entity `source_list` attribute (existing)

**Type**: `list[str]`

**Structure**:
```python
[
    "m3u:My Playlist",
    "m3u:Another Playlist",
    # ... more playlist URIs
]
```

**Constraints**:
- Format: Playlist URIs (e.g., "m3u:Playlist Name")
- May be empty if no playlists exist
- Requires `refresh_playlists` service call to update

**Usage in UI**:
- Display playlist list
- Extract playlist names from URIs (remove scheme prefix)
- Enable playlist selection for save/delete operations

---

## Service Interfaces (Write Operations)

### Queue Management Services

#### `mopidy.move_track`

**Parameters**:
```yaml
entity_id: str          # Mopidy entity ID
from_position: int     # Source position (1-based)
to_position: int       # Destination position (1-based)
```

**Validation**:
- `from_position` must be >= 1 and <= queue_size
- `to_position` must be >= 1 and <= queue_size
- Both positions must be valid (queue_size > 0)

**Response**: None (void service)

---

#### `mopidy.remove_track`

**Parameters**:
```yaml
entity_id: str
position: int | None        # Single position (1-based), optional
positions: list[int] | None # Multiple positions (1-based), optional
```

**Validation**:
- Either `position` OR `positions` must be provided (not both)
- All positions must be >= 1 and <= queue_size
- Queue must not be empty (queue_size > 0)

**Response**: None (void service)

---

#### `mopidy.filter_tracks`

**Parameters**:
```yaml
entity_id: str
criteria: dict[str, str]  # Filter criteria (AND logic)
  artist: str | None      # Optional artist filter
  album: str | None       # Optional album filter
  genre: str | None       # Optional genre filter
  track_name: str | None  # Optional track name filter
```

**Validation**:
- At least one criteria field must be provided
- Criteria matching is case-insensitive substring match
- All provided criteria must match (AND logic)

**Response**: None (void service)

---

### History Services

#### `mopidy.get_history`

**Parameters**:
```yaml
entity_id: str
limit: int | None  # Optional limit (default: 20)
```

**Response**: `list[dict[str, Any]]` (same structure as `media_history` attribute)

**Note**: This service returns data, but UI should use `media_history` attribute for display (already available, no service call needed).

---

#### `mopidy.play_from_history`

**Parameters**:
```yaml
entity_id: str
index: int  # History index (1-based, 1 = most recent)
```

**Validation**:
- `index` must be >= 1 and <= history length
- History must not be empty

**Response**: None (void service)

---

### Playlist Management Services

#### `mopidy.create_playlist`

**Parameters**:
```yaml
entity_id: str
name: str  # Playlist name
```

**Validation**:
- `name` must be non-empty string
- Queue must not be empty (queue_size > 0)
- If playlist with same name exists, it will be overwritten

**Response**: None (void service)

---

#### `mopidy.save_playlist`

**Parameters**:
```yaml
entity_id: str
uri: str  # Playlist URI (e.g., "m3u:My Playlist")
```

**Validation**:
- `uri` must be valid playlist URI format
- Queue must not be empty (queue_size > 0)
- Playlist must exist (in source_list)

**Response**: None (void service)

---

#### `mopidy.delete_playlist`

**Parameters**:
```yaml
entity_id: str
uri: str  # Playlist URI
```

**Validation**:
- `uri` must be valid playlist URI format
- Playlist must exist (in source_list)

**Response**: None (void service)

---

#### `mopidy.refresh_playlists`

**Parameters**:
```yaml
entity_id: str
```

**Response**: None (void service)

**Note**: After calling this service, `source_list` attribute will be updated with latest playlists.

---

## Helper Entities (User Input)

### Input Number Helpers

**Type**: `input_number` helper entities

**Purpose**: Capture numeric user input (queue positions, history indices)

**Structure**:
```yaml
input_number:
  mopidy_queue_from_position:
    name: "Queue Source Position"
    min: 1
    max: 100  # Dynamic based on queue_size
    step: 1
    mode: box
```

**Usage**:
- Queue move operations (from_position, to_position)
- Queue remove operations (position)
- History play operations (index)

**Validation**:
- Min/max values should be updated based on current queue_size or history length
- Values are validated by Home Assistant (enforced by input_number)

---

### Input Text Helpers

**Type**: `input_text` helper entities

**Purpose**: Capture text user input (filter criteria, playlist names)

**Structure**:
```yaml
input_text:
  mopidy_filter_artist:
    name: "Filter by Artist"
    max: 100
  mopidy_playlist_name:
    name: "Playlist Name"
    max: 200
```

**Usage**:
- Filter criteria (artist, album, genre, track_name)
- Playlist name input

**Validation**:
- Max length enforced by input_text helper
- Empty strings should be handled (treated as no filter)

---

## UI State (Template Variables)

**Type**: Template variables (Jinja2)

**Purpose**: Track UI state (confirmation dialogs, active sections, etc.)

**Structure**:
```jinja2
{% set show_confirmation = false %}
{% set active_section = 'queue' %}
```

**Usage**:
- Show/hide confirmation dialogs
- Track which section is active
- Store temporary UI state

**Constraints**:
- Template variables are session-scoped (reset on page refresh)
- Not persistent across page reloads

---

## Data Flow

### Read Operations

1. **Entity State**: UI templates read entity attributes (`queue_position`, `queue_size`, `media_history`, `source_list`)
2. **Template Rendering**: Jinja2 templates format data for display
3. **User View**: Formatted data displayed in Lovelace cards

### Write Operations

1. **User Input**: User enters values in helper entities (`input_number`, `input_text`)
2. **Service Call**: Button card triggers service call with parameters from helpers
3. **State Update**: Entity state updates (automatic polling or manual `update_entity` call)
4. **UI Refresh**: Template re-renders with updated entity state

### Error Handling

1. **Entity Unavailable**: Entity state shows `unavailable` → UI displays error message
2. **Service Call Failure**: Service call returns error → UI displays error message (if supported)
3. **Invalid Input**: Helper validation prevents invalid values → UI shows validation error

---

## Validation Rules Summary

| Data Type | Validation Rule | Error Handling |
|-----------|----------------|----------------|
| Queue Position | 1 <= position <= queue_size | Display error if invalid |
| Queue Size | >= 0 | Show empty state if 0 |
| History Index | 1 <= index <= history_length | Display error if invalid |
| Playlist URI | Must exist in source_list | Display error if not found |
| Filter Criteria | At least one field required | Display error if all empty |
| Playlist Name | Non-empty string | Display error if empty |
| Empty Queue Operations | queue_size > 0 required | Display error if queue empty |

---

## Data Relationships

```
Entity (media_player.mopidy_*)
├── Attributes (read-only)
│   ├── queue_position (int)
│   ├── queue_size (int)
│   ├── media_history (list[dict])
│   └── source_list (list[str])
│
├── Services (write operations)
│   ├── Queue: move_track, remove_track, filter_tracks
│   ├── History: get_history, play_from_history
│   └── Playlist: create_playlist, save_playlist, delete_playlist, refresh_playlists
│
└── Helper Entities (user input)
    ├── input_number (positions, indices)
    └── input_text (filter criteria, playlist names)
```

---

## Notes

- **No Persistence**: This feature does not store data. All data comes from entity attributes or user input.
- **No Database**: No database or file storage is used. UI configuration is stored in Home Assistant's dashboard YAML.
- **Template Variables**: UI state (confirmation dialogs, etc.) is stored in template variables (session-scoped, not persistent).
- **Entity Polling**: Entity state updates automatically via Home Assistant's polling mechanism. Manual refresh via `update_entity` service is also available.

