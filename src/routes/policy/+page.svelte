<script lang="ts">
  function goBack() {
    history.back();
  }
</script>

<main>
  <button on:click={goBack} class="back-button" aria-label="Go back">
    <span class="material-icons">arrow_back</span>
  </button>

  <div class="policy-container">
    <h1>Privacy Policy</h1>

    <section>
      <h2>Data Collection and Usage</h2>
      <p>
        We collect and process your Strava and Garmin activity data solely for
        the purpose of providing you with personalized cycling performance
        analytics. This includes:
      </p>
      <ul>
        <li>Activity data from your Strava and Garmin account</li>
        <li>Segment performance data</li>
        <li>Climbing efforts and achievements</li>
      </ul>
    </section>

    <section>
      <h2>Data Access and Control</h2>
      <p>Your privacy is our top priority:</p>
      <ul>
        <li>Your activity data is visible only to you</li>
        <li>We never share your personal data with third parties</li>
        <li>
          Your data is used exclusively to generate your personal performance
          analytics
        </li>
        <li>
          You can revoke access to your Strava and Garmin data at any time
          through your Strava and Garmin settings
        </li>
      </ul>
    </section>

    <section>
      <h2>Data Storage</h2>
      <p>We store only the minimum necessary data to provide our services:</p>
      <ul>
        <li>Basic profile information for authentication</li>
        <li>Activity records for performance analysis</li>
        <li>Segment achievements for tracking progress</li>
      </ul>
    </section>

    <section>
      <h2>Purpose of Data Processing</h2>
      <p>We process your data to:</p>
      <ul>
        <li>Calculate and display your climbing performance metrics</li>
        <li>Track your progress over time</li>
        <li>Provide personalized segment recommendations</li>
        <li>Help you understand your cycling capabilities better</li>
      </ul>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        If you have any questions about our privacy policy or how we handle your
        data, please contact us at:
      </p>
      <a href="mailto:support@cyclethai.com">support@cyclethai.com</a>
    </section>
  </div>
</main>

<style>
  main {
    padding: 20px;
    position: relative;
  }

  .policy-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    color: #333;
    margin-bottom: 30px;
    text-align: center;
  }

  h2 {
    color: #444;
    margin-top: 30px;
    margin-bottom: 15px;
  }

  section {
    margin-bottom: 40px;
  }

  p {
    line-height: 1.6;
    margin-bottom: 15px;
  }

  ul {
    list-style-type: disc;
    margin-left: 20px;
    margin-bottom: 15px;
  }

  li {
    margin-bottom: 8px;
    line-height: 1.4;
  }

  a {
    color: #fc4c02;
    text-decoration: none;
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

  @media (max-width: 768px) {
    .policy-container {
      padding: 10px;
    }

    h1 {
      font-size: 24px;
    }

    h2 {
      font-size: 20px;
    }
  }
</style>
