<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";
</script>

<header>
  <nav>
    <SignIn
      options={{
        redirectTo: "/dashboard",
      }}
      className="sign-in-button"
    >
      <span slot="submitButton">Sign in with Strava</span>
    </SignIn>
  </nav>
</header>

<main>
  <h1>Welcome to Strava Integration</h1>
  <p>Please sign in to access your dashboard.</p>
</main>

<style>
  :global(.sign-in-button) {
    background: none;
    border: none;
    padding: 0;
  }

  :global(.sign-in-button button) {
    background-color: #fc4c02;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  :global(.sign-in-button button:hover) {
    background-color: #e34402;
  }

  main {
    padding: 20px;
    text-align: center;
  }

  h1 {
    margin-bottom: 20px;
  }
</style>
