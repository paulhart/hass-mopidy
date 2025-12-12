# Quickstart: Mopidy UI Enhancements

**Date**: 2025-12-11  
**Feature**: 003-ui-enhancement

## Overview

This guide provides validation steps for the Mopidy UI Enhancement feature. Since this feature provides UI templates (YAML configuration) rather than code, validation focuses on:

1. Template syntax correctness
2. Service call functionality
3. Entity attribute display
4. User interaction flows
5. Error handling
6. Responsive design

## Prerequisites

- Home Assistant instance running (version 2024.1+ recommended)
- Mopidy integration installed and configured (002-mopidy-enhanced-services feature)
- At least one Mopidy entity available (`media_player.mopidy_*`)
- Mopidy server running with tracks in queue and playback history
- Access to Home Assistant dashboard editor (UI mode or YAML mode)

---

## Validation Steps

### Phase 1: Template Syntax Validation

#### Step 1.1: Validate YAML Syntax

**Action**: Copy template YAML files to dashboard configuration.

**Expected Result**: 
- No YAML syntax errors in Home Assistant logs
- Templates load without errors in dashboard editor

**Validation**:
```bash
# Check Home Assistant logs for YAML errors
# Dashboard should load without "Invalid config" errors
```

**Success Criteria**: All templates load without syntax errors.

---

#### Step 1.2: Validate Jinja2 Template Syntax

**Action**: View templates in dashboard editor and check for template errors.

**Expected Result**:
- No Jinja2 syntax errors in Home Assistant logs
- Templates render correctly in dashboard preview

**Validation**:
```bash
# Check Home Assistant logs for template errors
# Dashboard preview should show rendered content (not raw template code)
```

**Success Criteria**: All Jinja2 templates render without errors.

---

### Phase 2: Entity Attribute Display

#### Step 2.1: Validate Queue State Display

**Action**: 
1. Add queue management template to dashboard
2. Ensure Mopidy entity has tracks in queue (queue_size > 0)
3. View dashboard

**Expected Result**:
- Queue position displayed (e.g., "Position 3 of 15")
- Queue size displayed correctly
- Current playing track indicator visible (if applicable)

**Validation**:
- Check `queue_position` attribute matches displayed value
- Check `queue_size` attribute matches displayed value
- Verify position is within valid range [1, queue_size]

**Success Criteria**: Queue state displays correctly and matches entity attributes.

---

#### Step 2.2: Validate History Display

**Action**:
1. Add playback history template to dashboard
2. Ensure Mopidy entity has playback history (media_history attribute populated)
3. View dashboard

**Expected Result**:
- History list displays with most recent track first
- Track metadata displayed (title, artist, album, timestamp)
- Timestamps formatted in human-readable format (e.g., "2 hours ago")
- Missing metadata handled gracefully (shows "Unknown Artist", etc.)

**Validation**:
- Check `media_history` attribute matches displayed list
- Verify timestamp formatting (not raw ISO strings)
- Verify missing metadata shows placeholders

**Success Criteria**: History displays correctly with formatted timestamps and handles missing metadata.

---

#### Step 2.3: Validate Playlist List Display

**Action**:
1. Add playlist management template to dashboard
2. Ensure Mopidy entity has playlists (source_list attribute populated)
3. View dashboard

**Expected Result**:
- Playlist list displays with playlist names (not URIs)
- Playlist names extracted correctly from URIs (e.g., "m3u:My Playlist" → "My Playlist")

**Validation**:
- Check `source_list` attribute matches displayed playlists
- Verify playlist names are extracted correctly (URI scheme removed)

**Success Criteria**: Playlist list displays correctly with readable names.

---

### Phase 3: Service Call Functionality

#### Step 3.1: Validate Move Track Service

**Action**:
1. Add queue management template to dashboard
2. Ensure queue has at least 3 tracks
3. Enter from_position=3, to_position=1 in input fields
4. Click "Move Track" button
5. Wait for entity state update
6. Verify queue state

**Expected Result**:
- Track at position 3 moves to position 1
- Other tracks shift accordingly
- Queue state updates after refresh
- No errors in Home Assistant logs

**Validation**:
- Check `queue_position` and `queue_size` attributes updated
- Verify track order changed in Mopidy server
- Verify UI reflects new queue state after refresh

**Success Criteria**: Move track operation completes successfully and queue state updates.

---

#### Step 3.2: Validate Remove Track Service

**Action**:
1. Add queue management template to dashboard
2. Note current queue_size
3. Enter position=2 in input field
4. Click "Remove Track" button
5. Wait for entity state update
6. Verify queue state

**Expected Result**:
- Track at position 2 is removed
- Queue size decreases by 1
- Queue state updates after refresh
- No errors in Home Assistant logs

**Validation**:
- Check `queue_size` attribute decreased by 1
- Verify track removed from Mopidy server
- Verify UI reflects new queue state after refresh

**Success Criteria**: Remove track operation completes successfully and queue state updates.

---

#### Step 3.3: Validate Filter Tracks Service

**Action**:
1. Add queue management template to dashboard
2. Ensure queue has tracks from multiple artists
3. Enter artist name in filter field
4. Click "Remove Matching" button
5. Wait for entity state update
6. Verify queue state

**Expected Result**:
- All tracks matching criteria are removed
- Queue size decreases accordingly
- Queue state updates after refresh
- No errors in Home Assistant logs

**Validation**:
- Check `queue_size` attribute decreased
- Verify matching tracks removed from Mopidy server
- Verify UI reflects new queue state after refresh

**Success Criteria**: Filter tracks operation completes successfully and queue state updates.

---

#### Step 3.4: Validate Play from History Service

**Action**:
1. Add playback history template to dashboard
2. Ensure history has at least 2 tracks
3. Click on a track in history list (or use play button with index)
4. Verify playback starts

**Expected Result**:
- Selected track starts playing
- Entity state updates to "playing"
- Current track information updates
- No errors in Home Assistant logs

**Validation**:
- Check entity state is "playing"
- Verify track URI matches selected history entry
- Verify playback started on Mopidy server

**Success Criteria**: Play from history operation completes successfully and track starts playing.

---

#### Step 3.5: Validate Create Playlist Service

**Action**:
1. Add playlist management template to dashboard
2. Ensure queue has at least 1 track
3. Enter playlist name in input field
4. Click "Create Playlist" button
5. Wait for entity state update
6. Verify playlist appears in list

**Expected Result**:
- New playlist created with specified name
- Playlist appears in playlist list after refresh
- Queue contents saved to playlist
- No errors in Home Assistant logs

**Validation**:
- Check `source_list` attribute includes new playlist
- Verify playlist created on Mopidy server
- Verify playlist contains queue tracks

**Success Criteria**: Create playlist operation completes successfully and playlist appears in list.

---

#### Step 3.6: Validate Delete Playlist Service

**Action**:
1. Add playlist management template to dashboard
2. Ensure at least one playlist exists
3. Select playlist from list
4. Click "Delete Playlist" button
5. Confirm deletion in dialog
6. Wait for entity state update
7. Verify playlist removed from list

**Expected Result**:
- Confirmation dialog appears
- Playlist deleted after confirmation
- Playlist removed from list after refresh
- No errors in Home Assistant logs

**Validation**:
- Check `source_list` attribute no longer includes deleted playlist
- Verify playlist deleted from Mopidy server
- Verify UI reflects playlist removal after refresh

**Success Criteria**: Delete playlist operation completes successfully with confirmation and playlist removed.

---

### Phase 4: User Input Validation

#### Step 4.1: Validate Position Input Validation

**Action**:
1. Add queue management template to dashboard
2. Note current queue_size (e.g., 10)
3. Enter invalid position (e.g., 15) in input field
4. Attempt to perform operation (move/remove)

**Expected Result**:
- Error message displayed (e.g., "Position 15 is out of range. Valid range is 1 to 10")
- Operation button disabled or shows error
- No service call made with invalid input

**Validation**:
- Check error message displays correctly
- Verify service call not executed with invalid input
- Verify input validation works for both min (1) and max (queue_size) bounds

**Success Criteria**: Position input validation works correctly and prevents invalid operations.

---

#### Step 4.2: Validate Empty Queue Handling

**Action**:
1. Add queue management template to dashboard
2. Clear queue (queue_size = 0)
3. Attempt to perform queue operation (move/remove/filter)

**Expected Result**:
- Warning message displayed (e.g., "Queue is empty")
- Operation buttons disabled or show warning
- No service call made with empty queue

**Validation**:
- Check warning message displays correctly
- Verify service call not executed with empty queue
- Verify UI handles empty queue state gracefully

**Success Criteria**: Empty queue handling works correctly and prevents invalid operations.

---

#### Step 4.3: Validate Filter Criteria Validation

**Action**:
1. Add queue management template to dashboard
2. Leave all filter fields empty
3. Attempt to perform filter operation

**Expected Result**:
- Error message displayed (e.g., "At least one filter criteria must be provided")
- Operation button disabled or shows error
- No service call made with empty criteria

**Validation**:
- Check error message displays correctly
- Verify service call not executed with empty criteria
- Verify validation works for all filter fields

**Success Criteria**: Filter criteria validation works correctly and prevents invalid operations.

---

### Phase 5: Error Handling

#### Step 5.1: Validate Entity Unavailable State

**Action**:
1. Add UI templates to dashboard
2. Stop Mopidy server (or disconnect network)
3. Wait for entity to become unavailable
4. View dashboard

**Expected Result**:
- Error message displayed (e.g., "Mopidy server is unavailable")
- Interactive controls disabled
- No service calls attempted
- UI shows error state clearly

**Validation**:
- Check entity state is "unavailable"
- Verify error message displays correctly
- Verify controls are disabled
- Verify no service calls made

**Success Criteria**: Entity unavailable state handled gracefully with clear error message.

---

#### Step 5.2: Validate Service Call Error Handling

**Action**:
1. Add queue management template to dashboard
2. Ensure queue has tracks
3. Enter invalid position (e.g., 0 or negative)
4. Attempt to perform operation (if validation allows)

**Expected Result**:
- Error message displayed (if validation catches it)
- Or service call fails gracefully with error message
- No UI crash or unhandled error

**Validation**:
- Check error message displays correctly
- Verify service call error handled gracefully
- Verify UI remains functional after error

**Success Criteria**: Service call errors handled gracefully with user-friendly error messages.

---

### Phase 6: Responsive Design

#### Step 6.1: Validate Desktop Layout

**Action**:
1. Add UI templates to dashboard
2. View dashboard on desktop browser (1920x1080 or larger)
3. Verify layout and readability

**Expected Result**:
- Layout displays correctly with appropriate spacing
- All controls accessible and readable
- No horizontal scrolling required
- Cards organized in grid or stack layout

**Validation**:
- Check layout is organized and readable
- Verify all controls are accessible
- Verify no layout issues (overlapping, cut-off text)

**Success Criteria**: Desktop layout displays correctly with good usability.

---

#### Step 6.2: Validate Tablet Layout

**Action**:
1. Add UI templates to dashboard
2. View dashboard on tablet device (768x1024 or similar)
3. Verify layout and readability

**Expected Result**:
- Layout adapts to tablet screen size
- All controls accessible and readable
- Cards stack vertically or use responsive grid
- No horizontal scrolling required

**Validation**:
- Check layout adapts to tablet size
- Verify all controls are accessible
- Verify responsive design works correctly

**Success Criteria**: Tablet layout displays correctly with good usability.

---

#### Step 6.3: Validate Mobile Layout

**Action**:
1. Add UI templates to dashboard
2. View dashboard on mobile device (320x568 or similar)
3. Verify layout and readability

**Expected Result**:
- Layout adapts to mobile screen size
- All controls accessible and readable (touch-friendly)
- Cards stack vertically
- Text is readable without zooming
- No horizontal scrolling required

**Validation**:
- Check layout adapts to mobile size
- Verify all controls are touch-friendly (adequate size)
- Verify text is readable
- Verify responsive design works correctly

**Success Criteria**: Mobile layout displays correctly with good usability (320px+ screen width).

---

### Phase 7: Performance

#### Step 7.1: Validate Large Queue Display

**Action**:
1. Add queue management template to dashboard
2. Ensure queue has 100+ tracks
3. View dashboard
4. Verify performance

**Expected Result**:
- Dashboard loads without noticeable lag
- UI remains responsive during interactions
- No performance degradation with large queue

**Validation**:
- Check dashboard load time (< 2 seconds)
- Verify UI interactions are responsive
- Verify no memory issues or slowdowns

**Success Criteria**: Large queue (100+ tracks) displays without performance issues.

---

#### Step 7.2: Validate Large History Display

**Action**:
1. Add playback history template to dashboard
2. Ensure history has 20 tracks (default limit)
3. View dashboard
4. Verify performance

**Expected Result**:
- Dashboard loads without noticeable lag
- History list scrolls smoothly
- No performance degradation with full history

**Validation**:
- Check dashboard load time (< 2 seconds)
- Verify scrolling is smooth
- Verify no memory issues or slowdowns

**Success Criteria**: Full history (20 tracks) displays without performance issues.

---

## Troubleshooting

### Issue: Templates not loading

**Symptoms**: Dashboard shows "Invalid config" or templates don't render.

**Solutions**:
1. Check YAML syntax in template files
2. Check Jinja2 template syntax
3. Verify entity IDs are correct
4. Check Home Assistant logs for specific errors

---

### Issue: Service calls not working

**Symptoms**: Buttons don't trigger service calls or service calls fail.

**Solutions**:
1. Verify entity ID is correct in service_data
2. Verify service names are correct (mopidy.move_track, etc.)
3. Check Home Assistant logs for service call errors
4. Verify Mopidy integration (002 feature) is installed and working

---

### Issue: Entity attributes not displaying

**Symptoms**: Queue size, history, or playlists not showing in UI.

**Solutions**:
1. Verify entity has required attributes (queue_position, queue_size, media_history, source_list)
2. Check entity state (should not be "unavailable")
3. Verify template syntax for accessing attributes (state_attr function)
4. Call homeassistant.update_entity to refresh entity state

---

### Issue: Input validation not working

**Symptoms**: Invalid input accepted or validation errors not displayed.

**Solutions**:
1. Verify input_number/input_text helpers are configured correctly
2. Check template validation logic (Jinja2 conditionals)
3. Verify min/max values for input_number helpers
4. Check template error message display logic

---

### Issue: Responsive design not working

**Symptoms**: Layout doesn't adapt to screen size or controls are cut off.

**Solutions**:
1. Verify grid card column configuration
2. Check vertical-stack/horizontal-stack card usage
3. Verify CSS in template cards (if used)
4. Test on different screen sizes

---

## Success Criteria Summary

- ✅ All templates load without syntax errors
- ✅ Entity attributes display correctly
- ✅ Service calls execute successfully
- ✅ User input validation works correctly
- ✅ Error handling displays user-friendly messages
- ✅ Responsive design works on desktop, tablet, and mobile (320px+)
- ✅ Performance is acceptable for large queues (100+ tracks) and full history (20 tracks)
- ✅ All user stories can be completed via UI templates

---

## Next Steps

After validation:
1. Document any issues found during validation
2. Update templates if issues are found
3. Create user documentation for template usage
4. Update README with template installation instructions
5. Prepare for release (version bump, changelog update)

