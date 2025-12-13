# Implementation Plan: Custom Queue Management Card

**Branch**: `004-custom-queue-card` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-custom-queue-card/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace the current template-based queue management cards with a single custom Lovelace card that provides drag-and-drop reordering and tap-to-play functionality. The custom card will work identically in Home Assistant web interface and iOS app, displaying the full queue track list with metadata and supporting interactive queue management through visual drag-and-drop and tap interactions. This requires implementing a custom frontend component (JavaScript/TypeScript) using Home Assistant's custom card framework, along with two new backend services (`mopidy.play_track_at_position` and `queue_tracks` entity attribute) to support the card's functionality.

## Technical Context

**Language/Version**: 
- Backend: Python 3.13.9+ (for new services and entity attribute)
- Frontend: TypeScript compiled to JavaScript (for custom Lovelace card)
- Card Framework: Lit (v2+) with TypeScript

**Primary Dependencies**: 
- Backend: `mopidyapi>=1.1.0`, Home Assistant core libraries, `voluptuous` (existing)
- Frontend: Lit (v2+), SortableJS (drag-and-drop), Home Assistant custom card base classes, TypeScript compiler
- iOS App: Same as frontend (iOS app uses same frontend framework)

**Storage**: N/A (card reads from entity attributes, no persistent storage)

**Testing**: 
- Backend: Manual testing with Mopidy server instances (per quickstart.md validation)
- Frontend: Browser testing (Chrome, Firefox, Safari), iOS app testing, manual drag-and-drop and tap-to-play validation

**Target Platform**: 
- Home Assistant web interface (browser-based, desktop/tablet/mobile)
- Home Assistant iOS app (native iOS app with custom card support)

**Project Type**: Hybrid (backend Python services + frontend custom card)

**Performance Goals**: 
- Drag-and-drop operations complete within 3 seconds for 20 tracks (SC-001)
- Tap-to-play operations complete within 1 second (SC-002)
- Card renders 50 tracks within 2 seconds on mobile (SC-003)
- 95% success rate for drag-and-drop operations (SC-004)
- 60fps scrolling, instant tap response for queues up to 100 tracks (SC-007)

**Constraints**: 
- Must work identically in web and iOS app (FR-009)
- Must support touch gestures (drag, tap) with 10px movement threshold (FR-015)
- Must subscribe to entity state change events for reactive updates (FR-016)
- Must handle queues up to 100 tracks with responsive performance (FR-014)
- Requires two new backend components: `mopidy.play_track_at_position` service and `queue_tracks` entity attribute

**Scale/Scope**: 
- Single custom Lovelace card component
- Two new backend services/attributes
- Supports single Mopidy entity per card instance
- Handles queues up to 100 tracks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **I. Home Assistant Integration Standards**: Backend services (`mopidy.play_track_at_position`) will follow HA service registration patterns. Custom card will follow HA custom card development patterns (to be researched in Phase 0).
- [x] **II. Error Handling Discipline**: Backend services will handle errors with specific exceptions (`ValueError`, `reConnectionError`). Frontend card will handle service call errors and network failures gracefully.
- [x] **III. Async/Sync Boundary Management**: Backend services will use `async_add_executor_job()` for blocking Mopidy API calls. Frontend card will use async service calls via HA's service API.
- [x] **IV. Resource Management**: Backend `queue_tracks` attribute will be bounded (up to 100 tracks per spec). Frontend card will handle large lists with virtualization/scrolling to prevent memory issues.
- [x] **V. Type Safety**: Backend services will have type hints on all public methods. Frontend card will use TypeScript for type safety (to be confirmed in Phase 0).
- [x] **VI. Technical Debt**: No existing TODOs/FIXMEs related to this feature. Legacy code paths will not be affected.
- [x] **VII. Release Management**: Version will be bumped in `manifest.json` and changelog updated before merge to `main` (MINOR version bump for new feature).

**Violations**: None identified. All principles can be satisfied with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
├── __init__.py
├── config_flow.py
├── const.py
├── media_player.py          # Add queue_tracks attribute and play_track_at_position service
├── services.yaml            # Add play_track_at_position service definition
├── speaker.py               # Add play_track_at_position method and queue_tracks attribute logic
└── manifest.json            # Version bump

www/community/mopidy/        # Custom card frontend (to be created)
├── mopidy-queue-card.js     # Main card component
├── mopidy-queue-card.ts     # TypeScript source (if using TS)
└── resources/               # Card resources (styles, icons if needed)
```

**Structure Decision**: Hybrid structure with backend Python code in `custom_components/mopidy/` and frontend custom card in `www/community/mopidy/` following Home Assistant custom card distribution patterns. The backend services extend existing integration code, while the frontend card is a new custom component that can be installed via HACS or manually.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All constitution principles can be satisfied with proper implementation.

---

## Phase 0: Research Complete

**Status**: ✅ Complete

All technical unknowns have been resolved in `research.md`:
- Custom card framework: Lit (v2+) with TypeScript
- Drag-and-drop: SortableJS library
- Entity state subscription: `hass.connection.subscribeEntities()`
- Service calls: `hass.callService()` API
- iOS compatibility: Same codebase works in both web and iOS app
- Distribution: HACS custom card repository with TypeScript compilation

---

## Phase 1: Design & Contracts Complete

**Status**: ✅ Complete

**Generated Artifacts**:
- `data-model.md`: Data structures for `queue_tracks` attribute, card configuration, and internal state
- `contracts/README.md`: Service contracts for `mopidy.play_track_at_position` and `queue_tracks` attribute
- `quickstart.md`: Comprehensive validation guide with 10 phases of testing

**Key Design Decisions**:
- Backend: New `queue_tracks` entity attribute exposes full track list with metadata
- Backend: New `mopidy.play_track_at_position` service plays track without reordering
- Frontend: Lit-based custom card with TypeScript for type safety
- Frontend: SortableJS for drag-and-drop with 10px movement threshold
- Frontend: Reactive updates via entity state subscription
- Distribution: HACS custom card repository

---

## Next Steps

1. **Generate Tasks**: Run `/speckit.tasks` to create detailed task breakdown
2. **Implementation**: 
   - Backend: Implement `queue_tracks` attribute and `play_track_at_position` service
   - Frontend: Develop custom card with Lit, SortableJS, and entity subscription
3. **Testing**: Follow `quickstart.md` validation steps
4. **Distribution**: Package card for HACS distribution

**Note**: This feature requires implementing two new backend components before the custom card can be fully functional. Consider implementing backend services first, then developing the custom card.
