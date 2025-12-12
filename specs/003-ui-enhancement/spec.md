# Feature Specification: Mopidy UI Enhancements

**Feature Branch**: `003-ui-enhancement`  
**Created**: 2025-12-11  
**Status**: Draft  
**Input**: User description: "enhance the UI so that the new functionality in this plugin is made available to users."

## Clarifications

### Session 2025-12-11

- Q: Should UI components be implemented as custom Lovelace cards, custom panels, hybrid approach, or template-based using existing cards? → A: Template-based using existing Lovelace cards (no custom frontend code)
- Q: How should the UI obtain the full queue track list with metadata? → A: Use existing entity attributes only (queue_position, queue_size, media_history)
- Q: How should users specify which track to move/remove when full track list isn't displayed? → A: Position input fields (users enter track positions as numbers)

## User Scenarios & Testing

### User Story 1 - Queue Management Interface (Priority: P1)

As a Home Assistant user, I want to visually manage my Mopidy playback queue through an intuitive interface so that I can reorder, remove, and filter tracks without using service calls or automations.

**Why this priority**: Queue management is the most frequently used new capability. Users need to interact with their queue multiple times per session. Currently, users must use Developer Tools service calls which require manual parameter entry and are not user-friendly. A visual interface would make queue management accessible to all users, not just those comfortable with service calls.

**Independent Test**: Can be fully tested by displaying a queue list for a Mopidy entity with tracks in the queue, allowing users to reorder tracks using up/down controls, remove tracks with a button click, and filter tracks using form controls, then verifying the queue state updates correctly after refresh.

**Acceptance Scenarios**:

1. **Given** a Mopidy entity with 5 tracks in the queue, **When** I view the queue management interface, **Then** I see queue information (current position, total size) and controls to manage the queue (reorder, remove, filter)
2. **Given** a queue management interface, **When** I enter position 3 in the "from" field and position 1 in the "to" field and click "Move Track", **Then** the track at position 3 moves to position 1 and other tracks shift accordingly, and the change is reflected in the Mopidy server after refresh
3. **Given** a queue management interface, **When** I enter position 2 in the "remove position" field and click "Remove Track", **Then** the track at position 2 is removed from the queue and the queue size updates
4. **Given** a queue management interface with tracks from multiple artists, **When** I enter an artist name in a filter field and click "Remove Matching", **Then** all tracks by that artist are removed from the queue and the list updates accordingly
5. **Given** a queue management interface, **When** I view the interface, **Then** I can see which track is currently playing (highlighted or marked with an indicator)
6. **Given** a queue management interface, **When** the queue is empty, **Then** I see a clear message indicating the queue is empty

---

### User Story 2 - Playback History Display (Priority: P1)

As a Home Assistant user, I want to view my recently played tracks in a visual list so that I can quickly identify and replay songs I enjoyed without searching or remembering track names.

**Why this priority**: History access is a common music application feature that users expect. The `media_history` attribute exists but is only accessible through templates or Developer Tools. A visual history interface makes this valuable data accessible to all users and enables quick replay workflows.

**Independent Test**: Can be fully tested by displaying a history list showing recently played tracks with metadata (title, artist, album, timestamp), allowing users to click a track to replay it, and verifying the selected track starts playing on the Mopidy server.

**Acceptance Scenarios**:

1. **Given** a Mopidy entity that has played 10 tracks, **When** I view the playback history interface, **Then** I see a list of the 10 most recently played tracks with their titles, artists, albums, and timestamps (most recent first)
2. **Given** a playback history interface showing multiple tracks, **When** I click on a track in the history list, **Then** that track starts playing on the Mopidy server
3. **Given** a playback history interface, **When** I view the interface, **Then** I can see artwork/thumbnails for tracks when available
4. **Given** a playback history interface, **When** no tracks have been played yet, **Then** I see a clear message indicating no history is available
5. **Given** a playback history interface with many tracks, **When** I view the interface, **Then** I can scroll through the history list to see older tracks
6. **Given** a playback history interface, **When** I view the interface, **Then** timestamps are displayed in a human-readable format (e.g., "2 hours ago", "Yesterday")

---

### User Story 3 - Playlist Management Interface (Priority: P2)

As a Home Assistant user, I want to manage my Mopidy playlists through a visual interface so that I can create, save, and delete playlists without using service calls.

**Why this priority**: Playlist management is less frequent than queue operations but still valuable for organizing music collections. While lower priority than queue and history interfaces, it completes the playlist lifecycle management workflow and makes the new playlist services accessible to all users.

**Independent Test**: Can be fully tested by displaying a list of available playlists, allowing users to create a new playlist from the current queue with a name input, save the current queue to an existing playlist, delete playlists with confirmation, and refresh the playlist list, then verifying all operations complete successfully.

**Acceptance Scenarios**:

1. **Given** a Mopidy entity with multiple playlists, **When** I view the playlist management interface, **Then** I see a list of all available playlists with their names
2. **Given** a playlist management interface and a queue with tracks, **When** I enter a playlist name and click "Create Playlist from Queue", **Then** a new playlist is created with that name containing the current queue tracks, and the playlist appears in the playlist list
3. **Given** a playlist management interface with an existing playlist, **When** I have tracks in the queue and select "Save Queue to Playlist" for that playlist, **Then** the playlist contents are replaced with the current queue and I receive confirmation
4. **Given** a playlist management interface, **When** I click a delete button next to a playlist, **Then** I am prompted to confirm deletion, and upon confirmation, the playlist is removed from the server
5. **Given** a playlist management interface, **When** I click "Refresh Playlists", **Then** the playlist list updates to reflect any changes made externally (e.g., via Mopidy web interface)
6. **Given** a playlist management interface, **When** I attempt to create a playlist with a name that already exists, **Then** the existing playlist is overwritten with the new queue contents (per existing service behavior)

---

### User Story 4 - Enhanced Media Player Card Integration (Priority: P2)

As a Home Assistant user, I want quick access to queue and history features directly from the media player card so that I don't need to navigate to separate interfaces for common operations.

**Why this priority**: While standalone interfaces are valuable, integrating key features into the existing media player card provides immediate access without navigation. This improves discoverability and reduces the number of clicks for common tasks. Lower priority than dedicated interfaces because it's an enhancement rather than a core capability.

**Independent Test**: Can be fully tested by viewing a Mopidy media player card that includes buttons or links to access queue management and history, clicking these controls to open the respective interfaces, and verifying the controls are clearly labeled and accessible.

**Acceptance Scenarios**:

1. **Given** a Mopidy media player card displayed on a dashboard, **When** I view the card, **Then** I see additional buttons or links for "Manage Queue" and "View History" alongside standard playback controls
2. **Given** a media player card with queue management access, **When** I click "Manage Queue", **Then** the queue management interface opens (either inline, in a modal, or navigates to a dedicated view)
3. **Given** a media player card with history access, **When** I click "View History", **Then** the playback history interface opens
4. **Given** a media player card, **When** I view the card, **Then** I can see the current queue size (number of tracks) displayed as part of the card information
5. **Given** a media player card, **When** the queue is empty, **Then** the "Manage Queue" control is still accessible but may be disabled or show an appropriate state

---

### Edge Cases

- What happens when a user tries to manage the queue while a track is currently playing? **Answer**: Queue operations should work normally; removing or moving the currently playing track follows standard Mopidy behavior (playback continues with next track)
- How does the interface handle a very long queue (100+ tracks)? **Answer**: Interface should display queue size and position information; position input fields should validate against current queue size to prevent invalid operations
- What happens when the Mopidy server becomes unavailable while viewing the interface? **Answer**: Interface should display an error message indicating server unavailability and disable interactive controls
- How does the interface handle rapid queue changes (e.g., consume mode removing tracks automatically)? **Answer**: Interface should provide a refresh mechanism to show current queue state; users can manually refresh or the interface can auto-refresh after operations
- What happens when a user tries to create a playlist with an empty queue? **Answer**: Interface should prevent the action and display a clear error message indicating the queue is empty
- How does the history interface handle tracks with missing metadata (no artist, album, etc.)? **Answer**: Interface should display available metadata and show placeholders (e.g., "Unknown Artist") for missing fields
- What happens when a user tries to play a track from history that no longer exists in the library? **Answer**: System should attempt to play the track; if it fails, display an appropriate error message
- How does the playlist interface handle playlist names with special characters? **Answer**: Interface should accept valid playlist names per Mopidy backend requirements and display appropriate validation errors for invalid names
- What happens when multiple users access the same Mopidy entity's queue simultaneously? **Answer**: Last write wins; interface should refresh to show current state after operations complete
- How does the interface handle very long track/artist/album names? **Answer**: Interface should truncate long text with ellipsis or use text wrapping, ensuring layout remains usable

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a visual queue management interface that displays queue information (position, size) and allows queue management operations using existing entity attributes (queue_position, queue_size) and service calls
- **FR-002**: System MUST allow users to reorder tracks in the queue by entering source and destination positions in input fields and executing the move operation via button click
- **FR-003**: System MUST allow users to remove individual tracks from the queue by entering the track position in an input field and executing the remove operation via button click
- **FR-004**: System MUST provide filter controls that allow users to remove tracks matching specified criteria (artist, album, genre, track name) with visual feedback
- **FR-005**: System MUST display which track is currently playing in the queue interface (visual indicator or highlighting)
- **FR-006**: System MUST provide a playback history interface that displays recently played tracks with metadata (title, artist, album, timestamp)
- **FR-007**: System MUST allow users to replay tracks from history by clicking on them in the history interface
- **FR-008**: System MUST display track artwork/thumbnails in history when available
- **FR-009**: System MUST format timestamps in history in a human-readable format (relative time, e.g., "2 hours ago")
- **FR-010**: System MUST provide a playlist management interface that displays all available playlists
- **FR-011**: System MUST allow users to create a new playlist from the current queue by entering a playlist name
- **FR-012**: System MUST allow users to save the current queue to an existing playlist with selection of the target playlist
- **FR-013**: System MUST allow users to delete playlists with a confirmation step to prevent accidental deletion
- **FR-014**: System MUST provide a refresh control to update the playlist list from the backend
- **FR-015**: System MUST integrate queue and history access into the standard media player card with clearly labeled controls
- **FR-016**: System MUST display current queue size (number of tracks) in the media player card
- **FR-017**: System MUST provide refresh mechanisms (manual refresh buttons) to update interface displays when queue or playlist state changes. Manual refresh is sufficient for template-based UI; automatic refresh on user action is optional.
- **FR-018**: System MUST handle error states gracefully with clear, user-friendly error messages when operations fail (e.g., server unavailable, empty queue, invalid input)
- **FR-019**: System MUST support scrolling for long lists (queues, history, playlists) to maintain performance. Scrolling is sufficient; pagination is not required.
- **FR-020**: System MUST work with all Mopidy entity instances (support multiple Mopidy servers). Templates inherently support multiple instances via entity_id parameter in service calls.
- **FR-021**: System MUST maintain responsive layout and usability across different screen sizes (desktop, tablet, mobile)
- **FR-022**: System MUST provide visual feedback (error messages, success messages, and optionally loading indicators) during operations to indicate system state. Error messages are required; success messages and loading indicators are recommended for better user experience.

### Key Entities

- **Queue Track**: Represents a track in the playback queue, referenced by position number (1-based) for management operations
- **History Entry**: Represents a previously played track, displayed with title, artist, album, artwork (when available), and timestamp
- **Playlist**: Represents a saved collection of tracks, displayed with name and available actions (play, edit, delete)
- **UI Component**: Represents a reusable interface element (queue list, history list, playlist list) built using existing Lovelace cards and templates, embedded in dashboards

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can reorder tracks in a 20-track queue in under 10 seconds using the visual interface (compared to 30+ seconds using service calls)
- **SC-002**: Users can remove unwanted tracks from a queue in under 5 seconds per track using the interface (compared to 15+ seconds using service calls)
- **SC-003**: Users can view and replay a track from history in under 3 seconds (compared to 20+ seconds using Developer Tools service calls)
- **SC-004**: Users can create a playlist from the current queue in under 15 seconds using the interface (compared to 30+ seconds using service calls)
- **SC-005**: 90% of users successfully complete queue management tasks (reorder, remove, filter) on first attempt without consulting documentation
- **SC-006**: Interface refresh mechanisms update queue state display within 2 seconds of user-initiated refresh after operation completion
- **SC-007**: Interface remains responsive (no noticeable lag) when displaying queues with up to 100 tracks
- **SC-008**: Interface handles error states gracefully with 100% of errors displaying user-friendly messages (no technical error codes visible to end users)
- **SC-009**: Interface works correctly on mobile devices (screen width 320px+) with all controls accessible and readable
- **SC-010**: 80% of users prefer the visual interface over service calls for queue and history management tasks (user satisfaction metric)

## Assumptions

- Users have Home Assistant dashboards configured and are familiar with adding cards to dashboards
- The Mopidy integration is already set up and entities are available
- Users expect interfaces to work within Home Assistant's existing UI framework (Lovelace) using template-based approaches with existing card types (no custom JavaScript/TypeScript frontend code)
- Track metadata (title, artist, album) is available from Mopidy for display purposes
- Artwork/thumbnails may not be available for all tracks; interface should handle missing artwork gracefully
- Multiple users may access the same Mopidy entity; last write wins for queue modifications
- Users understand basic queue concepts (position, current track, etc.) from music application experience
- Interface will be used primarily on desktop/tablet devices but should remain functional on mobile

## Dependencies

- Requires the Mopidy Enhanced Services feature (002-mopidy-enhanced-services) to be implemented and available
- Depends on Home Assistant's Lovelace dashboard system for card/panel integration
- Requires access to entity attributes: `queue_position`, `queue_size`, `media_history`
- Requires access to services: `mopidy.move_track`, `mopidy.remove_track`, `mopidy.filter_tracks`, `mopidy.get_history`, `mopidy.play_from_history`, `mopidy.create_playlist`, `mopidy.save_playlist`, `mopidy.delete_playlist`, `mopidy.refresh_playlists`

## Out of Scope

- Custom audio visualization or waveform displays
- Advanced queue analytics or statistics
- Social features (sharing playlists, collaborative queues)
- Offline queue management (requires server connection)
- Integration with external music services beyond Mopidy
- Custom themes or extensive UI customization options
- Voice control integration
- Mobile app development (focus on web interface within Home Assistant)
