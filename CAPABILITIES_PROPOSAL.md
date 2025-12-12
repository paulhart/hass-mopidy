# Proposed Mopidy Integration Capabilities

**Date**: 2025-12-11  
**Current Version**: 2.4.2  
**Status**: Proposal for Future Enhancement

## Executive Summary

This document proposes new capabilities to add to the Home Assistant Mopidy integration based on:
- Current implementation analysis
- Mopidy HTTP API capabilities
- Home Assistant media player best practices
- User experience improvements

## Currently Implemented Features

### Core Playback
- ✅ Play, pause, stop, next, previous
- ✅ Seek to position
- ✅ Volume control (set, mute, volume up/down)
- ✅ State tracking (playing, paused, stopped, idle)

### Queue Management
- ✅ Add tracks to queue (`tracklist.add`)
- ✅ Clear queue (`tracklist.clear`)
- ✅ Get queue position and size
- ✅ Queue tracks from search results

### Tracklist Controls
- ✅ Repeat modes (OFF, ALL, ONE)
- ✅ Shuffle/random mode
- ✅ Consume mode (remove tracks after playing)

### Library & Search
- ✅ Browse library (`library.browse`)
- ✅ Search tracks (`library.search`)
- ✅ Get images/artwork (`library.get_images`)
- ✅ Get supported URI schemes

### Playlists
- ✅ List playlists (`playlists.as_list`)
- ✅ Lookup playlist (`playlists.lookup`)
- ✅ Select source (playlist playback)

### Services
- ✅ `mopidy.search` - Search and add to queue
- ✅ `mopidy.get_search_result` - Search and return URIs
- ✅ `mopidy.snapshot` - Save current state
- ✅ `mopidy.restore` - Restore saved state
- ✅ `mopidy.set_consume_mode` - Toggle consume mode

---

## Proposed Capabilities

### Priority 1: High Value, Low Complexity

#### 1. Tracklist Management Services
**Mopidy API**: `tracklist.move`, `tracklist.remove`, `tracklist.filter`

**Proposed Services**:
- `mopidy.move_track` - Reorder tracks in queue
  - Parameters: `from_position`, `to_position`
  - Use case: Reorder queue without clearing and re-adding
  
- `mopidy.remove_track` - Remove specific track(s) from queue
  - Parameters: `position` or `positions` (list)
  - Use case: Remove unwanted tracks without clearing entire queue
  
- `mopidy.filter_tracks` - Filter queue by criteria
  - Parameters: `criteria` (dict with artist, album, etc.)
  - Use case: Remove all tracks matching certain criteria

**Implementation Complexity**: Low  
**User Value**: High - Essential for queue management workflows

---

#### 2. Playback History
**Mopidy API**: `history.get_history`, `history.get_length`

**Proposed Features**:
- `mopidy.get_history` - Retrieve recently played tracks
  - Parameters: `limit` (optional, default 20)
  - Returns: List of track URIs with metadata
  
- Entity attribute: `media_history` - Last N played tracks
  - Exposed as entity attribute for automations
  
- Service: `mopidy.play_from_history` - Play track from history
  - Parameters: `index` (position in history)

**Implementation Complexity**: Low-Medium  
**User Value**: High - Enables "recently played" features and quick replay

---

#### 3. Enhanced Playlist Management
**Mopidy API**: `playlists.create`, `playlists.delete`, `playlists.save`, `playlists.refresh`, `playlists.get_items`

**Proposed Services**:
- `mopidy.create_playlist` - Create new playlist from current queue
  - Parameters: `name` (required)
  - Use case: Save current queue as playlist
  
- `mopidy.delete_playlist` - Delete a playlist
  - Parameters: `uri` (playlist URI)
  
- `mopidy.save_playlist` - Save current queue to existing playlist
  - Parameters: `uri` (playlist URI)
  
- `mopidy.refresh_playlists` - Refresh playlist list from backend
  - Use case: Update after external playlist changes

**Implementation Complexity**: Medium  
**User Value**: High - Complete playlist lifecycle management

---

#### 4. Track Information Lookup
**Mopidy API**: `library.lookup`, `library.find_exact`

**Proposed Services**:
- `mopidy.lookup_track` - Get detailed track information
  - Parameters: `uri` (track URI)
  - Returns: Full track metadata (artist, album, duration, etc.)
  
- `mopidy.find_exact` - Find exact track match
  - Parameters: `query` (dict with artist, album, track_name)
  - Returns: Matching track URIs
  - Use case: More precise than search for automation

**Implementation Complexity**: Low  
**User Value**: Medium-High - Enables richer metadata in automations

---

### Priority 2: Medium Value, Medium Complexity

#### 5. Advanced Queue Operations
**Mopidy API**: `tracklist.index`, `tracklist.slice`, `tracklist.shuffle`

**Proposed Services**:
- `mopidy.shuffle_queue` - Shuffle current queue order
  - Parameters: `start_position`, `end_position` (optional)
  - Use case: Shuffle without changing shuffle mode
  
- `mopidy.get_queue_slice` - Get subset of queue
  - Parameters: `start`, `end`
  - Returns: Track URIs in range
  - Use case: Preview upcoming tracks

**Implementation Complexity**: Low-Medium  
**User Value**: Medium - Nice-to-have queue manipulation

---

#### 6. Library Statistics & Discovery
**Mopidy API**: `library.get_distinct`

**Proposed Features**:
- Entity attributes:
  - `library_artists_count` - Number of unique artists
  - `library_albums_count` - Number of unique albums
  - `library_tracks_count` - Number of tracks
  
- Service: `mopidy.get_distinct` - Get distinct values
  - Parameters: `field` (artist, album, genre, etc.)
  - Returns: List of unique values
  - Use case: Build dynamic playlists or filters

**Implementation Complexity**: Medium  
**User Value**: Medium - Useful for library exploration and statistics

---

#### 7. Stream Title & Metadata Enhancement
**Mopidy API**: `playback.get_stream_title` (already used, but could expose more)

**Proposed Features**:
- Entity attribute: `media_stream_title` - Current stream title
  - Already tracked internally, expose as attribute
  
- Entity attribute: `media_stream_metadata` - Additional stream metadata
  - For radio streams and live content

**Implementation Complexity**: Low  
**User Value**: Medium - Better visibility of streaming content

---

### Priority 3: Lower Priority / Advanced Features

#### 8. Multi-Room / Zone Support
**Mopidy API**: Requires Mopidy extension (e.g., Mopidy-Snapcast)

**Proposed Features**:
- Support for Mopidy-Snapcast zones
- Entity per zone with synchronized playback
- Service: `mopidy.sync_zones` - Sync playback across zones

**Implementation Complexity**: High  
**User Value**: High (for multi-room setups)  
**Note**: Requires Mopidy-Snapcast extension

---

#### 9. Playback Position Tracking
**Mopidy API**: `playback.get_time_position` (already used)

**Proposed Features**:
- Entity attribute: `media_position_updated_at` - Last position update time
- Service: `mopidy.seek_relative` - Seek forward/backward by seconds
  - Parameters: `seconds` (positive = forward, negative = backward)

**Implementation Complexity**: Low  
**User Value**: Low-Medium - Convenience feature

---

#### 10. Track Rating / Favorites
**Mopidy API**: Requires backend support (not standard Mopidy)

**Proposed Features**:
- Service: `mopidy.rate_track` - Rate current track
  - Parameters: `rating` (1-5 stars)
- Entity attribute: `favorite_tracks` - List of favorited tracks

**Implementation Complexity**: High  
**User Value**: Medium  
**Note**: Requires custom backend or extension support

---

#### 11. Smart Playlists / Auto-Play
**Mopidy API**: Custom logic using existing APIs

**Proposed Services**:
- `mopidy.auto_play_similar` - Play similar tracks to current
  - Parameters: `limit` (number of tracks)
  - Logic: Use library search with current track metadata
  
- `mopidy.auto_play_artist` - Play more tracks by current artist
  - Parameters: `limit`, `exclude_current` (boolean)

**Implementation Complexity**: Medium-High  
**User Value**: Medium-High - Enhances discovery

---

#### 12. Queue Analytics
**Mopidy API**: Custom logic using `tracklist.get_tl_tracks`

**Proposed Features**:
- Entity attributes:
  - `queue_duration` - Total duration of queue
  - `queue_artists` - List of artists in queue
  - `queue_albums` - List of albums in queue
  - `queue_genres` - List of genres in queue

**Implementation Complexity**: Medium  
**User Value**: Low-Medium - Informational, useful for automations

---

## Implementation Recommendations

### Phase 1 (Next Release)
1. Tracklist Management Services (move, remove, filter)
2. Playback History (get_history service)
3. Enhanced Playlist Management (create, delete, save)

### Phase 2 (Future Release)
4. Track Information Lookup (lookup, find_exact)
5. Advanced Queue Operations (shuffle_queue, get_queue_slice)
6. Library Statistics (get_distinct, counts)

### Phase 3 (Advanced Features)
7. Multi-Room Support (if Snapcast extension available)
8. Smart Playlists / Auto-Play
9. Queue Analytics

---

## Technical Considerations

### Home Assistant Integration Points

1. **Services**: Add new services to `services.yaml` following existing patterns
2. **Entity Attributes**: Expose new data via `extra_state_attributes()`
3. **Media Player Features**: Add new `MediaPlayerEntityFeature` flags if needed
4. **State Management**: Update `update()` method to fetch new data

### API Compatibility

- All proposed features use standard Mopidy HTTP API methods
- No new dependencies required
- Backward compatible with existing installations

### Error Handling

- Follow existing error handling patterns (specific exceptions, context logging)
- Handle cases where backend doesn't support certain features gracefully
- Provide clear error messages for unsupported operations

### Testing Considerations

- Test with various Mopidy backends (local, Spotify, etc.)
- Verify behavior with empty queues/playlists
- Test error cases (invalid URIs, missing playlists, etc.)

---

## User Experience Improvements

### Automation Examples

**Reorder Queue**:
```yaml
automation:
  - alias: "Move current track to end"
    trigger: ...
    action:
      - service: mopidy.move_track
        data:
          entity_id: media_player.mopidy
          from_position: "{{ state_attr('media_player.mopidy', 'media_queue_position') }}"
          to_position: -1
```

**Create Playlist from Queue**:
```yaml
automation:
  - alias: "Save party playlist"
    trigger: ...
    action:
      - service: mopidy.create_playlist
        data:
          entity_id: media_player.mopidy
          name: "Party Mix {{ now().strftime('%Y-%m-%d') }}"
```

**Play from History**:
```yaml
automation:
  - alias: "Replay last song"
    trigger: ...
    action:
      - service: mopidy.play_from_history
        data:
          entity_id: media_player.mopidy
          index: 0  # Most recent
```

---

## Success Metrics

- **Adoption**: Number of users utilizing new services
- **Automation Usage**: New automations created using new capabilities
- **User Feedback**: Requests for additional features
- **Code Quality**: Maintainability and test coverage

---

## References

- [Mopidy HTTP API Documentation](https://docs.mopidy.com/en/latest/api/http/)
- [Home Assistant Media Player Integration](https://www.home-assistant.io/integrations/media_player/)
- Current implementation: `custom_components/mopidy/`

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-11

