# Research: Custom Queue Management Card

**Date**: 2025-12-11  
**Feature**: 004-custom-queue-card  
**Purpose**: Resolve technical unknowns for custom Lovelace card implementation with drag-and-drop and tap-to-play functionality

## Research Questions

### Q1: What framework should be used for Home Assistant custom cards?

**Decision**: Use Lit (v2+) for custom card development, with TypeScript for type safety.

**Rationale**: 
- Home Assistant's modern custom cards use Lit (web components standard)
- Lit provides reactive updates, lifecycle management, and good TypeScript support
- Lit works in both web and iOS app (iOS app uses same frontend framework)
- TypeScript enables type safety for entity states, service calls, and card configuration

**Alternatives considered**:
- Polymer: Rejected - legacy framework, not recommended for new cards
- Vanilla JavaScript: Rejected - lacks reactive updates and lifecycle management needed for entity state subscriptions

**References**:
- Home Assistant Developer Documentation: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/
- Lit Framework: https://lit.dev/
- Custom Card Examples: https://github.com/home-assistant/frontend/tree/dev/src/panels/lovelace/cards

---

### Q2: How to implement drag-and-drop in a custom Lovelace card?

**Decision**: Use SortableJS library for drag-and-drop functionality, with custom touch event handling for 10px movement threshold.

**Rationale**: 
- SortableJS provides robust drag-and-drop that works with both mouse and touch events
- Supports visual feedback (ghost element, insertion indicators)
- Can be configured with movement threshold to distinguish drag from tap
- Widely used in web applications, well-tested
- Can be bundled with the custom card or loaded as external dependency

**Alternatives considered**:
- HTML5 Drag and Drop API: Rejected - limited touch support, complex touch event handling required
- Custom touch event handling: Rejected - reinventing wheel, SortableJS handles edge cases better
- Dragula: Considered but SortableJS has better touch support and more active maintenance

**References**:
- SortableJS: https://sortablejs.github.io/Sortable/
- Touch Events: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
- SortableJS Touch Support: https://github.com/SortableJS/Sortable#touch

---

### Q3: How to subscribe to entity state changes in a custom card?

**Decision**: Use Home Assistant's `subscribeEntities` API via the card's `hass` object to reactively update when entity state or attributes change.

**Rationale**:
- Home Assistant provides `hass.connection.subscribeEntities()` for reactive entity state subscriptions
- Automatically handles entity unavailable states
- Efficient - only updates when entity state actually changes
- Works in both web and iOS app (same API)

**Alternatives considered**:
- Polling entity state: Rejected - inefficient, adds unnecessary load, not reactive
- Event listeners for state_changed: Rejected - lower-level API, subscribeEntities is the recommended pattern

**References**:
- Home Assistant Frontend API: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/
- Entity State Management: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#state
- Connection API: https://developers.home-assistant.io/docs/frontend/data/

---

### Q4: How to call Home Assistant services from a custom card?

**Decision**: Use `hass.callService()` method via the card's `hass` object to call services, with error handling via try/catch and promise rejection handling.

**Rationale**:
- `hass.callService(domain, service, serviceData, target)` is the standard API for service calls in custom cards
- Returns a promise that resolves on success or rejects on error
- Automatically handles entity targeting via `target` parameter
- Works in both web and iOS app

**Alternatives considered**:
- Direct HTTP API calls: Rejected - bypasses HA's service validation and error handling
- WebSocket API calls: Rejected - lower-level, `callService` is the recommended abstraction

**References**:
- Service Calls in Custom Cards: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#calling-services
- Hass Object API: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#hass

---

### Q5: How to ensure iOS app compatibility with custom cards?

**Decision**: iOS app uses the same custom card framework as web interface - cards written with Lit and standard HA APIs work identically in both platforms.

**Rationale**:
- Home Assistant iOS app embeds the same frontend as web interface
- Custom cards loaded via HACS or manual installation work in both web and iOS app
- Touch events are handled by the browser/WebView, so SortableJS touch support works in iOS app
- No platform-specific code needed if using standard HA custom card patterns

**Alternatives considered**:
- Platform-specific implementations: Rejected - unnecessary, same code works in both
- iOS-specific workarounds: Rejected - not needed if using standard patterns

**References**:
- Home Assistant iOS App: https://github.com/home-assistant/iOS
- Custom Card Support: https://www.home-assistant.io/integrations/frontend/
- HACS Custom Cards: https://hacs.xyz/docs/categories/cards

---

### Q6: How to structure and distribute the custom card?

**Decision**: Use TypeScript source with compilation to single JavaScript bundle, distributed via HACS as a custom card repository.

**Rationale**:
- TypeScript provides type safety for entity states, service calls, and card configuration
- Single bundled JavaScript file simplifies distribution and loading
- HACS provides easy installation and updates for users
- Follows standard custom card distribution pattern

**File Structure**:
```
www/community/mopidy/
├── mopidy-queue-card.ts    # TypeScript source
├── mopidy-queue-card.js    # Compiled JavaScript (bundled)
└── hacs.json               # HACS metadata
```

**Alternatives considered**:
- Single JavaScript file (no TypeScript): Rejected - loses type safety benefits
- Multiple unbundled files: Rejected - complicates loading and distribution

**References**:
- HACS Custom Card Guidelines: https://hacs.xyz/docs/publish/card
- Custom Card Distribution: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#distribution
- TypeScript for Custom Cards: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#typescript

---

## Technology Choices Summary

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Custom Card Framework | Lit (v2+) with TypeScript | Modern web components standard, reactive updates, iOS compatible |
| Drag-and-Drop Library | SortableJS | Robust touch/mouse support, visual feedback, movement threshold configurable |
| Entity State Subscription | `hass.connection.subscribeEntities()` | Reactive updates, handles unavailable states, standard HA API |
| Service Call API | `hass.callService()` | Standard HA service call API, promise-based error handling |
| iOS App Compatibility | Same code as web | iOS app uses same frontend framework, no platform-specific code needed |
| Card Distribution | HACS custom card repository | Easy installation, TypeScript compiled to single JS bundle |

## Dependencies Confirmed

- Home Assistant Core (custom card support) - ✅ Available
- Mopidy Enhanced Services (002 feature) - ✅ Implemented (`mopidy.move_track` available)
- Entity attributes (`queue_position`, `queue_size`) - ✅ Available
- New backend services required:
  - `mopidy.play_track_at_position` - ⚠️ To be implemented
  - `queue_tracks` entity attribute - ⚠️ To be implemented

## Unknowns Resolved

All technical unknowns have been resolved. The implementation will use:
- Lit (v2+) framework with TypeScript for custom card development
- SortableJS library for drag-and-drop functionality (mouse and touch support)
- `hass.connection.subscribeEntities()` for reactive entity state updates
- `hass.callService()` for calling Mopidy services
- Same codebase for web and iOS app (no platform-specific code needed)
- HACS distribution with TypeScript compiled to single JavaScript bundle

