// Type declarations for Lit (provided by Home Assistant)
declare module 'lit' {
  export class LitElement extends HTMLElement {
    protected render(): any;
    protected createRenderRoot(): ShadowRoot | this;
    protected requestUpdate(): void;
    protected update(changedProperties: Map<string | number | symbol, unknown>): void;
    protected updated(changedProperties: Map<string | number | symbol, unknown>): void;
    protected firstUpdated(changedProperties: Map<string | number | symbol, unknown>): void;
    protected shouldUpdate(changedProperties: Map<string | number | symbol, unknown>): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    readonly shadowRoot: ShadowRoot | null;
    readonly updateComplete: Promise<boolean>;
  }
  export function html(strings: TemplateStringsArray, ...values: any[]): any;
  export function css(strings: TemplateStringsArray, ...values: any[]): any;
  export type PropertyValues = Map<string | number | symbol, unknown>;
}

declare module 'lit/decorators.js' {
  export function customElement(name: string): (target: any) => any;
  export function property(options?: any): (target: any, propertyKey: string) => any;
  export function state(options?: any): (target: any, propertyKey: string) => any;
}

declare module 'lit/directives/class-map.js' {
  export function classMap(classInfo: Record<string, boolean>): any;
}

declare module 'lit/directives/style-map.js' {
  export function styleMap(styleInfo: Record<string, string>): any;
}

