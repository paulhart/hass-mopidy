# Contracts: Custom Queue Management Card

**Feature**: Custom Queue Management Card  
**Date**: 2025-12-11

## Overview

This feature introduces one new Home Assistant service and one new entity attribute to support the custom queue management card. The card uses these contracts to display the queue and enable drag-and-drop reordering and tap-to-play functionality.

## New Service Contract

### `mopidy.play_track_at_position`

**Type**: Action service (no response data)  
**Purpose**: Start playing a track at a specific position in the queue without modifying the queue order.

**Service Definition** (for `services.yaml`):
```yaml
play_track_at_position:
  name: Play Track at Position
  description: Start playing a track at the specified position in the queue without reordering tracks.
  target:
    entity:
      integration: mopidy
      domain: media_player
  fields:
    position:
      name: Position
      description: Track position to play (1-based, first track = 1)
      required: true
      selector:
        number:
          min: 1
          max: 100
          step: 1
          unit_of_measurement: "position"
```

**Service Call Pattern** (from custom card):
```typescript
await hass.callService(
  'mopidy',
  'play_track_at_position',
  {
    position: trackPosition  // 1-based position
  },
  {
    entity_id: entityId
  }
);
```

**Parameters**:
- `position: int` (required) - Track position to play (1-based, first track = 1)

**Behavior**:
- Converts 1-based user position to 0-based API position internally
- Validates position is in valid range (1 to queue_length)
- Sets tracklist index to the specified position using Mopidy API
- Starts playback of the track at that position
- Does not modify queue order (tracks remain at their original positions)
- Updates `queue_position` entity attribute to reflect the new playing position
- If track is already playing at that position, restarts it from the beginning (playback position resets to 0:00)

**Response**: None (action service, success/failure indicated by promise resolution/rejection)

**Errors**:
- Invalid position: `ValueError` with message showing valid range (e.g., "Position must be between 1 and 10")
- Empty queue: `ValueError` with "Queue is empty" message
- Server unavailable: `reConnectionError` with context (hostname, port, operation)
- Position out of range: `ValueError` with "Position {position} is out of range (1 to {queue_size})" message

**Backend Implementation** (Python):
```python
async def service_play_track_at_position(
    self,
    position: int
) -> None:
    """Play track at specific position without reordering queue."""
    # Convert 1-based to 0-based
    api_position = position - 1
    # Validate position
    if self.speaker.queue.size is None or position < 1 or position > self.speaker.queue.size:
        raise ValueError(f"Position {position} is out of range (1 to {self.speaker.queue.size})")
    # Set tracklist index and play
    self.speaker.api.tracklist.index = api_position
    self.speaker.api.playback.play()
```

---

## New Entity Attribute Contract

### `queue_tracks`

**Type**: Entity state attribute (`extra_state_attributes`)  
**Purpose**: Expose the full track list with metadata for the custom card to display and interact with.

**Attribute Definition** (in `media_player.py`):
```python
@property
def extra_state_attributes(self) -> dict[str, Any]:
    """Return entity specific state attributes"""
    attributes: dict[str, Any] = {}
    # ... existing attributes ...
    
    # New attribute: queue_tracks
    if self.speaker.queue.tracks is not None:
        attributes["queue_tracks"] = [
            {
                "position": idx + 1,  # 1-based position
                "uri": track.get("uri", ""),
                "title": track.get("title"),
                "artist": track.get("artist"),
                "album": track.get("album"),
                "duration": track.get("duration")
            }
            for idx, track in enumerate(self.speaker.queue.tracks)
        ]
    
    return attributes
```

**Structure**:
```python
[
    {
        'position': int,        # Track position in queue (1-based)
        'uri': str,             # Track URI
        'title': str | None,    # Track title or None
        'artist': str | None,   # Artist name or None
        'album': str | None,    # Album name or None
        'duration': int | None  # Duration in seconds or None
    },
    # ... more tracks ordered by position
]
```

**Access Pattern** (from custom card):
```typescript
const entityState = hass.states[entityId];
const queueTracks = entityState.attributes.queue_tracks || [];
const queuePosition = entityState.attributes.queue_position;
const queueSize = entityState.attributes.queue_size;
```

**Update Frequency**:
- Refreshed on entity update cycle (typically every 30 seconds)
- Updated immediately after queue-modifying operations (`move_track`, `remove_track`, `filter_tracks`)
- Updated when tracklist changes on Mopidy server

**Constraints**:
- Array length must match `queue_size` attribute when queue is not empty
- When `queue_size == 0`, array is empty `[]`
- Tracks ordered by position (index 0 = position 1, index 1 = position 2, etc.)
- Missing metadata fields may be `None`

---

## Service Call Patterns (Custom Card)

### Drag-and-Drop Reordering

**Service**: `mopidy.move_track` (existing service from feature 002)

**Call Pattern**:
```typescript
// User drags track from position 3 to position 1
await hass.callService(
  'mopidy',
  'move_track',
  {
    from_position: 3,  // 1-based
    to_position: 1     // 1-based
  },
  {
    entity_id: entityId
  }
);
```

**Error Handling**:
```typescript
try {
  await hass.callService(...);
  // Success: Entity state will update via subscription
} catch (error) {
  // Show error message to user
  this.error = `Failed to move track: ${error.message}`;
}
```

---

### Tap-to-Play

**Service**: `mopidy.play_track_at_position` (new service)

**Call Pattern**:
```typescript
// User taps track at position 5
await hass.callService(
  'mopidy',
  'play_track_at_position',
  {
    position: 5  // 1-based
  },
  {
    entity_id: entityId
  }
);
```

**Error Handling**:
```typescript
try {
  await hass.callService(...);
  // Success: Entity state will update via subscription
} catch (error) {
  // Show error message to user
  this.error = `Failed to play track: ${error.message}`;
}
```

---

## Entity State Subscription Pattern

**Subscription Setup** (in custom card):
```typescript
connectedCallback() {
  super.connectedCallback();
  // Subscribe to entity state changes
  this._unsubEntities = this.hass.connection.subscribeEntities(
    (entities) => {
      const entity = entities[this.config.entity];
      if (entity) {
        this._updateEntityState(entity);
      }
    }
  );
}

disconnectedCallback() {
  super.disconnectedCallback();
  // Unsubscribe when card is removed
  if (this._unsubEntities) {
    this._unsubEntities();
  }
}

private _updateEntityState(entity: HassEntity) {
  this.queueTracks = entity.attributes.queue_tracks || [];
  this.queuePosition = entity.attributes.queue_position;
  this.queueSize = entity.attributes.queue_size || 0;
  this.error = entity.state === 'unavailable' ? 'Entity unavailable' : null;
  this.requestUpdate();
}
```

---

## Error Handling Contract

All service calls follow this error handling pattern:

1. **Service Call**: Use `hass.callService()` which returns a promise
2. **Success**: Promise resolves, entity state updates via subscription
3. **Failure**: Promise rejects with error, card displays error message
4. **Recovery**: User can retry operation or refresh entity state

**Error Display**:
- Inline error message above/below queue list
- Retry button to re-fetch entity state
- Error message includes specific error details when available

---

## Backward Compatibility

- New service `play_track_at_position` is additive (no changes to existing services)
- New attribute `queue_tracks` is additive (no changes to existing attributes)
- Existing services (`move_track`) unchanged
- No breaking changes to public APIs
- Custom card is optional - existing template-based UI continues to work

---

## External Contracts (Unchanged)

- **Mopidy HTTP API**: Uses standard API methods (`tracklist.index`, `playback.play`)
- **Home Assistant Service API**: Follows existing service registration patterns
- **Entity Platform**: No changes to entity platform structure
- **Custom Card Framework**: Uses standard Lit and Home Assistant custom card patterns

