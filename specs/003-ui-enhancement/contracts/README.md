# Service Contracts: Mopidy UI Enhancements

**Date**: 2025-12-11  
**Feature**: 003-ui-enhancement

## Overview

This document describes the service call patterns used by UI templates to interact with Mopidy services. All services are defined in the Mopidy integration (002-mopidy-enhanced-services) and are called from Lovelace cards via button actions or entity tap actions.

## Service Call Patterns

### Pattern 1: Button Card with Service Action

**Card Type**: `button`  
**Action Type**: `call-service`  
**Service**: `mopidy.{service_name}`

**Template Structure**:
```yaml
type: button
name: "Action Name"
tap_action:
  action: call-service
  service: mopidy.{service_name}
  service_data:
    entity_id: media_player.mopidy_entity
    parameter1: value1
    parameter2: value2
```

**Example**: Move Track
```yaml
type: button
name: "Move Track"
tap_action:
  action: call-service
  service: mopidy.move_track
  service_data:
    entity_id: media_player.mopidy_living_room
    from_position: "{{ states('input_number.mopidy_queue_from_position') | int }}"
    to_position: "{{ states('input_number.mopidy_queue_to_position') | int }}"
```

---

### Pattern 2: Button Card with Template Variables

**Card Type**: `button`  
**Action Type**: `call-service` with template variables

**Template Structure**:
```yaml
type: button
name: "Action Name"
tap_action:
  action: call-service
  service: mopidy.{service_name}
  service_data_template:
    entity_id: media_player.mopidy_entity
    parameter1: "{{ from_position }}"
    parameter2: "{{ to_position }}"
```

**Note**: `service_data_template` is deprecated in newer HA versions. Use `service_data` with Jinja2 templates instead.

---

### Pattern 3: Entity Card with Tap Action

**Card Type**: `entities` or `entity`  
**Action Type**: `call-service` on tap

**Template Structure**:
```yaml
type: entities
entities:
  - entity: media_player.mopidy_entity
    tap_action:
      action: call-service
      service: mopidy.{service_name}
      service_data:
        entity_id: media_player.mopidy_entity
        parameter: value
```

**Example**: Play from History
```yaml
type: entities
entities:
  - entity: media_player.mopidy_entity
    name: "Play Track"
    tap_action:
      action: call-service
      service: mopidy.play_from_history
      service_data:
        entity_id: media_player.mopidy_entity
        index: "{{ item.index }}"
```

---

## Queue Management Services

### `mopidy.move_track`

**Purpose**: Reorder tracks in queue by moving from one position to another.

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `from_position` (required): Source position (1-based integer)
- `to_position` (required): Destination position (1-based integer)

**UI Pattern**:
```yaml
type: button
name: "Move Track"
tap_action:
  action: call-service
  service: mopidy.move_track
  service_data:
    entity_id: media_player.mopidy_entity
    from_position: "{{ states('input_number.mopidy_queue_from_position') | int }}"
    to_position: "{{ states('input_number.mopidy_queue_to_position') | int }}"
```

**Pre-call Validation**:
- Check `queue_size > 0` (queue not empty)
- Validate `from_position` and `to_position` are within range [1, queue_size]
- Display error message if validation fails

**Post-call Action**:
- Call `homeassistant.update_entity` to refresh entity state
- Update UI to reflect new queue state

---

### `mopidy.remove_track`

**Purpose**: Remove one or more tracks from queue by position(s).

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `position` (optional): Single position (1-based integer)
- `positions` (optional): List of positions (1-based integers)

**UI Pattern** (Single Position):
```yaml
type: button
name: "Remove Track"
tap_action:
  action: call-service
  service: mopidy.remove_track
  service_data:
    entity_id: media_player.mopidy_entity
    position: "{{ states('input_number.mopidy_queue_remove_position') | int }}"
```

**UI Pattern** (Multiple Positions):
```yaml
type: button
name: "Remove Selected Tracks"
tap_action:
  action: call-service
  service: mopidy.remove_track
  service_data:
    entity_id: media_player.mopidy_entity
    positions: "{{ selected_positions }}"
```

**Pre-call Validation**:
- Check `queue_size > 0` (queue not empty)
- Validate position(s) are within range [1, queue_size]
- Display error message if validation fails

**Post-call Action**:
- Call `homeassistant.update_entity` to refresh entity state
- Update UI to reflect new queue state

---

### `mopidy.filter_tracks`

**Purpose**: Remove tracks from queue matching specified criteria (AND logic).

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `criteria` (required): Dictionary with filter criteria
  - `artist` (optional): Artist name filter (case-insensitive substring match)
  - `album` (optional): Album name filter (case-insensitive substring match)
  - `genre` (optional): Genre filter (case-insensitive substring match)
  - `track_name` (optional): Track name filter (case-insensitive substring match)

**UI Pattern**:
```yaml
type: button
name: "Remove Matching Tracks"
tap_action:
  action: call-service
  service: mopidy.filter_tracks
  service_data:
    entity_id: media_player.mopidy_entity
    criteria:
      artist: "{{ states('input_text.mopidy_filter_artist') }}"
      album: "{{ states('input_text.mopidy_filter_album') }}"
      track_name: "{{ states('input_text.mopidy_filter_track_name') }}"
```

**Pre-call Validation**:
- Check `queue_size > 0` (queue not empty)
- Validate at least one criteria field is non-empty
- Display error message if validation fails

**Post-call Action**:
- Call `homeassistant.update_entity` to refresh entity state
- Update UI to reflect new queue state

---

## History Services

### `mopidy.get_history`

**Purpose**: Retrieve recently played tracks with metadata.

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `limit` (optional): Maximum number of entries (default: 20)

**UI Pattern**:
```yaml
type: button
name: "Refresh History"
tap_action:
  action: call-service
  service: mopidy.get_history
  service_data:
    entity_id: media_player.mopidy_entity
    limit: 20
```

**Note**: UI should use `media_history` entity attribute for display (already available, no service call needed). This service is primarily for programmatic access.

---

### `mopidy.play_from_history`

**Purpose**: Play a track from playback history by index.

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `index` (required): History index (1-based, 1 = most recent)

**UI Pattern**:
```yaml
type: button
name: "Play Track"
tap_action:
  action: call-service
  service: mopidy.play_from_history
  service_data:
    entity_id: media_player.mopidy_entity
    index: "{{ item.index }}"
```

**Pre-call Validation**:
- Check `media_history` attribute is not empty
- Validate `index` is within range [1, len(media_history)]
- Display error message if validation fails

**Post-call Action**:
- Track should start playing (entity state updates automatically)
- No manual refresh needed (playback state updates automatically)

---

## Playlist Management Services

### `mopidy.create_playlist`

**Purpose**: Create a new playlist from the current queue.

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `name` (required): Playlist name (string)

**UI Pattern**:
```yaml
type: button
name: "Create Playlist"
tap_action:
  action: call-service
  service: mopidy.create_playlist
  service_data:
    entity_id: media_player.mopidy_entity
    name: "{{ states('input_text.mopidy_playlist_name') }}"
```

**Pre-call Validation**:
- Check `queue_size > 0` (queue not empty)
- Validate `name` is non-empty string
- Display error message if validation fails

**Post-call Action**:
- Call `mopidy.refresh_playlists` to update playlist list
- Call `homeassistant.update_entity` to refresh entity state
- Update UI to show new playlist in list

---

### `mopidy.save_playlist`

**Purpose**: Save the current queue to an existing playlist.

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `uri` (required): Playlist URI (e.g., "m3u:My Playlist")

**UI Pattern**:
```yaml
type: button
name: "Save to Playlist"
tap_action:
  action: call-service
  service: mopidy.save_playlist
  service_data:
    entity_id: media_player.mopidy_entity
    uri: "{{ selected_playlist_uri }}"
```

**Pre-call Validation**:
- Check `queue_size > 0` (queue not empty)
- Validate `uri` exists in `source_list` attribute
- Display error message if validation fails

**Post-call Action**:
- Call `homeassistant.update_entity` to refresh entity state
- Display success message

---

### `mopidy.delete_playlist`

**Purpose**: Delete a playlist from the Mopidy server.

**Parameters**:
- `entity_id` (required): Mopidy entity ID
- `uri` (required): Playlist URI

**UI Pattern** (with confirmation):
```yaml
type: button
name: "Delete Playlist"
confirmation: "Are you sure you want to delete this playlist?"
tap_action:
  action: call-service
  service: mopidy.delete_playlist
  service_data:
    entity_id: media_player.mopidy_entity
    uri: "{{ selected_playlist_uri }}"
```

**Pre-call Validation**:
- Validate `uri` exists in `source_list` attribute
- Display error message if validation fails

**Post-call Action**:
- Call `mopidy.refresh_playlists` to update playlist list
- Call `homeassistant.update_entity` to refresh entity state
- Update UI to remove deleted playlist from list

---

### `mopidy.refresh_playlists`

**Purpose**: Refresh the playlist list from the backend.

**Parameters**:
- `entity_id` (required): Mopidy entity ID

**UI Pattern**:
```yaml
type: button
name: "Refresh Playlists"
icon: mdi:refresh
tap_action:
  action: call-service
  service: mopidy.refresh_playlists
  service_data:
    entity_id: media_player.mopidy_entity
```

**Post-call Action**:
- Call `homeassistant.update_entity` to refresh entity state
- Update UI to show refreshed playlist list

---

## Entity State Update Service

### `homeassistant.update_entity`

**Purpose**: Manually trigger entity state update (refresh).

**Parameters**:
- `entity_id` (required): Entity ID to update

**UI Pattern**:
```yaml
type: button
name: "Refresh"
icon: mdi:refresh
tap_action:
  action: call-service
  service: homeassistant.update_entity
  service_data:
    entity_id: media_player.mopidy_entity
```

**Usage**:
- Called after queue/playlist operations to refresh UI
- Called manually by user via refresh button
- Can be chained with other service calls

---

## Error Handling Patterns

### Pattern 1: Entity Unavailable State

**Check**:
```jinja2
{% if is_state('media_player.mopidy_entity', 'unavailable') %}
  <div class="error">Mopidy server is unavailable</div>
{% endif %}
```

**Display**: Show error message in template card, disable interactive controls.

---

### Pattern 2: Empty Queue Validation

**Check**:
```jinja2
{% set queue_size = state_attr('media_player.mopidy_entity', 'queue_size') | int %}
{% if queue_size == 0 %}
  <div class="warning">Queue is empty</div>
{% endif %}
```

**Display**: Show warning message, disable queue operations.

---

### Pattern 3: Invalid Position Validation

**Check**:
```jinja2
{% set queue_size = state_attr('media_player.mopidy_entity', 'queue_size') | int %}
{% set from_pos = states('input_number.mopidy_queue_from_position') | int %}
{% if from_pos < 1 or from_pos > queue_size %}
  <div class="error">Invalid position: must be between 1 and {{ queue_size }}</div>
{% endif %}
```

**Display**: Show error message, disable action button.

---

## Service Call Sequences

### Sequence 1: Move Track with Refresh

```yaml
1. User enters from_position and to_position in input_number helpers
2. User clicks "Move Track" button
3. Service call: mopidy.move_track
4. Service call: homeassistant.update_entity (refresh)
5. UI updates to show new queue state
```

### Sequence 2: Create Playlist with Refresh

```yaml
1. User enters playlist name in input_text helper
2. User clicks "Create Playlist" button
3. Service call: mopidy.create_playlist
4. Service call: mopidy.refresh_playlists
5. Service call: homeassistant.update_entity (refresh)
6. UI updates to show new playlist in list
```

### Sequence 3: Delete Playlist with Confirmation

```yaml
1. User selects playlist from list
2. User clicks "Delete Playlist" button
3. Confirmation dialog appears
4. User confirms deletion
5. Service call: mopidy.delete_playlist
6. Service call: mopidy.refresh_playlists
7. Service call: homeassistant.update_entity (refresh)
8. UI updates to remove deleted playlist
```

---

## Notes

- **Service Responses**: Most services return void (no response data). Error handling is done via entity state and template conditionals.
- **Service Validation**: Pre-call validation should be done in templates before service calls to provide immediate user feedback.
- **State Refresh**: Always call `homeassistant.update_entity` after write operations to ensure UI reflects latest state.
- **Error Messages**: Display user-friendly error messages in templates, not technical error codes.
- **Confirmation Dialogs**: Use button `confirmation` option for destructive actions (delete playlist).

