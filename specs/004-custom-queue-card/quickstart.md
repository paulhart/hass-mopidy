# Quickstart: Custom Queue Management Card

**Feature**: Custom Queue Management Card  
**Date**: 2025-12-11

## Purpose

Validate that the custom queue management card is implemented correctly and functions as specified, including drag-and-drop reordering, tap-to-play, and cross-platform compatibility (web and iOS app).

## Prerequisites

- Home Assistant instance running
- Mopidy server accessible with tracks in library
- Mopidy integration installed and configured (feature 002-mopidy-enhanced-services)
- Custom card installed via HACS or manually
- Access to Home Assistant web interface
- Access to Home Assistant iOS app (for iOS testing)
- Queue with at least 5 tracks for testing

## Validation Steps

### Phase 1: Backend Services Validation

#### Test: `queue_tracks` Entity Attribute

1. Add tracks to queue (play an album or playlist with at least 5 tracks)
2. Go to **Developer Tools** → **States**
3. Find your Mopidy entity (e.g., `media_player.mopidy_living_room`)
4. Check `queue_tracks` attribute exists
5. **Expected**: `queue_tracks` is an array of track objects with structure:
   ```python
   [
       {
           'position': 1,
           'uri': 'spotify:track:...',
           'title': 'Track Name',
           'artist': 'Artist Name',
           'album': 'Album Name',
           'duration': 180
       },
       # ... more tracks
   ]
   ```
6. **Verify**: Array length matches `queue_size` attribute
7. **Verify**: Tracks are ordered by position (index 0 = position 1)

#### Test: `mopidy.play_track_at_position` Service

1. Queue has at least 5 tracks
2. Note current playing position (check `queue_position` attribute)
3. Go to **Developer Tools** → **Services**
4. Call `mopidy.play_track_at_position` service:
   - `entity_id`: Your Mopidy entity
   - `position`: 3
5. **Expected**: Track at position 3 starts playing
6. **Verify**: `queue_position` attribute updates to 3
7. **Verify**: Queue order unchanged (tracks remain at original positions)
8. **Verify**: Playback begins from start of track (not resuming previous position)

#### Test: `mopidy.play_track_at_position` Error Handling

1. Call service with invalid position (e.g., `position: 999` when queue has 5 tracks)
2. **Expected**: Error message showing valid range (1 to 5)
3. Call service with empty queue (clear queue first)
4. **Expected**: Error message "Queue is empty"

---

### Phase 2: Custom Card Installation

#### Test: Card Installation

1. Install custom card via HACS or manually
2. Go to **Dashboard** → **Edit Dashboard**
3. Add card → **Manual** (YAML mode)
4. Add card configuration:
   ```yaml
   type: custom:mopidy-queue-card
   entity: media_player.mopidy_living_room
   ```
5. **Expected**: Card appears in dashboard
6. **Verify**: No console errors in browser developer tools

---

### Phase 3: Queue Display Validation

#### Test: Initial Load

1. View custom card with queue containing tracks
2. **Expected**: Loading spinner appears briefly
3. **Expected**: Queue list displays with all tracks
4. **Verify**: Each track shows position, title, artist (when available)
5. **Verify**: Currently playing track is visually distinguished (highlight, icon, etc.)

#### Test: Empty Queue State

1. Clear queue (remove all tracks)
2. View custom card
3. **Expected**: Empty state message displayed (no track list)
4. **Verify**: Message is clear and user-friendly

#### Test: Entity Unavailable State

1. Stop Mopidy server or disconnect network
2. View custom card
3. **Expected**: Error message displayed with retry button
4. **Verify**: Error message indicates server is unavailable
5. Click retry button
6. **Expected**: Card attempts to re-fetch entity state

#### Test: Missing Metadata Handling

1. Queue contains tracks with missing metadata (some fields None)
2. View custom card
3. **Expected**: Tracks display with "Unknown" for missing fields
4. **Verify**: Card does not crash or show errors for None values

---

### Phase 4: Drag-and-Drop Validation (Web)

#### Test: Basic Drag-and-Drop

1. Queue has at least 5 tracks
2. View custom card in web browser
3. Drag track at position 3 to position 1
4. **Expected**: Visual feedback during drag (track becomes semi-transparent, cursor changes)
5. **Expected**: Insertion indicator shows where track will be dropped
6. **Expected**: Track moves to position 1 after drop
7. **Expected**: Other tracks shift accordingly (original 1-2 become 2-3)
8. **Verify**: Queue order updates on Mopidy server (check via Mopidy web interface)
9. **Verify**: Card refreshes to show new order

#### Test: Drag to Same Position

1. Drag track and release at same position
2. **Expected**: No change to queue order
3. **Verify**: No service call made

#### Test: Drag Operation Feedback

1. Start dragging a track
2. **Expected**: Visual feedback (semi-transparent, cursor change, drop zones highlighted)
3. Drag over valid drop position
4. **Expected**: Insertion line or highlighted area shows drop target
5. Complete drag operation
6. **Expected**: Operation completes within 2 seconds (per SC-001)

#### Test: Drag Error Handling

1. Start dragging a track
2. While dragging, stop Mopidy server or disconnect network
3. Complete drag operation
4. **Expected**: Error message displayed
5. **Expected**: Queue state remains unchanged (original order preserved)
6. **Verify**: Retry option available

---

### Phase 5: Tap-to-Play Validation (Web)

#### Test: Basic Tap-to-Play

1. Queue has at least 5 tracks, position 2 currently playing
2. View custom card in web browser
3. Click/tap on track at position 4
4. **Expected**: Track at position 4 starts playing immediately
5. **Expected**: Queue order unchanged (tracks stay at positions 1-5)
6. **Expected**: Visual indicator moves to position 4
7. **Verify**: Operation completes within 1 second (per SC-002)

#### Test: Tap Currently Playing Track

1. Track at position 2 is currently playing
2. Click/tap on track at position 2
3. **Expected**: Track restarts from beginning (playback position resets to 0:00)
4. **Verify**: Queue order unchanged

#### Test: Tap While Another Track Playing

1. Track at position 1 is currently playing
2. Click/tap on track at position 3
3. **Expected**: Track at position 1 stops
4. **Expected**: Track at position 3 starts from beginning
5. **Verify**: Queue order unchanged

---

### Phase 6: Touch Gesture Validation (Mobile/iOS)

#### Test: Drag-and-Drop on Touch Device

1. View custom card on mobile device (iOS app or mobile browser)
2. Queue has at least 5 tracks
3. Use touch gesture to drag track from position 3 to position 1
4. **Expected**: Drag operation works with touch events (not just mouse)
5. **Expected**: 10px movement threshold distinguishes drag from tap
6. **Expected**: Visual feedback during drag (same as web)
7. **Expected**: Track moves correctly after drop
8. **Verify**: Queue order updates on Mopidy server

#### Test: Tap-to-Play on Touch Device

1. View custom card on mobile device
2. Tap on track at position 4
3. **Expected**: Tap-to-play works with touch events
4. **Expected**: Track starts playing immediately
5. **Verify**: Operation completes within 1 second

#### Test: Gesture Distinction (Drag vs Tap)

1. View custom card on mobile device
2. Quick tap (<10px movement) on track
3. **Expected**: Tap-to-play triggered
4. Drag track (>10px movement)
5. **Expected**: Drag operation triggered (not tap)

---

### Phase 7: Reactive Updates Validation

#### Test: External Queue Modification

1. View custom card with queue displayed
2. Modify queue from another client (Mopidy web interface or another Home Assistant instance)
3. **Expected**: Card automatically refreshes to show updated queue state
4. **Verify**: No manual refresh needed
5. **Verify**: Card subscribes to entity state change events

#### Test: Queue Cleared Externally

1. View custom card with queue displayed
2. Clear queue from another client
3. **Expected**: Card updates to show empty state immediately
4. **Verify**: No manual refresh needed

---

### Phase 8: Performance Validation

#### Test: Large Queue Performance

1. Add 100 tracks to queue
2. View custom card
3. **Expected**: Card renders within 2 seconds (per SC-003)
4. **Expected**: Scrolling is smooth (60fps, per SC-007)
5. **Expected**: Tap response is instant (per SC-007)
6. **Verify**: No lag or performance degradation

#### Test: Rapid Operations

1. Perform multiple drag-and-drop operations rapidly
2. **Expected**: Operations queue or second operation cancels first
3. **Expected**: No race conditions or state corruption
4. **Verify**: Final queue state is correct

---

### Phase 9: Cross-Platform Compatibility

#### Test: Web and iOS App Identical Functionality

1. Test all interactions (drag, drop, tap) in web interface
2. Test same interactions in iOS app
3. **Expected**: All interactions work identically in both platforms
4. **Verify**: Visual appearance is consistent
5. **Verify**: Performance is similar
6. **Verify**: Error handling works the same

---

### Phase 10: Error Recovery

#### Test: Network Error Recovery

1. View custom card with queue displayed
2. Disconnect network during drag operation
3. **Expected**: Error message displayed
4. **Expected**: Current queue display maintained
5. Reconnect network
6. Click retry button
7. **Expected**: Card refreshes and displays current queue state

#### Test: Server Unavailable Recovery

1. View custom card
2. Stop Mopidy server
3. **Expected**: Error message displayed
4. **Expected**: Interactions disabled until server available
5. Start Mopidy server
6. Click retry button
7. **Expected**: Card refreshes and displays queue state

---

## Success Criteria Validation

- **SC-001**: Drag-and-drop completes in under 3 seconds for 20 tracks ✅
- **SC-002**: Tap-to-play begins within 1 second ✅
- **SC-003**: Card renders 50 tracks within 2 seconds on mobile ✅
- **SC-004**: Drag-and-drop succeeds 95% of the time (test multiple operations) ✅
- **SC-005**: Card works identically in web and iOS app ✅
- **SC-006**: Users can complete tasks without instructions (intuitive interface) ✅
- **SC-007**: Card maintains 60fps scrolling and instant tap response for 100 tracks ✅

---

## Troubleshooting

**Card not appearing:**
- Check card is installed correctly (HACS or manual installation)
- Check browser console for errors
- Verify entity ID is correct in card configuration

**Drag-and-drop not working:**
- Check browser console for JavaScript errors
- Verify SortableJS library is loaded
- Check touch events are enabled (for mobile)

**Service calls failing:**
- Verify `mopidy.play_track_at_position` service exists
- Check Home Assistant logs for service errors
- Verify entity is available and Mopidy server is running

**Entity state not updating:**
- Check entity subscription is working (browser console)
- Verify `queue_tracks` attribute is being updated
- Check Home Assistant logs for entity update errors

**iOS app issues:**
- Verify custom card is installed in iOS app
- Check iOS app logs for errors
- Verify card uses standard HA custom card patterns (no platform-specific code)

---

## Notes

- All validation steps should be performed in both web interface and iOS app
- Performance tests should be run on actual mobile devices (not just browser dev tools mobile mode)
- Error scenarios should be tested to ensure graceful degradation
- Large queue tests (100 tracks) verify scalability requirements

