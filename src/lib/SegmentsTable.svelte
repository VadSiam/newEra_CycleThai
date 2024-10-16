<script lang="ts">
  import { onMount } from "svelte";
  import type { Segment } from "../routes/api/fetchSegments/+server";
  import { rectangleCoords } from "./stores/mapStore";

  let segments: Segment[] = [];
  let loading = false;
  let error: string | null = null;
  let lastFetchedCoords: number[] | null = null;
  let showButton = true;
  let showTable = false;

  onMount(() => {
    return rectangleCoords.subscribe((coords) => {
      if (
        coords &&
        (!lastFetchedCoords || !arraysEqual(coords.flat(), lastFetchedCoords))
      ) {
        showButton = true;
        showTable = false;
      }
    });
  });

  function arraysEqual(a: number[], b: number[]) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  function sortSegmentsByDistance(segs: Segment[]): Segment[] {
    return segs.sort((a, b) => a.distance - b.distance);
  }

  async function fetchSegments() {
    if (!$rectangleCoords) {
      error = "Please select an area on the map first.";
      return;
    }

    loading = true;
    error = null;
    showButton = false;
    showTable = false;

    const [sw, ne] = $rectangleCoords;
    const coords = [...sw, ...ne];

    try {
      const response = await fetch("/api/fetchSegments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coords }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      segments = await response.json();
      lastFetchedCoords = coords;
      showTable = true;
    } catch (e) {
      console.error("Failed to fetch segments:", e);
      error = "Failed to fetch segments. Please try again.";
      showButton = true;
    } finally {
      loading = false;
    }
  }
</script>

<div>
  {#if showTable && segments.length > 0}
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table
        class="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Distance</th>
            <th scope="col" class="px-6 py-3">VAM(KOM)</th>
            <th scope="col" class="px-6 py-3">Climb cat.</th>
            <th scope="col" class="px-6 py-3">Elevation</th>
            <th scope="col" class="px-6 py-3">Avg grade</th>
            <th scope="col" class="px-6 py-3">KOM/QOM</th>
          </tr>
        </thead>
        <tbody>
          {#each sortSegmentsByDistance(segments) as segment (segment.id)}
            <tr
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-green-600 whitespace-nowrap dark:text-green-700"
              >
                <a
                  href={`https://www.strava.com/segments/${segment.id}?filter=overall`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {segment.name}
                </a>
              </th>
              <td class="px-6 py-4">{segment.distance}</td>
              <td class="px-6 py-4">{segment.kVAM}</td>
              <td class="px-6 py-4">{segment.category}</td>
              <td class="px-6 py-4">{segment.elevationGain}</td>
              <td class="px-6 py-4">{segment.averageGrade}</td>
              <td class="px-6 py-4">{segment.time ?? 0}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  <button
    on:click={fetchSegments}
    type="button"
    class="fetch-button"
    disabled={loading || !$rectangleCoords || !showButton}
  >
    {loading ? "Loading..." : "GET SEGMENTS"}
  </button>

  {#if error}
    <p class="text-red-500">{error}</p>
  {/if}

  {#if loading}
    <p>Loading segments...</p>
  {/if}
</div>

<style>
  .fetch-button {
    padding: 8px 16px;
    background-color: #4c4faf;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background-color 0.3s ease;
  }

  .fetch-button:hover:not(:disabled) {
    background-color: #3a3d8c;
  }

  .fetch-button:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .relative {
      overflow-x: auto;
    }

    table {
      font-size: 12px;
    }

    th,
    td {
      padding: 4px;
    }
  }
</style>
