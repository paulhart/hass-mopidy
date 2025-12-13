# Mopidy Queue Card

A custom Lovelace card for Home Assistant that provides an interactive queue management interface for Mopidy music servers. Features drag-and-drop reordering and tap-to-play functionality.

## Features

- **Interactive Queue Display**: View all tracks in the queue with metadata (title, artist, album, position)
- **Drag-and-Drop Reordering**: Reorder tracks by dragging and dropping them
- **Tap-to-Play**: Tap any track to start playing it immediately without reordering
- **Cross-Platform**: Works identically in Home Assistant web interface and iOS app
- **Reactive Updates**: Automatically updates when queue changes from other sources

## Installation

### ⚠️ HACS Limitation

**Note:** This repository contains both an Integration and a Dashboard card. HACS doesn't support repositories with multiple component types, so the card must be installed manually.

### Manual Installation (Required)

1. Clone this repository or download the `mopidy-queue-card.js` file from `www/community/mopidy/`
2. Copy `mopidy-queue-card.js` to your Home Assistant `www/community/mopidy/` directory (create the directory if it doesn't exist)
3. Add the resource to your Lovelace dashboard using one of these methods:

**Method 1: Via UI (Recommended)**
- Go to Settings → Dashboards
- Click the three dots menu (⋮) next to your dashboard
- Select "Dashboard resources"
- Click "+ ADD RESOURCE"
- Enter: `/local/community/mopidy/mopidy-queue-card.js`
- Select type: "JavaScript Module"
- Click "CREATE"
- Refresh your browser

**Method 2: Via Dashboard YAML**
- Edit your dashboard in YAML mode
- Add the `resources:` key at the **top level** of the dashboard (not inside a section):

```yaml
title: My Dashboard
views:
  - title: Home
    path: home
    cards:
      # ... your cards here
resources:
  - url: /local/community/mopidy/mopidy-queue-card.js
    type: module
```

**Important:** The `resources:` key must be at the dashboard level, not inside a section or view.

4. Refresh your browser

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

