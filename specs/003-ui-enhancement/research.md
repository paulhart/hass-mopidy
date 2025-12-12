# Research: Mopidy UI Enhancements

**Date**: 2025-12-11  
**Feature**: 003-ui-enhancement  
**Purpose**: Resolve technical unknowns for template-based Lovelace UI implementation

## Research Questions

### Q1: What Lovelace card types are available for building interactive UI components?

**Decision**: Use combination of `entities`, `button`, `template`, and `grid` card types.

**Rationale**: 
- `entities` card: Display entity states and attributes (queue_position, queue_size, media_history)
- `button` card: Trigger service calls (move_track, remove_track, filter_tracks, etc.)
- `template` card: Custom Jinja2 templates for complex layouts and data formatting
- `grid` card: Responsive layout for organizing multiple cards

**Alternatives considered**:
- Custom Lovelace cards: Rejected - violates constraint of no custom frontend code
- `markdown` card: Considered for documentation but insufficient for interactivity
- `picture-elements` card: Overkill for this use case, adds complexity

**References**:
- Home Assistant Lovelace Card Documentation: https://www.home-assistant.io/dashboards/cards/
- Template Card: https://www.home-assistant.io/dashboards/template/

---

### Q2: How to call services from Lovelace cards with user input parameters?

**Decision**: Use `button` cards with `service` action and `service_data` template, or `tap_action` on entity cards with `call-service` action.

**Rationale**:
- `button` card supports `service` action with `service_data` that can include Jinja2 templates
- For dynamic parameters (user-entered positions), use `input_number` helpers or template variables
- Service calls can be triggered via `tap_action` on entity cards with `call-service` action type

**Alternatives considered**:
- `script` entities: Rejected - requires creating scripts for each operation, adds overhead
- `input_*` helpers with automations: Considered but adds complexity and requires automation creation
- Direct service calls from templates: Limited - templates can't directly call services, need button/action

**References**:
- Button Card: https://www.home-assistant.io/dashboards/button/
- Service Calls in Lovelace: https://www.home-assistant.io/dashboards/actions/

---

### Q3: How to display and format entity attributes (media_history) in templates?

**Decision**: Use Jinja2 template filters to access `state_attr()` and format data structures.

**Rationale**:
- `state_attr(entity_id, 'attribute_name')` function accesses entity attributes
- `media_history` is a list of dictionaries - use Jinja2 loops (`for` statements) to iterate
- Use template filters (`|` syntax) for formatting: `| timestamp_custom()`, `| default()`, `| truncate()`

**Alternatives considered**:
- Custom template sensors: Rejected - adds complexity, requires sensor creation
- Direct attribute access in templates: Limited - need `state_attr()` function for attributes

**References**:
- Template Functions: https://www.home-assistant.io/docs/configuration/templating/#home-assistant-template-extensions
- State Attributes: https://www.home-assistant.io/docs/configuration/templating/#state_attr

---

### Q4: How to handle user input (position numbers, filter criteria) in template-based UI?

**Decision**: Use `input_number` helpers for numeric input and `input_text` helpers for text input, or use template variables with button cards.

**Rationale**:
- `input_number` helper: Provides numeric input field with validation (min/max based on queue_size)
- `input_text` helper: Provides text input for filter criteria (artist, album, track_name)
- Template variables: Can be set via `set_variable` action and used in service calls
- Button cards can reference helper values in `service_data` templates

**Alternatives considered**:
- Manual YAML editing: Rejected - not user-friendly, requires technical knowledge
- Custom input components: Rejected - violates no custom frontend code constraint
- Service call with hardcoded values: Rejected - doesn't meet requirement for user input

**References**:
- Input Number Helper: https://www.home-assistant.io/integrations/input_number/
- Input Text Helper: https://www.home-assistant.io/integrations/input_text/
- Template Variables: https://www.home-assistant.io/docs/configuration/templating/#variables

---

### Q5: How to format timestamps in human-readable format (relative time)?

**Decision**: Use Jinja2 template filters: `relative_time()` or `timestamp_custom()` with custom formatting.

**Rationale**:
- `relative_time()` filter: Converts timestamp to relative format ("2 hours ago", "Yesterday")
- `timestamp_custom()` filter: Custom date/time formatting
- `as_timestamp()` function: Converts ISO timestamp strings to Unix timestamp for filters

**Alternatives considered**:
- Custom Python filters: Rejected - requires custom code, violates template-only constraint
- JavaScript date formatting: Rejected - no custom frontend code allowed
- Raw timestamp display: Rejected - doesn't meet requirement for human-readable format

**References**:
- Template Filters: https://www.home-assistant.io/docs/configuration/templating/#filters
- Relative Time: https://www.home-assistant.io/docs/configuration/templating/#relative-time

---

### Q6: How to create responsive layouts that work on mobile devices (320px+)?

**Decision**: Use `grid` card with responsive column configuration and CSS grid layout, or use `vertical-stack`/`horizontal-stack` cards.

**Rationale**:
- `grid` card: Supports responsive column configuration (e.g., `columns: 1` for mobile, `columns: 3` for desktop)
- `vertical-stack` card: Stacks cards vertically (mobile-friendly)
- `horizontal-stack` card: Stacks cards horizontally (desktop-friendly)
- Template cards can use CSS for responsive design within templates

**Alternatives considered**:
- Fixed-width layouts: Rejected - doesn't meet mobile responsiveness requirement
- Custom CSS: Limited - can be used in templates but should be minimal

**References**:
- Grid Card: https://www.home-assistant.io/dashboards/grid/
- Vertical Stack: https://www.home-assistant.io/dashboards/vertical-stack/
- Horizontal Stack: https://www.home-assistant.io/dashboards/horizontal-stack/

---

### Q7: How to display error states and handle service call failures?

**Decision**: Use entity availability state and template conditionals to display error messages.

**Rationale**:
- Entity `state` property: Shows `unavailable` when Mopidy server is unreachable
- Template conditionals (`if` statements): Check entity state and display appropriate messages
- Service call responses: Can be captured via `call-service` action with response handling (if supported)
- Error messages: Display via template cards with conditional rendering

**Alternatives considered**:
- Custom error handling components: Rejected - no custom frontend code
- Toast notifications: Limited - requires custom frontend or automation triggers
- Log-based error display: Rejected - not user-friendly

**References**:
- Entity States: https://www.home-assistant.io/docs/configuration/templating/#states
- Template Conditionals: https://www.home-assistant.io/docs/configuration/templating/#if-statement

---

### Q8: How to refresh entity state after service calls to show updated queue/history?

**Decision**: Use `update_entity` service call or rely on Home Assistant's automatic state updates (polling).

**Rationale**:
- `homeassistant.update_entity` service: Manually triggers entity state update
- Button cards can call `update_entity` after service calls via `action` sequences
- Home Assistant automatically polls entities periodically (configurable)
- Users can manually refresh via refresh button that calls `update_entity`

**Alternatives considered**:
- Real-time WebSocket updates: Rejected - requires custom frontend code, violates template-only constraint
- Automatic refresh after service calls: Limited - depends on entity update interval
- Manual refresh only: Accepted - meets requirement for refresh mechanisms

**References**:
- Update Entity Service: https://www.home-assistant.io/integrations/homeassistant/#update_entity-service
- Entity Update Intervals: https://www.home-assistant.io/docs/configuration/platform_options/

---

### Q9: How to display track artwork/thumbnails in history interface?

**Decision**: Use `entity_picture` attribute or `picture` card type, or access artwork via entity attributes if available.

**Rationale**:
- `entity_picture` attribute: Standard way to display entity images in Lovelace
- `picture` card: Displays images with optional entity information overlay
- `picture-entity` card: Combines picture display with entity state
- If artwork not in entity attributes, may need to use `media_image_url` or similar

**Alternatives considered**:
- Custom image components: Rejected - no custom frontend code
- External image URLs: Considered but requires artwork URL to be available in attributes
- No artwork display: Rejected - doesn't meet requirement for artwork display when available

**References**:
- Picture Card: https://www.home-assistant.io/dashboards/picture/
- Picture Entity Card: https://www.home-assistant.io/dashboards/picture-entity/
- Entity Picture: https://www.home-assistant.io/docs/configuration/customizing-devices/#entity_picture

---

### Q10: How to create confirmation dialogs for destructive actions (delete playlist)?

**Decision**: Use two-step button approach: First button shows confirmation, second button executes action, or use `confirmation` option in button card.

**Rationale**:
- Button card `confirmation` option: Provides built-in confirmation dialog
- Two-button approach: First button enables second button, second button performs action
- Template conditionals: Can show/hide buttons based on confirmation state

**Alternatives considered**:
- Custom modal dialogs: Rejected - requires custom frontend code
- Automation-based confirmation: Rejected - adds complexity, requires automation creation
- No confirmation: Rejected - doesn't meet requirement for confirmation step

**References**:
- Button Card Confirmation: https://www.home-assistant.io/dashboards/button/#confirmation

---

## Technology Choices Summary

| Technology | Choice | Rationale |
|------------|--------|-----------|
| UI Framework | Home Assistant Lovelace (native) | Required - no custom frontend code |
| Card Types | entities, button, template, grid | Best fit for interactive UI with templates |
| Template Engine | Jinja2 (built into HA) | Native HA templating, no dependencies |
| User Input | input_number, input_text helpers | Standard HA approach for user input |
| Service Calls | button card service action | Native HA service call mechanism |
| Error Handling | Entity state + template conditionals | Template-based error display |
| Responsive Design | grid, vertical-stack cards | Native HA responsive layout options |
| State Refresh | update_entity service | Standard HA entity update mechanism |

## Dependencies Confirmed

- Home Assistant Core (Lovelace dashboard system) - ✅ Available
- Jinja2 template engine - ✅ Built into Home Assistant
- Mopidy Enhanced Services (002 feature) - ✅ Implemented and available
- Entity attributes (queue_position, queue_size, media_history) - ✅ Available from 002 feature
- Service definitions (move_track, remove_track, etc.) - ✅ Available from 002 feature

## Unknowns Resolved

All technical unknowns have been resolved. The implementation will use:
- Native Home Assistant Lovelace cards (no custom frontend)
- Jinja2 templates for data formatting and display
- Helper entities (input_number, input_text) for user input
- Button cards for service call triggers
- Template conditionals for error handling and dynamic UI
- Grid/stack cards for responsive layouts

