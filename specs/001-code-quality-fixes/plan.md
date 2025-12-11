# Implementation Plan: Code Quality & Best-Practice Fixes

**Branch**: `001-code-quality-fixes` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-code-quality-fixes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Apply code quality improvements and best-practice fixes identified in code review to enhance stability, error handling, resource management, and release compliance. This includes fixing bare exception handlers, eliminating blocking calls in async code, bounding caches, removing technical debt, and ensuring proper version/changelog management.

## Technical Context

**Language/Version**: Python 3.9+ (Home Assistant integration standard - determined by HA runtime)  
**Primary Dependencies**: 
- `mopidyapi>=1.1.0` (Mopidy API client)
- `spotifyaio==0.9.0` (Spotify integration)
- Home Assistant core libraries (homeassistant.*)
- `voluptuous` (validation schemas)
- `requests` (via mopidyapi dependency)

**Storage**: In-memory dictionaries (`CACHE_ART`, `CACHE_TITLES`) - no persistent storage required  
**Testing**: Manual smoke testing and code review validation (no formal test infrastructure currently exists)  
**Target Platform**: Home Assistant (runs on any platform where HA is deployed: Linux, Docker, etc.)  
**Project Type**: Single project (Home Assistant custom component)  
**Performance Goals**: 
- User commands respond within 1 second (per spec SC-002)
- No UI freezes or blocking warnings
- Bounded memory usage via cache limits

**Constraints**: 
- Must not block Home Assistant event loop
- Must handle Mopidy server unavailability gracefully
- Must maintain backward compatibility with existing installations
- Memory usage must be bounded (caches cannot grow unbounded)

**Scale/Scope**: 
- Single integration component (`custom_components/mopidy/`)
- Supports multiple Mopidy server instances
- ~1,200 lines of Python code across 5 main files
- No database or external services beyond Mopidy servers

**Additional Libraries Required**: None
- Cache bounding will use `collections.OrderedDict` (Python standard library)
- All other fixes use existing dependencies and standard library modules
- No third-party libraries needed for this code quality improvement effort

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **I. Home Assistant Integration Standards**: This feature fixes existing HA integration code to better follow HA patterns (config flow, entity platform, services) - COMPLIANT
- [x] **II. Error Handling Discipline**: Fixes bare `except:` clauses and improves error handling with specific exceptions - COMPLIANT
- [x] **III. Async/Sync Boundary Management**: Fixes blocking `time.sleep()` calls and ensures proper async/sync boundaries - COMPLIANT
- [x] **IV. Resource Management**: Implements bounded caches and proper connection management - COMPLIANT
- [x] **V. Type Safety**: Adds type hints to public methods and extracts magic numbers - COMPLIANT
- [x] **VI. Technical Debt**: Removes TODOs/FIXMEs, duplicate code, and legacy paths - COMPLIANT
- [x] **VII. Release Management**: Ensures version bump and changelog updates on merge - COMPLIANT

**Violations**: None - all fixes align with constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-code-quality-fixes/
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
├── __init__.py          # Component setup and entry point
├── config_flow.py       # Configuration flow (manual + zeroconf)
├── const.py             # Constants and cache dictionaries
├── media_player.py      # Media player entity implementation
├── speaker.py           # Mopidy API wrapper and queue management
├── services.yaml        # Service definitions
└── translations/        # i18n files (en.json, fr.json, nl.json)

mopidy-CHANGELOG.md      # Release changelog (must be updated)
```

**Structure Decision**: Existing Home Assistant custom component structure maintained. All fixes apply to existing files within `custom_components/mopidy/`. No new files required, but changes span multiple existing files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all changes align with constitution principles.
