# Contracts: Code Quality & Best-Practice Fixes

**Feature**: Code Quality & Best-Practice Fixes  
**Date**: 2025-12-11

## Overview

This feature does not introduce new API contracts or service interfaces. It improves existing code quality, error handling, and resource management within the Mopidy integration.

## Modified Internal Contracts

### Error Handling Contract

**Before**: Bare `except:` clauses, inconsistent error types

**After**: Specific exception types with context
- All error handlers MUST catch specific exception types
- All errors MUST include context (hostname, port, operation) in logs
- Connection errors MUST use `reConnectionError`
- Invalid input MUST use `ValueError` with descriptive message

### Cache Management Contract

**Before**: Unbounded dictionaries, no size limits

**After**: Bounded LRU caches
- Maximum size: `CACHE_MAX_SIZE` (1000 entries)
- Eviction policy: Least Recently Used (LRU)
- Implementation: `collections.OrderedDict` with manual size management

### Async/Sync Boundary Contract

**Before**: Blocking `time.sleep()` in async context

**After**: Non-blocking async sleep
- All sleep operations in async context MUST use `asyncio.sleep()`
- Blocking operations MUST be wrapped in `async_add_executor_job()`

### Type Safety Contract

**Before**: Inconsistent type hints

**After**: Complete type annotations
- All public methods MUST have parameter and return type hints
- All class attributes MUST have type hints
- Use `typing` module types (`Optional`, `dict`, `list`, `Any`, etc.)

## External Contracts (Unchanged)

- **Mopidy API**: No changes to Mopidy API interaction patterns
- **Home Assistant API**: No changes to HA integration patterns
- **Service Interfaces**: No changes to service signatures or schemas

## Validation

- All changes maintain backward compatibility with existing HA installations
- No breaking changes to public APIs or service interfaces
- Error handling improvements are transparent to users (better error messages)

