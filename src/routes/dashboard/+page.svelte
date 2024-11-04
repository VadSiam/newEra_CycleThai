<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import ClimbCategoryFilter from "$lib/ClimbCategoryFilter.svelte";
  import Map from "$lib/Map.svelte";
  import SegmentsTable from "$lib/SegmentsTable.svelte";
  import { signOut } from "@auth/sveltekit/client";

  if (!$page.data.session) {
    goto("/");
  }

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  function formatDistance(meters: number): string {
    return (meters / 1000).toFixed(2) + " km";
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  let activities: any[] = [];
  let climbingEfforts: Record<string, number> | {} = {};
  let loading = false;

  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  const session = writable($page.data.session);
  setContext("session", session);
</script>

{#if $page.data.session}
  <div class="dashboard-container">
    <header>
      <h1>Dashboard</h1>
      <div class="header-buttons">
        <a href="/support" class="button support-button">Support</a>
        <button on:click={handleSignOut} class="button logout-button"
          >Log out</button
        >
      </div>
    </header>
    <main class="dashboard-grid">
      <div class="welcome-section">
        <h3>Welcome, {$page.data.session.user?.name}!</h3>
        <p>You're successfully signed in with Strava.</p>
      </div>

      <div class="map-section">
        <h3>Select area to find segments and push the button then</h3>
        <ClimbCategoryFilter />
        <br />
        <Map />
      </div>

      <div class="segments-section">
        <SegmentsTable />
      </div>

      <div class="fetch-section">
        <form
          method="POST"
          action="?/fetchActivities"
          use:enhance={() => {
            loading = true;
            return async ({ result }) => {
              loading = false;
              if (result.type === "success" && result.data?.climbingEfforts) {
                // @ts-ignore
                activities = result.data?.activities;
                climbingEfforts = result.data?.climbingEfforts;
              }
            };
          }}
        >
          <button type="submit" class="fetch-button" disabled={loading}>
            {loading ? "Fetching..." : "Fetch Your Activities"}
          </button>
        </form>
      </div>

      <div class="climbing-efforts-section">
        <h2>Climbing Efforts</h2>
        {#if Object.keys(climbingEfforts).length > 0}
          <table>
            <thead>
              <tr>
                <th>Distance Category</th>
                <th>Best VAM</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(climbingEfforts) as [category, vam]}
                {@const [distance, climbCat1, climbCat2] = category.split("_")}
                {@const formattedCategory = `${distance}(${climbCat1};${climbCat2})`}
                <tr>
                  <td>{formattedCategory}</td>
                  <td>{vam}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <p>No climbing efforts data available.</p>
        {/if}
      </div>
    </main>
  </div>
{:else}
  <p>Redirecting to login page...</p>
{/if}

<style>
  .dashboard-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 10px;
    }
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .header-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .button {
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .support-button {
    background-color: #4caf50;
    color: white;
    text-transform: uppercase;
  }

  .support-button:hover {
    background-color: #45a049;
  }

  .logout-button {
    background-color: #f44336;
    color: white;
    text-transform: uppercase;
  }

  .logout-button:hover {
    background-color: #d32f2f;
  }

  @media (min-width: 768px) {
    .header-buttons {
      flex-direction: row;
    }
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    background-color: #f0f0f0;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
  }

  h3 {
    margin-top: 0;
  }

  .error {
    color: red;
    font-weight: bold;
  }

  .fetch-button {
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .fetch-button:hover {
    background-color: #45a049;
  }

  .fetch-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  .section {
    margin-bottom: 2rem;
  }

  .dashboard-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .map-section,
    .climbing-efforts-section,
    .fetch-section,
    .segments-section {
      grid-column: span 2;
    }
  }

  .welcome-section,
  .map-section,
  .segments-section,
  .fetch-section,
  .climbing-efforts-section {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
  }
</style>
