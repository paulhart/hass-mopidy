import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import Sortable from 'sortablejs';

// Type definitions for Home Assistant
interface HassEntity {
  entity_id: string;
  state: string;
  attributes: {
    [key: string]: any;
    queue_tracks?: QueueTrack[];
    queue_position?: number | null;
    queue_size?: number;
  };
}

interface HomeAssistant {
  states: {
    [entityId: string]: HassEntity;
  };
  callService: (
    domain: string,
    service: string,
    serviceData?: { [key: string]: any },
    target?: { entity_id?: string | string[] }
  ) => Promise<void>;
}

interface QueueTrack {
  position: number;
  uri: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  duration: number | null;
}

interface MopidyQueueCardConfig {
  type: 'custom:mopidy-queue-card';
  entity: string;
  title?: string;
  show_artwork?: boolean;
  max_height?: string;
}

@customElement('mopidy-queue-card')
export class MopidyQueueCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: MopidyQueueCardConfig;

  @state() private queueTracks: QueueTrack[] = [];
  @state() private queuePosition: number | null = null;
  @state() private queueSize: number = 0;
  @state() private isLoading: boolean = true;
  @state() private error: string | null = null;
  @state() private isDragging: boolean = false;
  @state() private dragStartPosition: number | null = null;

  private _sortableInstance: Sortable | null = null;
  private _pendingOperations: Set<Promise<void>> = new Set();

  public setConfig(config: MopidyQueueCardConfig): void {
    if (!config.entity) {
      throw new Error('Entity is required');
    }
    this.config = config;
  }

  connectedCallback() {
    super.connectedCallback();
    this._subscribeEntities();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // No need to unsubscribe - we're using property change detection, not subscriptions
    if (this._sortableInstance) {
      this._sortableInstance.destroy();
    }
  }

  private _subscribeEntities() {
    if (!this.hass || !this.config?.entity) {
      return;
    }

    // Use hass.states directly and react to changes via updated() lifecycle
    // Home Assistant updates the hass property when entity states change
    const entity = this.hass.states[this.config.entity];
    if (entity) {
      this._updateEntityState(entity);
    }
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    
    // React to hass property changes (entity state updates)
    if (changedProperties.has('hass') && this.hass && this.config?.entity) {
      const entity = this.hass.states[this.config.entity];
      if (entity) {
        this._updateEntityState(entity);
      }
    }
    
    // React to config changes
    if (changedProperties.has('config') && this.hass && this.config?.entity) {
      this._subscribeEntities();
    }
    
    // Re-initialize SortableJS if queue list changed
    if (changedProperties.has('queueTracks')) {
      this._initSortable();
    }
  }

  private _updateEntityState(entity: HassEntity) {
    this.queueTracks = entity.attributes.queue_tracks || [];
    this.queuePosition = entity.attributes.queue_position ?? null;
    this.queueSize = entity.attributes.queue_size || 0;
    this.isLoading = false;
    
    if (entity.state === 'unavailable') {
      this.error = 'Entity unavailable';
    } else {
      this.error = null;
    }

    this.requestUpdate();
  }

  private _retry() {
    this.error = null;
    this.isLoading = true;
    // Force entity update by re-reading state
    this._subscribeEntities();
  }

  private _formatMetadata(value: string | null | undefined, fallback: string): string {
    return value || fallback;
  }

  render() {
    if (!this.config || !this.hass) {
      return html`<div class="error">Card not configured</div>`;
    }

    if (this.isLoading) {
      return html`
        <ha-card>
          <div class="card-content loading">
            <div class="spinner"></div>
            <div>Loading queue...</div>
          </div>
        </ha-card>
      `;
    }

    if (this.error) {
      return html`
        <ha-card>
          <div class="card-content error-state">
            <div class="error-message">${this.error}</div>
            <button class="retry-button" @click=${this._retry}>Retry</button>
          </div>
        </ha-card>
      `;
    }

    if (this.queueSize === 0) {
      return html`
        <ha-card>
          <div class="card-content">
            ${this.config.title ? html`<div class="card-header">${this.config.title}</div>` : ''}
            <div class="empty-state">Queue is empty</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div class="card-content">
          ${this.config.title ? html`<div class="card-header">${this.config.title}</div>` : ''}
          <div class="queue-list" id="queue-list">
            ${this.queueTracks.map((track, index) => this._renderTrack(track, index))}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderTrack(track: QueueTrack, index: number) {
    const isPlaying = track.position === this.queuePosition;
    const position = track.position;
    const title = this._formatMetadata(track.title, 'Unknown Title');
    const artist = this._formatMetadata(track.artist, 'Unknown Artist');
    const album = this._formatMetadata(track.album, 'Unknown Album');
    const duration = track.duration ? this._formatDuration(track.duration) : '';

    return html`
      <div 
        class="track-item ${isPlaying ? 'playing' : ''}" 
        data-position="${position}"
        @click=${(e: MouseEvent) => this._handleTrackClick(e, position)}
        @touchend=${(e: TouchEvent) => this._handleTrackClick(e, position)}
      >
        <div class="track-position">${position}</div>
        <div class="track-info">
          <div class="track-title">${title}</div>
          <div class="track-artist">${artist}</div>
          ${album !== 'Unknown Album' ? html`<div class="track-album">${album}</div>` : ''}
        </div>
        ${duration ? html`<div class="track-duration">${duration}</div>` : ''}
        ${isPlaying ? html`<div class="playing-indicator">▶</div>` : ''}
      </div>
    `;
  }

  private _formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  firstUpdated() {
    // Initialize SortableJS after first render
    this._initSortable();
  }

  private _initSortable() {
    const listElement = (this as any).shadowRoot?.getElementById('queue-list');
    if (!listElement) {
      return;
    }

    // Destroy existing instance if any
    if (this._sortableInstance) {
      this._sortableInstance.destroy();
      this._sortableInstance = null;
    }

    this._sortableInstance = Sortable.create(listElement, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      forceFallback: false,
      fallbackTolerance: 10, // 10px movement threshold to distinguish drag from tap
      onStart: (evt) => {
        this.isDragging = true;
        this.dragStartPosition = parseInt(evt.item.getAttribute('data-position') || '0');
      },
      onEnd: (evt) => {
        this.isDragging = false;
        const fromPosition = this.dragStartPosition;
        // Calculate to_position based on new index
        const newIndex = evt.newIndex ?? -1;
        const toPosition = newIndex >= 0 ? newIndex + 1 : fromPosition;
        
        if (fromPosition && toPosition && fromPosition !== toPosition) {
          this._moveTrack(fromPosition, toPosition);
        }
        
        this.dragStartPosition = null;
      },
    });
  }

  private _handleTrackClick(event: MouseEvent | TouchEvent, position: number) {
    // Only handle click if not dragging (SortableJS handles drag)
    // SortableJS uses fallbackTolerance of 10px, so if we get here, it's a tap
    if (this.isDragging) {
      return;
    }

    // Prevent default to avoid any browser behavior
    event.preventDefault();
    event.stopPropagation();

    // Call tap-to-play
    this._playTrackAtPosition(position);
  }

  private async _moveTrack(fromPosition: number, toPosition: number) {
    // Cancel any pending operations
    if (this._pendingOperations.size > 0) {
      // Wait for previous operations to complete
      await Promise.allSettled(Array.from(this._pendingOperations));
    }

    const operation = (async () => {
      try {
        await this.hass.callService(
          'mopidy',
          'move_track',
          {
            from_position: fromPosition,
            to_position: toPosition,
          },
          {
            entity_id: this.config.entity,
          }
        );
        // State will update via entity subscription
      } catch (error: any) {
        const errorMessage = error?.message || error?.code || 'Unknown error';
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          this.error = `Network error: Unable to connect to Mopidy server. Please check your connection.`;
        } else if (errorMessage.includes('timeout')) {
          this.error = `Request timed out. The Mopidy server may be slow to respond.`;
        } else if (errorMessage.includes('invalid') || errorMessage.includes('range')) {
          this.error = `Invalid position: Track positions may have changed. Please refresh.`;
        } else {
          this.error = `Failed to move track: ${errorMessage}`;
        }
      } finally {
        // Reset dragging state after a short delay to allow visual feedback
        setTimeout(() => {
          this.isDragging = false;
        }, 300);
      }
    })();

    this._pendingOperations.add(operation);
    await operation;
    this._pendingOperations.delete(operation);
  }

  private async _playTrackAtPosition(position: number) {
    // If tapping currently playing track, restart it (service handles this)
    // Show operation feedback
    const wasLoading = this.isLoading;
    this.isLoading = true;
    
    const operation = (async () => {
      try {
        await this.hass.callService(
          'mopidy',
          'play_track_at_position',
          {
            position: position,
          },
          {
            entity_id: this.config.entity,
          }
        );
        // State will update via entity subscription
      } catch (error: any) {
        const errorMessage = error?.message || error?.code || 'Unknown error';
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          this.error = `Network error: Unable to connect to Mopidy server. Please check your connection.`;
        } else if (errorMessage.includes('timeout')) {
          this.error = `Request timed out. The Mopidy server may be slow to respond.`;
        } else if (errorMessage.includes('invalid') || errorMessage.includes('range') || errorMessage.includes('empty')) {
          this.error = `Invalid position: Track may no longer exist at position ${position}. Please refresh.`;
        } else {
          this.error = `Failed to play track: ${errorMessage}`;
        }
      } finally {
        // Reset loading state after a short delay
        setTimeout(() => {
          this.isLoading = wasLoading;
        }, 500);
      }
    })();

    this._pendingOperations.add(operation);
    await operation;
    this._pendingOperations.delete(operation);
  }

  static styles = css`
    ha-card {
      padding: 16px;
    }

    .card-content {
      display: flex;
      flex-direction: column;
    }

    .card-header {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--primary-text-color, #000);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--divider-color, #e0e0e0);
      border-top-color: var(--primary-color, #03a9f4);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .error-message {
      color: var(--error-color, #f44336);
      text-align: center;
    }

    .retry-button {
      padding: 8px 16px;
      background-color: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .retry-button:hover {
      opacity: 0.8;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color, #666);
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }

    .track-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background-color: var(--card-background-color, #fff);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .track-item:hover {
      background-color: var(--secondary-background-color, #f5f5f5);
    }

    .track-item.playing {
      background-color: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }

    .track-item.sortable-ghost {
      opacity: 0.4;
    }

    .track-item.sortable-chosen {
      cursor: grabbing;
    }

    .track-position {
      font-weight: 600;
      min-width: 30px;
      text-align: center;
      color: var(--secondary-text-color, #666);
    }

    .track-item.playing .track-position {
      color: white;
    }

    .track-info {
      flex: 1;
      min-width: 0;
    }

    .track-title {
      font-weight: 500;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .track-artist {
      font-size: 0.9em;
      color: var(--secondary-text-color, #666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .track-item.playing .track-artist {
      color: rgba(255, 255, 255, 0.9);
    }

    .track-album {
      font-size: 0.85em;
      color: var(--secondary-text-color, #666);
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .track-item.playing .track-album {
      color: rgba(255, 255, 255, 0.8);
    }

    .track-duration {
      font-size: 0.9em;
      color: var(--secondary-text-color, #666);
      min-width: 50px;
      text-align: right;
    }

    .track-item.playing .track-duration {
      color: white;
    }

    .playing-indicator {
      font-size: 1.2em;
      color: var(--primary-color, #03a9f4);
      min-width: 24px;
      text-align: center;
    }

    .track-item.playing .playing-indicator {
      color: white;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'mopidy-queue-card': MopidyQueueCard;
  }
  interface Window {
    customCards?: Array<{ type: string; name: string; description: string }>;
  }
}

// Register card with Home Assistant
if (typeof window !== 'undefined' && window.customCards) {
  window.customCards.push({
    type: 'mopidy-queue-card',
    name: 'Mopidy Queue Card',
    description: 'Interactive queue management card for Mopidy with drag-and-drop and tap-to-play',
  });
}

