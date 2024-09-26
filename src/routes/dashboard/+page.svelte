<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
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
      <button on:click={handleSignOut} class="logout-button">Log out</button>
    </header>
    <main>
      <p>Welcome, {$page.data.session.user?.name}!</p>
      <p>You're successfully signed in with Strava.</p>

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
          {loading ? "Fetching..." : "Fetch Activities and Segments"}
        </button>
      </form>

      <h2>Your Last 3 Activities</h2>
      {#if activities.length > 0}
        <ul>
          {#each activities as activity}
            <li>
              <h3>{activity.name}</h3>
              <p>Type: {activity.type}</p>
              <p>Distance: {formatDistance(activity.distance)}</p>
              <p>Duration: {formatTime(activity.elapsed_time)}</p>
              <p>Elevation Gain: {activity.elevation_gain.toFixed(2)} m</p>
              <p>Date: {new Date(activity.start_date).toLocaleDateString()}</p>
            </li>
          {/each}
        </ul>
      {:else}
        <p>
          No activities fetched yet. Click the button above to fetch your
          activities and segments.
        </p>
      {/if}

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
              <tr>
                <td>{category}</td>
                <td>{vam}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No climbing efforts data available.</p>
      {/if}
      <Map />
      <SegmentsTable />
    </main>
  </div>
{:else}
  <p>Redirecting to login page...</p>
{/if}

<style>
  .dashboard-container {
    padding: 20px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .logout-button {
    padding: 8px 16px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .logout-button:hover {
    background-color: #d32f2f;
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
</style>
