<script lang="ts">
  const supportEmail = "support@cyclethai.com";

  function goBack() {
    history.back();
  }
</script>

<main>
  <button on:click={goBack} class="back-button" aria-label="Go back">
    <span class="material-icons">arrow_back</span>
  </button>
  <h1>Support</h1>
  <p>For support, please write to us at this email address:</p>
  <a href="mailto:{supportEmail}">{supportEmail}</a>
</main>

<style>
  main {
    padding: 20px;
    text-align: center;
    position: relative;
  }

  h1 {
    margin-bottom: 20px;
  }

  a {
    color: #fc4c02;
    text-decoration: none;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }

  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
  }

  .material-icons {
    font-size: 24px;
    color: #4caf50;
  }
</style>
