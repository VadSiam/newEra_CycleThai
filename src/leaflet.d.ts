declare module 'leaflet' {
  export function map(element: HTMLElement | string): Map;

  export class Map {
    setView(center: [number, number], zoom: number): this;
    remove(): void;
    on(type: string, fn: LeafletEventHandlerFn): this;
    removeLayer(layer: Layer): this;
    dragging: DraggingHandler;
  }

  export function tileLayer(urlTemplate: string, options?: any): TileLayer;

  export class TileLayer extends Layer {
    addTo(map: Map): this;
  }

  export function marker(latlng: [number, number]): Marker;

  export class Marker extends Layer {
    addTo(map: Map): this;
  }

  export class Layer {
    addTo(map: Map): this;
  }

  export interface LeafletMouseEvent {
    latlng: LatLng;
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export type LeafletEventHandlerFn = (event: LeafletMouseEvent) => void;

  export function latLngBounds(corner1: [number, number], corner2: [number, number]): LatLngBounds;

  export class LatLngBounds {
    getNorthWest(): LatLng;
    getNorthEast(): LatLng;
    getSouthEast(): LatLng;
    getSouthWest(): LatLng;
  }

  export function rectangle(bounds: LatLngBounds, options?: any): Rectangle;

  export interface Rectangle extends Layer {
    getBounds(): LatLngBounds;
  }

  export interface DraggingHandler {
    enable(): void;
    disable(): void;
    handler: {
      enable(): void;
      disable(): void;
    };
  }
}
