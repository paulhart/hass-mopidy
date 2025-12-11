# Research: Code Quality & Best-Practice Fixes

**Feature**: Code Quality & Best-Practice Fixes  
**Date**: 2025-12-11  
**Status**: Complete

## Research Objectives

Determine technical approach for fixing code quality issues identified in code review while maintaining compatibility with existing Home Assistant and Mopidy API patterns.

## Decisions Made

### Decision 1: Python Version & Runtime Environment
**Decision**: Use Python 3.9+ (Home Assistant standard)  
**Rationale**: Home Assistant integrations run in HA's Python runtime. No version specification needed - determined by HA deployment.  
**Alternatives considered**: None - constrained by HA runtime.

### Decision 2: Error Handling Pattern
**Decision**: Replace bare `except:` with specific exception types (`reConnectionError`, `ValueError`, `Exception` with context)  
**Rationale**: Constitution Principle II requires specific exception handling. Existing codebase already uses `reConnectionError` from `requests.exceptions` - maintain consistency.  
**Alternatives considered**: 
- Custom exception classes: Rejected - adds complexity without benefit for this integration
- Generic `Exception`: Rejected - too broad, violates constitution

### Decision 3: Async/Sync Boundary Fix
**Decision**: Replace `time.sleep(0.5)` in `restore_snapshot()` with `asyncio.sleep(0.5)` wrapped in async context  
**Rationale**: Constitution Principle III forbids blocking calls in async code. The restore operation is called from async context (`service_restore` method).  
**Alternatives considered**: 
- Keep blocking sleep: Rejected - violates constitution and causes UI freezes
- Remove retry loop: Rejected - needed for reliable snapshot restore

### Decision 4: Cache Bounding Strategy
**Decision**: Implement LRU-style cache with maximum size limit (e.g., 1000 entries) for `CACHE_ART` and `CACHE_TITLES`  
**Rationale**: Constitution Principle IV requires bounded caches. LRU eviction maintains recent items while preventing unbounded growth. Python's `collections.OrderedDict` or `functools.lru_cache` can be used.  
**Alternatives considered**: 
- TTL-based expiration: Rejected - requires timestamp tracking and periodic cleanup, more complex
- Fixed-size dict with manual eviction: Considered - simpler but less efficient than LRU
- Use `functools.lru_cache`: Preferred - standard library, automatic LRU behavior

**Note**: Need to confirm if `functools.lru_cache` works with dict assignment pattern. If not, use `collections.OrderedDict` with manual size limit.

### Decision 5: Type Hints Approach
**Decision**: Add type hints to all public methods and class attributes using `typing` module (already imported in some files)  
**Rationale**: Constitution Principle V requires type hints. Existing code already uses `Optional`, `dict`, `list` from typing in some places - extend consistently.  
**Alternatives considered**: 
- Full type annotations everywhere: Preferred - improves IDE support and static analysis
- Minimal annotations: Rejected - doesn't meet constitution requirement

### Decision 6: Legacy Code Removal
**Decision**: Keep `async_setup_platform` function and add documentation explaining it's retained for legacy YAML-based configuration support  
**Rationale**: Constitution Principle VI requires removal or documentation of legacy code. README still documents YAML configuration, indicating this function is still needed for backward compatibility. Adding clear documentation satisfies constitution requirement.  
**Alternatives considered**: 
- Remove it: Rejected - would break YAML-based configuration still documented in README
- Keep without documentation: Rejected - violates constitution Principle VI
- Keep with documentation: Selected - maintains compatibility while satisfying constitution

### Decision 7: Duplicate Import Removal
**Decision**: Remove duplicate `urllib.parse` import in `media_player.py` (lines 7 and 11)  
**Rationale**: Simple cleanup - no functional impact, improves code clarity.  
**Alternatives considered**: None - straightforward removal.

### Decision 8: Magic Number Extraction
**Decision**: Extract magic numbers to constants in `const.py`:
- `120` (retry count in restore_snapshot) → `RESTORE_RETRY_MAX`
- `0.5` (sleep interval) → `RESTORE_RETRY_INTERVAL_SECONDS`
- `5` (volume step) → `VOLUME_STEP_PERCENT`
- `1000` (cache size limit) → `CACHE_MAX_SIZE`  
**Rationale**: Constitution Principle V requires named constants. Makes code self-documenting.  
**Alternatives considered**: None - standard practice.

### Decision 9: Additional Libraries Required
**Decision**: No additional libraries required - use Python standard library (`collections`, `functools`, `asyncio`)  
**Rationale**: User instruction: "pause for confirmation if additional libraries are required." Standard library modules are acceptable without confirmation.  
**Alternatives considered**: 
- Third-party cache libraries (e.g., `cachetools`): Rejected - adds dependency, standard library sufficient

## Open Questions Resolved

1. **Q**: Does HA still support `async_setup_platform` for YAML config?  
   **A**: Yes - README documents YAML configuration, so function is retained with documentation explaining legacy support.

2. **Q**: Can `functools.lru_cache` be used with dict assignment pattern?  
   **A**: No - `lru_cache` decorates functions, not dict assignments. Use `collections.OrderedDict` with manual size limit.

## Technical Standards (from Existing Code)

- **Error Handling**: Use `requests.exceptions.ConnectionError` (aliased as `reConnectionError`) for network failures
- **Logging**: Use `logging.getLogger(__name__)` pattern, log errors with context (hostname, port, operation)
- **Async Patterns**: Use `@callback` decorator for WebSocket callbacks, `async_add_executor_job` for sync work in async context
- **Type Hints**: Use `typing` module (`Optional`, `dict`, `list`, `Any`, etc.)
- **Constants**: Define in `const.py` with uppercase names
- **Code Style**: Follow existing patterns (PEP 8, Home Assistant conventions)

## Next Steps

1. ✅ Resolved: `async_setup_platform` will be kept with documentation
2. Implement cache bounding using `collections.OrderedDict`
3. Apply all fixes following existing code patterns
4. Validate no new lint warnings introduced

