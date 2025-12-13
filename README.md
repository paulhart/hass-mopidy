# Home Assitant integrations

Additional integrations for [Home Assistant](https://www.home-assistant.io/)

![badge_mastodon]

## Mopidy

![badge_version] ![badge_issues] ![badge_hacs_pipeline]

This repository contains two components for [Mopidy Music Servers](https://mopidy.com/):

1. **Mopidy Integration** - Backend integration for connecting to Mopidy servers
2. **Mopidy Queue Card** - Custom Lovelace card for interactive queue management

Both components can be installed from this repository via HACS or manually.

### Installation

Please look at the [Mopidy installation & configuration instructions](https://docs.mopidy.com/en/latest/installation/) to set up a Mopidy Server.

#### HACS

**Installing the Integration:**

1. Install [HACS](https://hacs.xyz) if you haven't already
2. Go to HACS → Integrations
3. Click on the 3 dots in the top right corner
4. Select "Custom repositories"
5. Add the URL to this repository
6. Select category: **Integration**
7. Click "ADD"
8. Search for "Mopidy" and install
9. Go to Home Assistant settings → Integrations and add Mopidy
10. Restart Home Assistant

**Installing the Custom Queue Card (Optional):**

**⚠️ HACS Limitation:**

HACS doesn't support repositories containing both Integration and Dashboard components. The custom queue card must be installed manually (see instructions below).

#### Manual

1. Clone this repository
2. Copy `custom_components/mopidy` to your Home Assistant instance on `<config dir>/custom_components/`

### Setup

#### zeroconf

Your Mopidy Servers can be detected and added to Home Assistant through zeroconf.

#### GUI

1. Go to the *Integrations* page and click **+ ADD INTEGRATION**
1. Select *Mopidy* in the list of integrations
1. Fill out the requested information. Make sure to enter your correct FQDN or IP address. Using `localhost`, `127.0.0.1`, `::1` or any other loopback address will disable Mopidy-Local artwork.
1. Click Submit.

Repeat the above steps to add more Mopidy Server instances.

#### Manual Configuration

1. add a media player to your home assistant configuration (`<config dir>/configuration.yaml`):

```yaml
media_player:
- name: <mopidy identifier>
  host: <FQDN or IP address>
  port: <port if different from 6680>
  platform: mopidy
```

2. Restart your Home assistant to make changes take effect.

### Configuration

```yaml
- name: <mopidy name>      # The name of your Mopidy server.
  host: <fqdn/ip address>  # The FQDN or IP address of your Mopidy Server, do not use ::1, localhost or 127.0.0.1
  port: <port number>      # The port number of the Mopidy Server, default: 6680
  platform: mopidy         # specify mopidy platform
```

### Services

#### Service mopidy.get_search_result

*This service was originally developed by [Daniele Ricci](https://github.com/daniele-athome)*

Search media based on keywords and return them for use in a script or automation.

**Note:** One of the keyword fields **must** be used: `keyword`, `keyword_album`, `keyword_artist`, `keyword_genre` or `keyword_track_name`

|Service data attribute|Optional|Description|Example|
|-|-|-|-|
|`entity_id`|no|String or list of `entity_id`s to search and return the result to.| |
|`exact`|yes|String. Should the search be an exact match|false|
|`keyword`|yes|String. The keywords to search for. Will search all track fields.|Everlong|
|`keyword_album`|yes|String. The keywords to search for in album titles.|From Mars to Sirius|
|`keyword_artist`|yes|String. The keywords to search for in artists.|Queens of the Stoneage|
|`keyword_genre`|yes|String. The keywords to search for in genres.|rock|
|`keyword_track_name`|yes|String. The keywords to search for in track names.|Lazarus|
|`source`|yes|String. URI sources to search. `local`, `spotify` and `tunein` are the only supported options. Make sure to have these extensions enabled on your Mopidy Server! Separate multiple sources with a comma (,).|local,spotify|

##### Example

The service is to be used as a normal service returning some data into a variable. The result is actually a dictionary
with keys corresponding to the media player entities used as targets in the service call. Every item has in turn a
`result` attribute containing the list of actual media IDs matching the search parameters.

```yaml
script:
  search_and_play_music:
    fields:
      [...]
    sequence:
      - action: mopidy.get_search_result
        data:
          keyword_artist: "Some music artist"
          keyword_track_name: "Some song title"
          source: local
        target:
          entity_id: "media_player.music"
        response_variable: music_tracks # result will be returned into this variable
      - if: "{{ music_tracks['media_player.music'].result|length > 0 }}"
        then:
          - action: media_player.play_media
            data:
              media_content_id: "{{ music_tracks['media_player.music'].result[0] }}"
              media_content_type: music
            target:
              entity_id: "media_player.music"
```

#### Service media_player.play_media

The `media_content_id` needs to be formatted according to the Mopidy URI scheme. These can be easily found using the *Developer tools*.

When using the `play_media` service, the Mopidy Media Player platform will attempt to discover your URL when not properly formatted.
Currently supported for:

- Youtube

#### Service mopidy.restore

Restore a previously taken snapshot of one or more Mopidy Servers

The playing queue is snapshotted

|Service data attribute|Optional|Description|
|-|-|-|
|`entity_id`|no|String or list of `entity_id`s that should have their snapshot restored.|

#### Service mopidy.search

Search media based on keywords and add them to the queue. This service does not replace the queue, nor does it start playing the queue. This can be achieved through the use of [media\_player.clear\_playlist](https://www.home-assistant.io/integrations/media_player/) and [media\_player.media\_play](https://www.home-assistant.io/integrations/media_player/)

**Note:** One of the keyword fields **must** be used: `keyword`, `keyword_album`, `keyword_artist`, `keyword_genre` or `keyword_track_name`

|Service data attribute|Optional|Description|Example|
|-|-|-|-|
|`entity_id`|no|String or list of `entity_id`s to search and return the result to.| |
|`exact`|yes|String. Should the search be an exact match|false|
|`keyword`|yes|String. The keywords to search for. Will search all track fields.|Everlong|
|`keyword_album`|yes|String. The keywords to search for in album titles.|From Mars to Sirius|
|`keyword_artist`|yes|String. The keywords to search for in artists.|Queens of the Stoneage|
|`keyword_genre`|yes|String. The keywords to search for in genres.|rock|
|`keyword_track_name`|yes|String. The keywords to search for in track names.|Lazarus|
|`source`|yes|String. URI sources to search. `local`, `spotify` and `tunein` are the only supported options. Make sure to have these extensions enabled on your Mopidy Server! Separate multiple sources with a comma (,).|local,spotify|

#### Service mopidy.set_consume_mode

Set the mopidy consume mode for the specified entity

|Service data attribute|Optional|Description|
|-|-|-|
|`entity_id`|no|String or list of `entity_id`s to set the consume mode of.|
|`consume_mode`|no|`True` to enable consume mode, `False` to disable |

#### Service mopidy.snapshot

Take a snapshot of what is currently playing on one or more Mopidy Servers. This service, and the following one, are useful if you want to play a doorbell or notification sound and resume playback afterwards.

**Warning:** *This service is controlled by the platform, this is not a built-in function of Mopidy Server! Restarting Home Assistant will cause the snapshot to be lost.*

|Service data attribute|Optional|Description|
|-|-|-|
|`entity_id`|no|String or list of `entity_id`s ito take a snapshot of.|

### Notes

Due to the nature of the way Mopidy provides thumbnails of the media,
proxying them through Home Assistant is very resource intensive,
causing delays. Therefore, I have decided to not proxy the art when
using the Media Library for the time being.

### Custom Queue Card

A custom Lovelace card (`mopidy-queue-card`) provides an interactive queue management interface with drag-and-drop reordering and tap-to-play functionality. The card works identically in Home Assistant web interface and iOS app.

#### Features

- **Interactive Queue Display**: View all tracks in the queue with metadata (title, artist, album, position, duration)
- **Drag-and-Drop Reordering**: Reorder tracks by dragging and dropping them
- **Tap-to-Play**: Tap any track to start playing it immediately without reordering
- **Visual Feedback**: Currently playing track is highlighted, with loading and error states
- **Cross-Platform**: Works identically in Home Assistant web interface and iOS app
- **Reactive Updates**: Automatically updates when queue changes from other sources

#### Installation

**⚠️ HACS Limitation:**

HACS doesn't support repositories containing both Integration and Dashboard components. The custom queue card must be installed manually (see instructions below).

**Manual Installation**:

1. Copy `www/community/mopidy/mopidy-queue-card.js` to your Home Assistant `www/community/mopidy/` directory
2. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/community/mopidy/mopidy-queue-card.js
    type: module
```

3. Refresh your browser

#### Usage

Add the card to your Lovelace dashboard:

```yaml
type: custom:mopidy-queue-card
entity: media_player.mopidy_living_room
title: Queue
```

**Configuration Options**:

- `entity` (required): The Mopidy media player entity ID
- `title` (optional): Card title to display
- `show_artwork` (optional): Show track artwork if available (default: false)
- `max_height` (optional): Maximum height for scrollable list (default: "400px")

**Example**:

```yaml
type: custom:mopidy-queue-card
entity: media_player.mopidy_living_room
title: Music Queue
show_artwork: true
max_height: 600px
```

#### Requirements

- Home Assistant 2023.1.0 or later
- Mopidy integration with Enhanced Services feature (version 2.5.0+)
- Mopidy entity with `queue_tracks` attribute and `play_track_at_position` service (version 2.7.0+)

---

### UI Templates

UI templates for enhanced queue management, playback history, and playlist management are available in the `docs/ui-templates/` directory.

#### Available Templates

- **Queue Management** (`queue-management.yaml`): Reorder, remove, and filter tracks in the playback queue
- **Playback History** (`playback-history.yaml`): View recently played tracks and replay them
- **Playlist Management** (`playlist-management.yaml`): Create, save, and delete playlists
- **Enhanced Media Player** (`media-player-enhanced.yaml`): Media player card with quick access to queue and history

#### Setup Instructions

1. **Configure Helper Entities**: Copy helper entity definitions from `docs/ui-templates/helpers.yaml` to your Home Assistant `configuration.yaml` or add them via the UI (Settings -> Devices & Services -> Helpers)

2. **Copy Templates to Dashboard**: 
   - Open your Home Assistant dashboard in edit mode
   - Add a new card and select "Manual" or "YAML" mode
   - Copy the contents of a template file (e.g., `queue-management.yaml`)
   - Replace `media_player.mopidy_entity` with your actual Mopidy entity ID
   - Save the dashboard

3. **Create Dashboard Views** (Optional): For navigation from the enhanced media player card, create separate views:
   - Create a view named "Queue Management" and add the queue-management.yaml template
   - Create a view named "Playback History" and add the playback-history.yaml template

#### Template Customization

All templates use standard Lovelace cards and can be customized:
- Modify colors, fonts, and spacing by editing the inline styles
- Adjust responsive layout by changing grid columns or vertical-stack configuration
- Add or remove features by editing the card structure

#### Troubleshooting

**Templates not loading:**
- Check YAML syntax (use a YAML validator)
- Verify entity IDs are correct (replace `media_player.mopidy_entity` with your entity)
- Check Home Assistant logs for template errors

**Service calls not working:**
- Verify the Mopidy integration (002-mopidy-enhanced-services) is installed and up to date
- Check that helper entities are configured correctly
- Verify entity state is not "unavailable"

**Helper entities not found:**
- Ensure helper entities are added to `configuration.yaml` or created via UI
- Restart Home Assistant after adding helpers
- Verify helper entity IDs match those used in templates

For more details, see the comments in each template file.

## Testers

- [Jan Gutowski](https://github.com/Switch123456789)

[badge_version]: https://img.shields.io/github/v/tag/bushvin/hass-integrations?label=Version&style=flat-square&color=2577a1
[badge_issues]: https://img.shields.io/github/issues/bushvin/hass-integrations?style=flat-square
[badge_mastodon]: https://img.shields.io/mastodon/follow/1084764?domain=https%3A%2F%2Fmastodon.social&logo=mastodon&logoColor=white&style=flat-square&label=%40bushvin%40mastodon.social
[badge_hacs_pipeline]: https://img.shields.io/github/actions/workflow/status/bushvin/hass-integrations/validate.yml?label=HACS%20build%20validation&style=flat-square
