<script lang="ts">
  import { browser } from "$app/environment";
  import type {
    LatLng,
    LatLngBounds,
    LeafletEventHandlerFn,
    Map as LeafletMap,
    LeafletMouseEvent,
    Rectangle,
  } from "leaflet";
  import { onDestroy, onMount } from "svelte";
  import {
    rectangleCoords,
    resetRectangleCoords,
    type LatLngTuple,
  } from "./stores/mapStore";

  let mapContainer: HTMLElement;
  let map: LeafletMap;
  let rectangle: Rectangle | null = null;
  let startPoint: LatLng | null = null;

  // Add default coordinates (will be used as fallback)
  let defaultPosition: [number, number] = [18.7883, 98.9853];

  // Add function to get user's position
  async function getCurrentPosition(): Promise<[number, number]> {
    if (!browser || !navigator.geolocation) {
      return defaultPosition;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        },
      );

      return [position.coords.latitude, position.coords.longitude];
    } catch (error) {
      console.warn("Error getting geolocation:", error);
      return defaultPosition;
    }
  }

  const isDeviceMobile = false; // Set this to your actual mobile detection logic

  function calculateCorners(bounds: LatLngBounds | null) {
    if (!bounds) return null;
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    const northWest = bounds.getNorthWest();
    const southEast = bounds.getSouthEast();

    return [
      [northWest.lat, northWest.lng],
      [northEast.lat, northEast.lng],
      [southEast.lat, southEast.lng],
      [southWest.lat, southWest.lng],
    ];
  }

  // @ts-ignore
  onMount(async () => {
    if (browser) {
      const leaflet = await import("leaflet");

      // Get user's position before initializing the map
      const [lat, lng] = await getCurrentPosition();

      map = leaflet.map(mapContainer).setView([lat, lng], 13);

      // Using OpenStreetMap Carto (Standard) style with English labels
      leaflet
        .tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          locale: "en",
        })
        .addTo(map);

      // Add a marker for user's location
      // const userLocationMarker = leaflet
      //   .marker([lat, lng], {
      //     title: "Your Location",
      //   })
      //   .addTo(map);

      map.on("click", handleClick as LeafletEventHandlerFn);
      map.on("mousemove", handleMouseMove as LeafletEventHandlerFn);

      // Subscribe to rectangleCoords changes
      const unsubscribe = rectangleCoords.subscribe((coords) => {
        if (coords) {
          updateRectangleFromCoords(coords);
        } else if (rectangle) {
          map.removeLayer(rectangle);
          rectangle = null;
        }
      });

      return () => {
        unsubscribe();
        if (map) {
          map.remove();
        }
      };
    }
  });

  function handleClick(e: LeafletMouseEvent) {
    if (!startPoint) {
      startPoint = e.latlng;
      updateRectangle(e.latlng);
    } else {
      const bounds = rectangle ? rectangle.getBounds() : null;
      const corners = calculateCorners(bounds);
      if (corners) {
        const [, topRight, , bottomLeft] = corners as LatLngTuple[];
        rectangleCoords.set([bottomLeft, topRight]);
        console.log("Final coordinates:", [bottomLeft, topRight]);
      }
      startPoint = null;
    }
  }

  function handleMouseMove(e: LeafletMouseEvent) {
    if (startPoint && !isDeviceMobile) {
      updateRectangle(e.latlng);
    }
  }

  function updateRectangle(endPoint: LatLng) {
    if (!map || !startPoint) return;

    const leaflet = (window as any).L;
    if (rectangle) {
      map.removeLayer(rectangle);
    }

    const bounds = leaflet.latLngBounds(startPoint, endPoint);
    rectangle = leaflet.rectangle(bounds, { color: "purple" }).addTo(map);
  }

  function updateRectangleFromCoords(coords: [LatLngTuple, LatLngTuple]) {
    if (!map) return;

    const leaflet = (window as any).L;
    if (rectangle) {
      map.removeLayer(rectangle);
    }

    const bounds = leaflet.latLngBounds(coords);
    rectangle = leaflet.rectangle(bounds, { color: "purple" }).addTo(map);
  }

  // You can call this function to reset the rectangle
  function resetRectangle() {
    resetRectangleCoords();
  }

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<div class="map-container">
  <div class="map" bind:this={mapContainer}></div>
</div>

<style>
  /* @import "leaflet/dist/leaflet.css"; */
  /* .map-container {
    width: 100%;
    height: 66.67vh;
  }

  div {
    height: 700px;
  } */
  .map-container {
    width: 100%;
    height: 80vh;
    min-height: 400px;
    max-height: 800px;
    position: relative;
    overflow: hidden;
  }

  .map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 768px) {
    .map-container {
      height: 40vh;
    }
  }
</style>
