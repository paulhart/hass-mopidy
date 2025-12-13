# Mopidy Queue Card

A custom Lovelace card for Home Assistant that provides an interactive queue management interface for Mopidy music servers. Features drag-and-drop reordering and tap-to-play functionality.

## Features

- **Interactive Queue Display**: View all tracks in the queue with metadata (title, artist, album, position)
- **Drag-and-Drop Reordering**: Reorder tracks by dragging and dropping them
- **Tap-to-Play**: Tap any track to start playing it immediately without reordering
- **Cross-Platform**: Works identically in Home Assistant web interface and iOS app
- **Reactive Updates**: Automatically updates when queue changes from other sources

## Installation

### HACS (Recommended)

1. Install [HACS](https://hacs.xyz) if you haven't already
2. Go to HACS → Dashboard
3. Click the three dots menu (⋮) → Custom repositories
4. Add this repository URL
5. Select category: "Dashboard"
6. Click "ADD"
7. Search for "Mopidy Queue Card" and install
8. Refresh your browser

### Manual Installation

1. Copy `mopidy-queue-card.js` to your Home Assistant `www/community/mopidy/` directory
2. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/community/mopidy/mopidy-queue-card.js
    type: module
```

3. Refresh your browser

## Usage

Add the card to your Lovelace dashboard:

```yaml
type: custom:mopidy-queue-card
entity: media_player.mopidy_living_room
title: Queue
```

### Configuration Options

- `entity` (required): The Mopidy media player entity ID
- `title` (optional): Card title to display
- `show_artwork` (optional): Show track artwork if available (default: false)
- `max_height` (optional): Maximum height for scrollable list (default: "400px")

### Example

```yaml
type: custom:mopidy-queue-card
entity: media_player.mopidy_living_room
title: Music Queue
show_artwork: true
max_height: 600px
```

## Requirements

- Home Assistant 2023.1.0 or later
- Mopidy integration with Enhanced Services feature (002-mopidy-enhanced-services)
- Mopidy entity with `queue_tracks` attribute and `play_track_at_position` service

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/paulhart/hass-mopidy).

