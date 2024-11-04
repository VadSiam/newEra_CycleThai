<script lang="ts">
  import { selectedClimbCategories } from "./stores/mapStore";

  const categoryMapping = [
    { display: "4 (easiest)", internal: 1 },
    { display: "3", internal: 2 },
    { display: "2", internal: 3 },
    { display: "1", internal: 4 },
    { display: "HC (hardest)", internal: 5 },
  ];

  let minDisplayCategory = "4 (easiest)";
  let maxDisplayCategory = "HC (hardest)";

  function handleRangeChange() {
    const minInternal =
      categoryMapping.find((c) => c.display === minDisplayCategory)?.internal ||
      1;
    const maxInternal =
      categoryMapping.find((c) => c.display === maxDisplayCategory)?.internal ||
      5;

    // Ensure correct order for internal values (remember: 5 is HC, 1 is Cat 4)
    const actualMin = Math.min(minInternal, maxInternal);
    const actualMax = Math.max(minInternal, maxInternal);

    // Create array of internal category numbers
    const categories = Array.from(
      { length: actualMax - actualMin + 1 },
      (_, i) => actualMin + i,
    );

    selectedClimbCategories.set(categories);
  }
</script>

<div class="flex items-center gap-4 mb-4">
  <label class="flex items-center gap-2">
    <span class="text-sm font-medium text-gray-700">From</span>
    <select
      bind:value={minDisplayCategory}
      on:change={handleRangeChange}
      class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
    >
      {#each categoryMapping as { display }}
        <option value={display}>{display}</option>
      {/each}
    </select>
  </label>

  <label class="flex items-center gap-2">
    <span class="text-sm font-medium text-gray-700">To</span>
    <select
      bind:value={maxDisplayCategory}
      on:change={handleRangeChange}
      class="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
    >
      {#each categoryMapping as { display }}
        <option value={display}>{display}</option>
      {/each}
    </select>
  </label>
</div>
