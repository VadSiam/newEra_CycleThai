import { writable } from 'svelte/store';

export type LatLngTuple = [number, number];

export const rectangleCoords = writable<[LatLngTuple, LatLngTuple] | null>(null);

export function resetRectangleCoords() {
  rectangleCoords.set(null);
}