# Feature Specification: Custom Queue Management Card

**Feature Branch**: `004-custom-queue-card`  
**Created**: 2025-12-11  
**Status**: Draft  
**Input**: User description: "replace the current set of cards for queue management with a single custom card that will work through the web and in the home assistant iOS app. It requires drag and drop reordering and the ability to tap on an item in the queue to start playing that item in the queue without reordering the list."

## Clarifications

### Session 2025-12-11

- Q: What is the exact structure of the `queue_tracks` attribute? What fields should each track object contain, and how often should it update? → A: Array of track objects with position (int, 1-based), uri (str), title (str|None), artist (str|None), album (str|None), duration (int|None in seconds), ordered by position, updates on entity refresh cycle
- Q: How should the custom card detect queue changes? Should it poll the entity attribute, subscribe to entity state changes, or use another mechanism? → A: Subscribe to entity state change events (reactive updates when entity updates)
- Q: What should the card display during initial load and during async operations (drag, tap)? → A: Show loading spinner during initial load, show operation feedback (spinner/disabled state) during drag/tap operations
- Q: How should errors be displayed to users, and should the card provide retry mechanisms? → A: Show inline error message above/below queue list with retry button to re-fetch data
- Q: What movement distance or time threshold should distinguish a drag gesture from a tap gesture on touch devices? → A: 10px movement threshold (standard touch interaction, good balance)

## User Scenarios & Testing

### User Story 1 - Interactive Queue Display (Priority: P1)

As a Home Assistant user, I want to see my Mopidy playback queue displayed as an interactive list of tracks with metadata so that I can quickly understand what's queued and what's currently playing.

**Why this priority**: The foundation for all queue management interactions. Users must be able to see the queue contents before they can manage it. Without a visual track list, drag-and-drop and tap-to-play features are meaningless. This replaces the current template-based approach which only shows queue size and position numbers, not actual track information.

**Independent Test**: Can be fully tested by displaying a custom card for a Mopidy entity with tracks in the queue, verifying that all tracks are shown with their metadata (title, artist, album, position), and confirming the currently playing track is visually distinguished from other tracks.

**Acceptance Scenarios**:

1. **Given** a Mopidy entity with 10 tracks in the queue, **When** I view the custom queue card, **Then** I see a list of all 10 tracks with their titles, artists, and positions (1-10), and the currently playing track is highlighted or marked with an indicator
2. **Given** a custom queue card displaying tracks, **When** I view the card, **Then** each track shows at minimum: position number, track title, and artist name (when available)
3. **Given** a custom queue card, **When** the queue is empty, **Then** I see a clear message indicating the queue is empty with no track list displayed
4. **Given** a custom queue card, **When** the Mopidy entity is unavailable, **Then** I see an inline error message indicating the server is unavailable with a retry button to re-fetch data
5. **Given** a custom queue card with tracks from multiple sources, **When** I view the card, **Then** tracks display their metadata regardless of source (local, Spotify, etc.), with "Unknown" shown for missing metadata fields
6. **Given** a custom queue card, **When** the card is initially loading queue data, **Then** I see a loading indicator (e.g., spinner) until the queue data is available

---

### User Story 2 - Drag and Drop Reordering (Priority: P1)

As a Home Assistant user, I want to reorder tracks in my queue by dragging and dropping them so that I can quickly rearrange the playback order without manually entering position numbers.

**Why this priority**: Drag-and-drop is the primary interaction method requested. It provides an intuitive, visual way to reorder tracks that is superior to the current position-input approach. This feature makes queue management accessible to all users, not just those comfortable with numeric inputs.

**Independent Test**: Can be fully tested by displaying the custom queue card with multiple tracks, dragging a track from one position to another, verifying the visual feedback during drag, and confirming the queue order updates on the Mopidy server after the drop operation completes.

**Acceptance Scenarios**:

1. **Given** a custom queue card with 5 tracks, **When** I drag track at position 3 to position 1, **Then** the track moves to position 1, other tracks shift accordingly (original positions 1-2 become 2-3), and the change is reflected on the Mopidy server
2. **Given** a custom queue card, **When** I start dragging a track, **Then** I see visual feedback indicating the drag operation (e.g., track becomes semi-transparent, cursor changes, drop zones highlighted)
3. **Given** a custom queue card, **When** I drag a track over a valid drop position, **Then** I see a visual indicator showing where the track will be inserted (e.g., insertion line or highlighted area)
4. **Given** a custom queue card, **When** I drag a track and release it at the same position, **Then** no change occurs to the queue order
5. **Given** a custom queue card, **When** I drag a track to reorder, **Then** the operation completes within 2 seconds and the queue list updates to reflect the new order
6. **Given** a custom queue card on a mobile device, **When** I use touch gestures to drag a track, **Then** the drag-and-drop operation works correctly using touch events (not just mouse events)

---

### User Story 3 - Tap to Play Track (Priority: P1)

As a Home Assistant user, I want to tap on any track in the queue to start playing it immediately so that I can jump to any queued track without manually reordering the queue or using service calls.

**Why this priority**: Tap-to-play is a fundamental music player interaction that users expect. It enables quick navigation through the queue without disrupting the queue order. This complements drag-and-drop by providing two distinct interaction modes: reorder (drag) vs. play (tap).

**Independent Test**: Can be fully tested by displaying the custom queue card with multiple tracks, tapping on a track that is not currently playing, and verifying that track starts playing on the Mopidy server without changing the queue order.

**Acceptance Scenarios**:

1. **Given** a custom queue card with 5 tracks where position 2 is currently playing, **When** I tap on the track at position 4, **Then** the track at position 4 starts playing immediately, the queue order remains unchanged (tracks stay at positions 1-5), and the visual indicator moves to position 4
2. **Given** a custom queue card, **When** I tap on the currently playing track, **Then** the track restarts from the beginning (playback position resets to 0:00)
3. **Given** a custom queue card, **When** I tap on a track to play it, **Then** the operation completes within 1 second and playback begins immediately
4. **Given** a custom queue card on a mobile device, **When** I tap on a track, **Then** the tap-to-play operation works correctly using touch events
5. **Given** a custom queue card, **When** I tap on a track while another track is playing, **When** the new track starts playing, **Then** the previous track stops and the new track begins from the start (not resuming previous playback position)

---

### Edge Cases

- What happens when the queue is modified by another client (Mopidy web interface, another Home Assistant instance) while the custom card is displayed? → Card subscribes to entity state change events and automatically refreshes to show current queue state when entity updates
- How does the card handle very long queue lists (100+ tracks)? → Card should support scrolling or pagination to maintain performance (implementation decision based on performance testing - see task T048 for optimization approach)
- What happens if a drag operation is interrupted (user navigates away, browser loses focus)? → Drag operation should be cancelled gracefully, queue should remain in original state
- How does the card handle rapid successive drag operations? → Operations should queue or the second operation should cancel the first
- What happens when a track is removed from the queue by another client during a drag operation? → Drag should be cancelled with appropriate error message
- How does the card handle network errors during drag or tap operations? → Show error message, maintain current queue display, allow retry
- What happens when the queue is cleared while the card is displayed? → Card should update to show empty state immediately
- How does the card handle tracks with very long titles or artist names? → Text should truncate with ellipsis or wrap appropriately to maintain layout
- What happens when the Mopidy server becomes unavailable during an operation? → Show error message, maintain last known queue state, disable interactions until server is available
- How does the card distinguish between drag and tap gestures on touch devices? → Use appropriate touch event thresholds (drag requires movement, tap is quick touch without movement)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display all tracks in the Mopidy playback queue as a scrollable list with track metadata (position, title, artist, album when available)
- **FR-002**: System MUST visually distinguish the currently playing track from other tracks in the queue (e.g., highlight, icon, different styling)
- **FR-003**: System MUST support drag-and-drop reordering of tracks in the queue using mouse interactions on web browsers
- **FR-004**: System MUST support drag-and-drop reordering of tracks in the queue using touch gestures on mobile devices (iOS app and mobile web browsers)
- **FR-005**: System MUST provide visual feedback during drag operations (drag preview, drop zone indicators, insertion markers)
- **FR-006**: System MUST call the `mopidy.move_track` service when a track is dropped at a new position, passing the correct from_position and to_position parameters (1-based)
- **FR-007**: System MUST support tap/click interactions on queue tracks to start playing that track immediately
- **FR-008**: System MUST call the `mopidy.play_track_at_position` service to start playback of a tapped track without modifying the queue order (this service will be implemented as part of this feature or a prerequisite feature)
- **FR-009**: System MUST work identically in Home Assistant web interface and Home Assistant iOS app (same card, same interactions)
- **FR-010**: System MUST display an empty state message when the queue contains no tracks
- **FR-011**: System MUST display an inline error message (above or below queue list) when the Mopidy entity is unavailable or connection fails
- **FR-012**: System MUST refresh the queue display after successful drag-and-drop or tap-to-play operations to show updated state
- **FR-013**: System MUST handle missing track metadata gracefully (display "Unknown Artist", "Unknown Album", "Unknown Title" when metadata is not available)
- **FR-014**: System MUST maintain queue display performance with queues containing up to 100 tracks (scrolling, rendering, interactions remain responsive). Measurable criteria defined in SC-007 (60fps scrolling, instant tap response).
- **FR-015**: System MUST distinguish between drag gestures and tap gestures on touch devices using a 10px movement threshold (touch movements less than 10px are treated as taps, movements of 10px or more initiate drag operations)
- **FR-016**: System MUST subscribe to entity state change events to detect queue modifications from external sources (other clients, automations) and update the display reactively
- **FR-017**: System MUST display a loading indicator (e.g., spinner) during initial data load when queue_tracks attribute is not yet available
- **FR-018**: System MUST provide visual feedback during async operations (drag-and-drop, tap-to-play) indicating the operation is in progress (e.g., disabled state, spinner, or visual indicator)
- **FR-019**: System MUST provide a retry button or action when errors occur, allowing users to re-fetch queue data without refreshing the entire page

### Key Entities

- **Queue Track** (singular): Represents a single track in the playback queue with position (1-based), URI, and metadata (title, artist, album, duration). Individual track objects within the `queue_tracks` attribute array.
- **queue_tracks** (attribute): The entity attribute (plural) that exposes the full track list as an array of queue track objects. Each track object contains: `position` (int, 1-based), `uri` (str), `title` (str|None), `artist` (str|None), `album` (str|None), `duration` (int|None in seconds). Tracks are ordered by position in the array (index 0 = position 1). Tracks can be reordered via drag-and-drop or played via tap interaction.
- **Custom Card**: A Lovelace custom card component that displays the queue track list and handles user interactions (drag, drop, tap). The card communicates with Mopidy services to perform queue operations.

## Success Criteria

**Validation**: Success criteria are validated via the comprehensive testing guide in `quickstart.md` (task T057). Performance criteria (SC-001, SC-002, SC-003, SC-007) are validated through dedicated performance testing tasks (T058-T059).

### Measurable Outcomes

- **SC-001**: Users can reorder any track in a queue of 20 tracks using drag-and-drop in under 3 seconds (from start of drag to queue update completion)
- **SC-002**: Users can start playing any queued track by tapping it, with playback beginning within 1 second of the tap
- **SC-003**: The custom card renders and displays a queue of 50 tracks within 2 seconds on a standard mobile device (iOS app or mobile browser)
- **SC-004**: Drag-and-drop operations succeed 95% of the time on first attempt (accounting for network errors, not user errors)
- **SC-005**: The custom card works identically on Home Assistant web interface and iOS app, with all interactions (drag, drop, tap) functioning correctly on both platforms
- **SC-006**: Users can successfully complete queue reordering tasks 90% of the time without requiring instructions or documentation (intuitive interface)
- **SC-007**: The card maintains responsive performance (60fps scrolling, instant tap response) with queues containing up to 100 tracks

## Assumptions

- The Mopidy integration provides services (`mopidy.move_track`, `mopidy.play_track_at_position`) and entity attributes (`queue_position`, `queue_size`, `queue_tracks`) that the custom card can use
- The `queue_tracks` entity attribute exposes the full track list as an array of track objects, each containing: `position` (int, 1-based), `uri` (str), `title` (str|None), `artist` (str|None), `album` (str|None), `duration` (int|None in seconds). The array is ordered by position (first track at index 0). The attribute updates automatically on the entity refresh cycle (this attribute will be implemented as part of this feature or a prerequisite feature)
- Home Assistant's custom card architecture supports drag-and-drop interactions and touch event handling
- The Home Assistant iOS app supports the same custom card framework as the web interface
- Users have a Mopidy server with tracks in the queue to manage
- Network connectivity between Home Assistant and Mopidy server is generally reliable (occasional errors are acceptable)

## Dependencies

- Requires Mopidy Enhanced Services feature (002-mopidy-enhanced-services) to be implemented, specifically the `mopidy.move_track` service
- Requires new `mopidy.play_track_at_position` service to be implemented (plays track at specific position without reordering queue)
- Requires new `queue_tracks` entity attribute to be implemented (exposes full track list with metadata as array of track objects)
- Requires Home Assistant custom card development framework (Lit, Polymer, or similar)

## Out of Scope

- Removing tracks from queue (focus is on reordering and playing, not removal)
- Filtering tracks by criteria (focus is on visual queue management, not filtering)
- Creating playlists from queue (focus is on queue management, not playlist operations)
- Queue history or analytics (focus is on current queue state, not historical data)
- Multi-queue management (focus is on single entity queue management)
- Offline queue management (requires active connection to Mopidy server)
