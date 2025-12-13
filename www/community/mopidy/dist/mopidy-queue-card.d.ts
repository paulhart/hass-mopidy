import { LitElement, PropertyValues } from 'lit';
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
    connection: {
        subscribeEntities: (callback: (entities: {
            [entityId: string]: HassEntity;
        }) => void) => () => void;
    };
    callService: (domain: string, service: string, serviceData?: {
        [key: string]: any;
    }, target?: {
        entity_id?: string | string[];
    }) => Promise<void>;
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
export declare class MopidyQueueCard extends LitElement {
    hass: HomeAssistant;
    config: MopidyQueueCardConfig;
    private queueTracks;
    private queuePosition;
    private queueSize;
    private isLoading;
    private error;
    private isDragging;
    private dragStartPosition;
    private _unsubEntities?;
    private _sortableInstance;
    private _pendingOperations;
    setConfig(config: MopidyQueueCardConfig): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _subscribeEntities;
    private _updateEntityState;
    private _retry;
    private _formatMetadata;
    render(): any;
    private _renderTrack;
    private _formatDuration;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    private _initSortable;
    private _handleTrackClick;
    private _moveTrack;
    private _playTrackAtPosition;
    static styles: any;
}
declare global {
    interface HTMLElementTagNameMap {
        'mopidy-queue-card': MopidyQueueCard;
    }
    interface Window {
        customCards?: Array<{
            type: string;
            name: string;
            description: string;
        }>;
    }
}
export {};
