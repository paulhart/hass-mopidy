# Implementation Plan: Mopidy Enhanced Services

**Branch**: `002-mopidy-enhanced-services` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-mopidy-enhanced-services/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement four high-priority Mopidy API capabilities to enhance queue management, playback history, playlist lifecycle, and track metadata lookup. This adds 12 new services (3 query services with response data, 9 action services) and one new entity attribute (`media_history`). All services follow existing Home Assistant patterns, use standard Mopidy HTTP API methods, and maintain backward compatibility while ensuring Python 3.13.9+ compatibility.

## Technical Context

**Language/Version**: Python 3.13.9+ (explicit requirement from spec; Home Assistant runtime typically supports Python 3.9+, but this feature requires 3.13.9+ for specific language features)  
**Primary Dependencies**: 
- `mopidyapi>=1.1.0` (Mopidy API client - existing)
- `spotifyaio==0.9.0` (Spotify integration - existing)
- Home Assistant core libraries (homeassistant.*)
- `voluptuous` (validation schemas - existing)
- `requests` (via mopidyapi dependency - existing)
- `collections.OrderedDict` (standard library - for history tracking if needed)

**Storage**: In-memory data structures:
- Playback history: Maintained by Mopidy server (backend-dependent persistence)
- Entity attribute `media_history`: Cached in entity state (last 20 tracks)
- No persistent storage required in Home Assistant

**Testing**: Manual smoke testing per quickstart.md - no automated test infrastructure currently exists in codebase  
**Target Platform**: Home Assistant (runs on any platform where HA is deployed: Linux, Docker, etc.)  
**Project Type**: Single project (Home Assistant custom component)  
**Performance Goals**: 
- All new services respond within 1 second (per spec SC-006)
- Queue operations (move, remove, filter) complete in under 2 seconds for 20 tracks (per spec SC-001)
- History retrieval completes in under 1 second for up to 100 tracks (per spec SC-003)
- Playlist creation completes in under 3 seconds for 50 tracks (per spec SC-004)
- Track lookup completes in under 500ms (per spec SC-005)
- 95% success rate when Mopidy server is available (per spec SC-007)

**Constraints**: 
- Must not block Home Assistant event loop (all blocking operations via `async_add_executor_job()`)
- Must handle Mopidy server unavailability gracefully with clear error messages
- Must maintain backward compatibility with existing installations
- Must be compatible with Python 3.13.9+ (explicit requirement)
- Must handle backend feature availability gracefully (not all Mopidy backends support all features)
- Queue positions displayed as 1-based to users but handled internally as 0-based

**Scale/Scope**: 
- Single integration component (`custom_components/mopidy/`)
- Supports multiple Mopidy server instances
- ~1,200 lines of Python code across 5 main files (existing)
- 12 new services + 1 entity attribute
- No database or external services beyond Mopidy servers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **I. Home Assistant Integration Standards**: This feature adds new services following existing HA service patterns (`async_register_entity_service`, `SupportsResponse.ONLY` for query services). No changes to config flow or entity platform structure - COMPLIANT
- [x] **II. Error Handling Discipline**: All new services will handle errors with specific exceptions (`reConnectionError`, `ValueError`, etc.). No bare `except:` clauses will be introduced - COMPLIANT
- [x] **III. Async/Sync Boundary Management**: All Mopidy API calls will be wrapped in `async_add_executor_job()` as per existing patterns. No blocking operations in async code paths - COMPLIANT
- [x] **IV. Resource Management**: History data will be bounded (default 20 tracks in entity attribute). No new unbounded caches introduced - COMPLIANT
- [x] **V. Type Safety**: All new service methods and helper functions will have complete type hints. No magic numbers will be introduced - COMPLIANT
- [x] **VI. Technical Debt**: No new TODOs/FIXMEs will be introduced. All new code will follow existing patterns - COMPLIANT
- [x] **VII. Release Management**: Version will be bumped in `manifest.json` and changelog updated before merge to `main` - COMPLIANT

**Violations**: None - all new code aligns with constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/002-mopidy-enhanced-services/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
custom_components/mopidy/
├── __init__.py          # Component setup (no changes)
├── config_flow.py       # Config flow (no changes)
├── const.py             # Constants (no changes)
├── media_player.py      # Media player entity (add new services, entity attribute)
├── speaker.py           # Mopidy API wrapper (add new methods for queue/history/playlist/track operations)
├── services.yaml        # Service definitions (add 12 new services)
└── translations/        # i18n files (no changes)

mopidy-CHANGELOG.md      # Release changelog (must be updated)
```

**Structure Decision**: Existing Home Assistant custom component structure maintained. All new functionality extends existing files:
- `media_player.py`: New service methods and `media_history` entity attribute
- `speaker.py`: New Mopidy API wrapper methods
- `services.yaml`: New service definitions with schemas
- No new files required

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all changes align with constitution principles.

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete

All technical decisions documented in `research.md`. Key decisions:
- Python 3.13.9+ compatibility verified (no breaking changes)
- Mopidy API method signatures confirmed
- Position conversion strategy (1-based UI, 0-based API)
- Filter criteria implementation (dict-based, AND logic)
- History data structure (URI, artist, album, track_name, timestamp)
- Service response patterns (query vs action services)
- Error handling for unsupported backend features

**Research Document**: [research.md](./research.md)

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Data Model
- Playback History Entry structure defined
- Filter Criteria structure defined
- Track Metadata (lookup result) structure defined
- Queue and Playlist operations extended

**Data Model Document**: [data-model.md](./data-model.md)

### Service Contracts
- 12 new services documented with parameters, return values, error cases
- Response formats specified for query services
- Error handling patterns defined

**Contracts Document**: [contracts/README.md](./contracts/README.md)

### Validation Guide
- Comprehensive quickstart guide with test scenarios
- Success criteria validation steps
- Troubleshooting guide

**Quickstart Document**: [quickstart.md](./quickstart.md)

## Phase 2: Implementation Planning

**Status**: Ready for `/speckit.tasks`

All design artifacts complete. Ready to generate task breakdown for implementation.
