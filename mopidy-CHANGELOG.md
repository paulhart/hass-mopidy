# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2025-12-11

### Added

- Add UI templates for enhanced queue management, playback history, and playlist management
- Add queue management template (`docs/ui-templates/queue-management.yaml`) with reorder, remove, and filter track operations
- Add playback history template (`docs/ui-templates/playback-history.yaml`) with track replay functionality
- Add playlist management template (`docs/ui-templates/playlist-management.yaml`) with create, save, and delete operations
- Add enhanced media player card template (`docs/ui-templates/media-player-enhanced.yaml`) with quick access to queue and history
- Add helper entities configuration example (`docs/ui-templates/helpers.yaml`) for user input in templates
- Add comprehensive UI template documentation in README.md with setup instructions and troubleshooting

## [2.5.0] - 2025-12-11

### Added

- Add `mopidy.move_track` service to reorder tracks in the queue by moving from one position to another
- Add `mopidy.remove_track` service to remove one or more tracks from the queue by position(s)
- Add `mopidy.filter_tracks` service to remove tracks from the queue matching specified criteria (artist, album, genre, track_name) with AND logic
- Add `mopidy.get_history` service to retrieve recently played tracks with metadata (URI, artist, album, track_name, timestamp)
- Add `mopidy.play_from_history` service to play a track from playback history by index
- Add `media_history` entity attribute containing the last 20 played tracks with metadata
- Add `mopidy.create_playlist` service to create a new playlist from the current queue (overwrites existing playlist with same name)
- Add `mopidy.delete_playlist` service to delete a playlist from the Mopidy server
- Add `mopidy.save_playlist` service to save the current queue to an existing playlist
- Add `mopidy.refresh_playlists` service to refresh the playlist list from the backend
- Add `mopidy.lookup_track` service to get detailed track metadata for a track URI
- Add `mopidy.find_exact` service to find tracks matching exact criteria (case-insensitive full string match)

## [2.4.2] - 2025-12-11

### Fixed

- Fix bare `except:` clause in config flow with specific exception handling
- Replace blocking `time.sleep()` with `asyncio.sleep()` in snapshot restore to prevent UI freezes
- Add error context (hostname, port, operation) to all connection error logs for better diagnostics
- Implement bounded LRU caches for artwork and titles to prevent unbounded memory growth
- Remove duplicate `urllib.parse` import in media_player.py
- Extract magic numbers to named constants (retry counts, volume steps, cache sizes)
- Add comprehensive type hints to all public methods and class attributes
- Document legacy `async_setup_platform` function for YAML configuration support

## [2.4.1] - 2024-11-12

### Fixed

- fix deprecation of `hass.config_entries.async_forward_entry_setup` in favour of `hass.config_entries.async_forward_entry_setups`

## [2.4.0] - 2024-10-04

## Added

- `get_search_result` service to look for tracks and return the result

## [2.3.5] - 2024-05-29

### Fixed

- fix issue with async method called from a non async method and HA complaining about it

## [2.3.4] - 2024-01-26

### Fixed

- glitch causing the card to go grey when buttons are pushed

## [2.3.3] - 2024-01-19

### Fixed

- state info should be read, not written

## [2.3.2] - 2024-01-13

### Fixed

- replace unoverrideable `_attr_*` properties

## [2.3.1] - 2024-01-12

### Fixed

- wrong value for `is_stream`

## [2.3.0] - 2024-01-11

### Changed

- don't complain when there is no `image_url` and a stream is playing.

## [2.2.2] - 2024-01-06

Happy New Year!

### Changed

- bumped `mopidyapi` version requirement to 1.1.0

### Fixed

- default `media_player` properties changed to `cached_property` types

## [2.2.1] - 2023-11-13

### Fixed

- expanding the url will add a timestamp based on the day instead of epoch, causing it to reload daily instead of every time the image is refreshed (which is every 10 seconds)
- correct snapshotting variables/methods
- alphabetize `extra_state_attributes` variables
- retrieve the correct current track information
- fix queue variables for `media_play`

## [2.2.0] - 2023-11-11

### Changed

- Improved support queue information
- Improved support for tracks playing in playlists
- Overall improvement of the event code

## [2.1.3] - 2023-11-08

### Fixed

- Fix error on startup when using yaml configuration (by [Daniele Ricci](https://github.com/daniele-athome))

## [2.1.2] - 2023-11-07

### Fixed

- make features a fixed set

## [2.1.1] - 2023-11-06

### Fixed

- detection of youtube urls and conversion to extension compatible uris did not work

## [2.1.0] - 2023-11-06

### Changed

- update `media_player` information on websocket event

## [2.0.4] - 2023-11-06

### Fixed

- fix `media_player.play_media` service `enqueue.add` behaviour

## [2.0.3] - 2023-11-05

### Fixed

- fix `media_player.play_media` service `enqueue.play` behaviour

## [2.0.2] - 2023-11-02

### Fixed

- wrong varname for youtube (#40)

## [2.0.1] - 2023-10-31

### Changed

- Better handling of youtube URLs based on available extensions
- Complete the media URL with hostname and timestamps if not available

## [2.0.0] - 2023-10-31

This version incorporates a refactor of the integration to include numerous new
Home Assistant `media_player` features. I did not keep track of all features updated, but these incorporate the major ones

### Added

- Support for `media_player.play_media` `enqueue` feature
- `mopid.set_consume_mode` service
- `consume_mode` entity attribute for the current consume_mode
- `mopidy_extension` entity attribute for currently used extension
- `queue_position` entity attribute for the index of the currently playing track in the queue
- `queu_size` entity attribute for the number of tracks in the currently playing queue
- `snapshot_taken_at` entity attribute to show when the snapshot was taken (if any)

### Fixed

- Wrong volume level on snapshot restore

### Removed

- Support for ON/OFF, as these refer to a physical ON/OFF switch.

## [1.4.8] - 2023-05-31

### Changed

- Modified the way playlists are handled in the play queue

### Fixed

- FIX Issue #26: Tidal playlists not expanding correctly

## [1.4.7] - 2022-09-24

### Fixed

- BUGFIX: playing mopidy-local "directory" resources (eg `artists/albums`) failed as the resource is not considered
  a media source according to URI\_SCHEME\_REGEX
- typo in the README.md

### Added

- support for mopidyapi>=1.0.0, no need to stay in the stoneage

## [1.4.6] - 2022-03-06

### Fixed

- playing from local media (thanks, [koying](https://github.com/koying))

## [1.4.5] - 2022-03-05

### Added

- Support for media browsing and playing from other components in HA (thanks, [koying](https://github.com/koying))

## [1.4.4] - 2022-02-19

### Fixed

- change of code for 2022.6 warning introduced issue where an int was added to a string.

## [1.4.3] - 2022-01-07

### Fixed

- git version tag added before last PR

## [1.4.2] - 2022-01-03

- mopidy play instruction is slow on streming media. now waiting for status to change into `playing` asynchronously
- update code to comply with 2022.6 deprecation (thanks, [VDRainer](https://github.com/VDRainer))

## [1.4.1] - 2021-05-23

### Changed

- bugfix: snapshot and restore player state (thanks [AdmiralStipe](https://community.home-assistant.io/u/AdmiralStipe))
- better messages when device detected through zeroconf is not a mopidy server
- formatting (pylint, pep8, pydocstyle)
- fix zeroconf issues on docker (thanks, [@guix77](https://github.com/guix77))
- set name to zeroconf name and port

## [1.4.0] - 2021-04-05

### Changed

- fixed issue with logging on detected non-mopidy zeroconf http devices
- added service `search`
- change service targetting
- sort the sourcelist
- modifications to pass tests to add to core

## [1.3.2] - 2021-03-14

### Changed

- refactored media library routines
- provide home assistant logger to MopidyAPI

## [1.3.1] - 2021-03-13

### Changed

- fixed issue with snapshot/restore track index

## [1.3.0] - 2021-03-12

### Added

- snapshot service
- restore service
- dutch translation
- french translation

### Changed

- fixed typo in english translation

## [1.2.0] - 2021-03-08

### Added

- Support for zeroconf discovery

## [1.1.4] - 2021-03-06

### Changed

- Handle connection errors in a better way

## [1.1.3] - 2021-03-06

### Changed

- uids based on hostname and port number instead of hostname only, thenks @Burningstone91
