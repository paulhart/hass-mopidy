# Data Model: Custom Queue Management Card

**Date**: 2025-12-11  
**Feature**: 004-custom-queue-card

## Overview

This feature introduces a new entity attribute (`queue_tracks`) and a new service (`mopidy.play_track_at_position`) to support the custom queue management card. The card consumes this data to display the queue and enable drag-and-drop reordering and tap-to-play functionality.

## New Entity Attribute

### `queue_tracks`

**Type**: `list[dict[str, Any]]`  
**Purpose**: Exposes the full track list with metadata for the custom card to display and interact with.

**Structure**:
```python
[
    {
        'position': int,        # Track position in queue (1-based, first track = 1)
        'uri': str,             # Track URI (e.g., "spotify:track:abc123")
        'title': str | None,    # Track title or None if unavailable
        'artist': str | None,   # Artist name or None if unavailable
        'album': str | None,    # Album name or None if unavailable
        'duration': int | None  # Duration in seconds or None if unavailable
    },
    # ... more tracks ordered by position (first track at index 0)
]
```

**Constraints**:
- Array length: Up to queue_size tracks (typically 1-100, but can be larger)
- Order: Tracks ordered by position (index 0 = position 1, index 1 = position 2, etc.)
- Position values: 1-based (first track = 1, not 0)
- Missing metadata: Fields may be `None` if not available from Mopidy backend
- Update frequency: Refreshed on entity update cycle (typically every 30 seconds or on state change)

**Validation Rules**:
- `position` must be >= 1 and <= queue_size
- `uri` must be a valid Mopidy URI format
- Array length must match `queue_size` attribute when queue is not empty
- When `queue_size == 0`, array is empty `[]`

**Usage in Custom Card**:
- Display track list with metadata (title, artist, album, position)
- Enable drag-and-drop reordering (using position values)
- Enable tap-to-play (using position values for service calls)
- Visual distinction of currently playing track (compare position to `queue_position` attribute)

---

## New Service

### `mopidy.play_track_at_position`

**Type**: Action service (no response data)  
**Purpose**: Start playing a track at a specific position in the queue without modifying the queue order.

**Parameters**:
- `position: int` (required) - Track position to play (1-based, first track = 1)

**Behavior**:
- Sets the tracklist index to the specified position (converts 1-based to 0-based internally)
- Starts playback of the track at that position
- Does not modify queue order (tracks remain at their original positions)
- Updates `queue_position` attribute to reflect the new playing position
- If track is already playing at that position, restarts it from the beginning (per spec clarification)

**Errors**:
- Invalid position: `ValueError` with message showing valid range (1 to queue_size)
- Empty queue: `ValueError` with "Queue is empty" message
- Server unavailable: `reConnectionError` with context

**Service Call Example**:
```yaml
service: mopidy.play_track_at_position
target:
  entity_id: media_player.mopidy_living_room
data:
  position: 5
```

---

## Card Data Model

### Card Configuration

**Type**: Card configuration object (YAML or JSON)

**Structure**:
```typescript
interface MopidyQueueCardConfig {
  type: 'custom:mopidy-queue-card';
  entity: string;              // Entity ID (e.g., "media_player.mopidy_living_room")
  title?: string;              // Optional card title
  show_artwork?: boolean;      // Optional: show track artwork (default: false)
  max_height?: string;         // Optional: max height for scrollable list (default: "400px")
}
```

**Validation**:
- `entity` must be a valid Mopidy media player entity ID
- `entity` must exist and be available

---

### Card Internal State

**Type**: Internal card state (managed by Lit component)

**Structure**:
```typescript
interface CardState {
  entity: string;                          // Entity ID
  queueTracks: QueueTrack[];              // Array of track objects from queue_tracks attribute
  queuePosition: number | null;           // Currently playing position (from queue_position attribute)
  queueSize: number;                       // Total queue size (from queue_size attribute)
  isLoading: boolean;                      // Loading state (initial load or operation in progress)
  error: string | null;                    // Error message if any
  isDragging: boolean;                     // Whether a drag operation is in progress
  dragStartPosition: number | null;       // Starting position of drag operation
}
```

**State Transitions**:
- **Initial Load**: `isLoading: true` → Fetch entity state → `isLoading: false`, `queueTracks` populated
- **Entity Update**: Entity state change event → Update `queueTracks`, `queuePosition`, `queueSize`
- **Drag Start**: User starts dragging → `isDragging: true`, `dragStartPosition` set
- **Drag End**: User drops track → Call `move_track` service → `isDragging: false`, refresh state
- **Tap to Play**: User taps track → Call `play_track_at_position` service → Update `queuePosition`
- **Error**: Service call fails → `error` set, display error message
- **Entity Unavailable**: Entity state unavailable → `error` set, disable interactions

---

## Data Flow

### Queue Display Flow

1. Card loads → Subscribe to entity state changes via `hass.connection.subscribeEntities()`
2. Entity state received → Extract `queue_tracks`, `queue_position`, `queue_size` attributes
3. Card renders → Display track list with metadata, highlight currently playing track
4. Entity updates → Reactive update via subscription, card re-renders with new data

### Drag-and-Drop Flow

1. User starts dragging track → `isDragging: true`, visual feedback shown
2. User drags over drop position → Visual indicator shown (insertion line/highlight)
3. User drops track → Calculate `from_position` and `to_position` (1-based)
4. Call `mopidy.move_track` service → `hass.callService('mopidy', 'move_track', {from_position, to_position}, {entity_id})`
5. Service completes → Entity state updates → Subscription triggers → Card refreshes
6. Error handling → If service fails, show error message, maintain current state

### Tap-to-Play Flow

1. User taps track → Detect tap (touch/mouse click, <10px movement)
2. Get track position from `queueTracks` array
3. Call `mopidy.play_track_at_position` service → `hass.callService('mopidy', 'play_track_at_position', {position}, {entity_id})`
4. Service completes → Entity state updates → Subscription triggers → Card refreshes
5. Error handling → If service fails, show error message, maintain current state

---

## Relationships

- `MopidyMediaPlayerEntity` → `queue_tracks` attribute (exposes track list)
- `MopidyMediaPlayerEntity` → `queue_position` attribute (indicates currently playing track)
- `MopidyMediaPlayerEntity` → `queue_size` attribute (total tracks in queue)
- Custom Card → Reads `queue_tracks`, `queue_position`, `queue_size` attributes
- Custom Card → Calls `mopidy.move_track` service (drag-and-drop)
- Custom Card → Calls `mopidy.play_track_at_position` service (tap-to-play)
- Mopidy Server → Maintains actual queue state (source of truth)

---

## Validation Rules Summary

| Data Type | Validation Rule | Error Handling |
|-----------|----------------|----------------|
| Queue Position | 1 <= position <= queue_size | Display error if invalid, show valid range |
| Queue Size | >= 0 | Show empty state if 0 |
| queue_tracks Array | Length must match queue_size | Handle mismatch gracefully, refresh entity state |
| Entity ID | Must be valid Mopidy media player entity | Show error if invalid or unavailable |
| Track Metadata | Fields may be None | Display "Unknown" for missing metadata |

---

## Notes

- **No Persistence**: Card does not store data. All data comes from entity attributes.
- **Reactive Updates**: Card subscribes to entity state changes for real-time updates.
- **Position Handling**: All positions are 1-based in user-facing interfaces (card, services). Internal Mopidy API uses 0-based positions (conversion handled in backend services).
- **Error Recovery**: Card maintains last known state on errors, provides retry mechanism.
- **Performance**: Card handles up to 100 tracks with responsive scrolling and interactions (per spec SC-007).

