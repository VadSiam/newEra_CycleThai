<script lang="ts">
  import { browser } from "$app/environment";
  import type {
    LatLng,
    LeafletEventHandlerFn,
    Map as LeafletMap,
    LeafletMouseEvent,
    Rectangle,
  } from "leaflet";
  import { onDestroy, onMount } from "svelte";

  let mapContainer: HTMLElement;
  let map: LeafletMap;
  let rectangle: Rectangle | null = null;
  let tempRectangle: Rectangle | null = null;
  let firstPoint: LatLng | null = null;
  let isDrawing = false;

  onMount(async () => {
    if (browser) {
      const leaflet = await import("leaflet");
      map = leaflet
        .map(mapContainer, {
          dragging: false, // Disable default dragging
          tap: false, // Disable tap handler
        })
        .setView([18.7883, 98.9853], 13);

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        .addTo(map);

      // Enable dragging only for two-finger touch
      map.dragging.enable();
      map.dragging.handler?.disable();
      map.on("touchstart", onTouchStart as LeafletEventHandlerFn);

      map.on("mousedown", onMouseDown as LeafletEventHandlerFn);
      map.on("mousemove", onMouseMove as LeafletEventHandlerFn);
      map.on("mouseup", onMouseUp as LeafletEventHandlerFn);
    }
  });

  function onTouchStart(e: LeafletMouseEvent & { touches: any[] }) {
    if (e.touches && e.touches.length === 2) {
      map.dragging.handler.enable();
    }
  }

  function onMouseDown(e: LeafletMouseEvent) {
    isDrawing = true;
    firstPoint = e.latlng;
    updateTempRectangle(e.latlng);
  }

  function onMouseMove(e: LeafletMouseEvent) {
    if (isDrawing && firstPoint) {
      updateTempRectangle(e.latlng);
    }
  }

  function onMouseUp(e: LeafletMouseEvent) {
    if (isDrawing && firstPoint) {
      createFinalRectangle(e.latlng);
      isDrawing = false;
      firstPoint = null;
    }
  }

  function updateTempRectangle(secondPoint: LatLng) {
    if (!map || !firstPoint) return;

    if (tempRectangle) {
      map.removeLayer(tempRectangle);
    }

    const leaflet = (window as any).L; // Access Leaflet globally
    const bounds = leaflet.latLngBounds(firstPoint, secondPoint);
    tempRectangle = leaflet
      .rectangle(bounds, {
        color: "blue",
        weight: 1,
        opacity: 0.5,
        dashArray: "5, 5",
      })
      .addTo(map);
  }

  function createFinalRectangle(secondPoint: LatLng) {
    if (!map || !firstPoint) return;

    if (rectangle) {
      map.removeLayer(rectangle);
    }
    if (tempRectangle) {
      map.removeLayer(tempRectangle);
    }

    const leaflet = (window as any).L; // Access Leaflet globally
    const bounds = leaflet.latLngBounds(firstPoint, secondPoint);
    rectangle = leaflet
      .rectangle(bounds, { color: "blue", weight: 2 })
      .addTo(map);

    const coords = [
      bounds.getNorthWest(),
      bounds.getNorthEast(),
      bounds.getSouthEast(),
      bounds.getSouthWest(),
    ];

    console.log("Square coordinates:", coords);
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

<main>
  <div class="map-container">
    <div bind:this={mapContainer}></div>
  </div>
</main>

<style>
  /* @import "leaflet/dist/leaflet.css"; */
  .map-container {
    width: 100%;
    height: 66.67vh;
  }

  div {
    height: 500px;
  }
</style>
