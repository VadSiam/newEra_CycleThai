import { writable } from 'svelte/store';

export type LatLngTuple = [number, number];

export const rectangleCoords = writable<[LatLngTuple, LatLngTuple] | null>(null);

export const selectedClimbCategories = writable<number[]>([1, 2, 3, 4, 5]); // All categories by default

export function resetRectangleCoords() {
  rectangleCoords.set(null);
}