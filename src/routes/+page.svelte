<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";
</script>

<header>
  <nav>
    <div class="logo-container">
      <img src="/logo.png" alt="Strava Integration Logo" class="logo" />
    </div>
    <SignIn
      options={{
        redirectTo: "/dashboard",
      }}
      className="sign-in-button"
    >
      <span slot="submitButton">Sign in with Strava</span>
    </SignIn>
    <div class="nav-links">
      <a href="/support" class="support-button">Support</a>
      <a href="/policy" class="policy-button">Privacy Policy</a>
    </div>
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
    text-transform: uppercase;
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

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo-container {
    margin-right: 20px;
  }

  .logo {
    height: 40px;
    width: auto;
  }

  .nav-links {
    display: flex;
    gap: 10px;
  }

  .policy-button {
    background-color: #666;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-decoration: none;
    text-transform: uppercase;
  }

  .policy-button:hover {
    background-color: #555;
  }

  @media (max-width: 768px) {
    nav {
      flex-direction: column;
      gap: 20px;
    }

    .logo-container {
      margin-right: 0;
      margin-bottom: 10px;
    }

    .nav-links {
      flex-direction: column;
    }
  }
</style>
