# Data Model: Code Quality & Best-Practice Fixes

**Feature**: Code Quality & Best-Practice Fixes  
**Date**: 2025-12-11

## Overview

This feature does not introduce new data entities. Instead, it modifies existing data structures and error handling patterns within the Mopidy integration.

## Modified Data Structures

### Cache Dictionaries (Bounded)

**Current State**: Unbounded dictionaries in `const.py`
- `CACHE_ART: dict[str, str | None]` - Maps image URIs to expanded URLs
- `CACHE_TITLES: dict[str, str]` - Maps media content IDs to display titles

**Modified State**: Bounded LRU-style caches
- `CACHE_ART: OrderedDict[str, str | None]` - Maximum size: `CACHE_MAX_SIZE` (1000 entries)
- `CACHE_TITLES: OrderedDict[str, str]` - Maximum size: `CACHE_MAX_SIZE` (1000 entries)

**Behavior**: When cache reaches maximum size, oldest entries are evicted (LRU policy).

### Error State Tracking

**Current State**: Inconsistent error handling, bare `except:` clauses

**Modified State**: Explicit error types and context
- Connection errors: `reConnectionError` (from `requests.exceptions`)
- Invalid input: `ValueError` with descriptive messages
- Missing resources: `MissingMediaInformation`, `MissingMopidyExtension` (existing custom exceptions)
- Generic errors: `Exception` with context (hostname, port, operation) - only when specific type unavailable

### Configuration Constants

**New Constants** (to be added to `const.py`):
- `RESTORE_RETRY_MAX: int = 120` - Maximum retry attempts for snapshot restore
- `RESTORE_RETRY_INTERVAL_SECONDS: float = 0.5` - Sleep interval between retries
- `VOLUME_STEP_PERCENT: int = 5` - Volume adjustment step size
- `CACHE_MAX_SIZE: int = 1000` - Maximum entries in cache dictionaries

## State Transitions

### Connection State
- **Available** → **Unavailable**: On connection error, set `_attr_is_available = False`
- **Unavailable** → **Available**: On successful reconnection, set `_attr_is_available = True`

### Cache State
- **Cache Entry Added**: If cache at max size, evict oldest entry (LRU)
- **Cache Entry Accessed**: Move to end of OrderedDict (most recently used)

### Snapshot Restore State
- **Idle** → **Restoring**: On `restore_snapshot()` call
- **Restoring** → **Playing/Paused**: On successful restore (with async retry loop)
- **Restoring** → **Failed**: On timeout (120 retries × 0.5s = 60s max)

## Validation Rules

### Cache Operations
- Cache keys MUST be strings (URI or content ID)
- Cache values MUST be strings or None (for CACHE_ART)
- Cache size MUST NOT exceed `CACHE_MAX_SIZE`

### Error Handling
- All exception handlers MUST catch specific exception types
- All exception handlers MUST log context (hostname, port, operation)
- Bare `except:` clauses are FORBIDDEN

### Type Safety
- All public method parameters MUST have type hints
- All public method return values MUST have type hints
- All class attributes MUST have type hints

## Relationships

- `MopidySpeaker` → `MopidyQueue` → `CACHE_ART`, `CACHE_TITLES` (uses caches)
- `MopidyMediaPlayerEntity` → `MopidySpeaker` (circular reference - noted for future refactoring)
- Error handlers → Logging system (all errors logged with context)

