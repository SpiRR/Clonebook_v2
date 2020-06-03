<script>
  // Server
  let ajUsers = [];

  let searchResultsDisplay = "none";

  function showSearchResults() {
    searchResultsDisplay = "grid";
  }

  // Arrow function
  const hideSearchResults = () => {
    searchResultsDisplay = "none";
  };

  // Connect to API and get the data
  const getData = async () => {
    ajUsers = [];

    // Get fresh data from API
    let connection = await fetch("http://localhost:9090/users");
    let data = await connection.json();
    ajUsers = data;

    showSearchResults();
  };
</script>

<style>
  nav {
    display: grid;
    grid-template-columns: 100fr 100fr;
    align-items: center;
    width: 100%;
    height: 3rem;
    padding: 0px 10vw;
    background-color: #4267b2;
    color: white;
  }

  div#searchContainer {
    position: relative;
  }

  div#searchResults {
    position: absolute;
    width: 100%;
    margin-top: -0.1rem;
    height: 20vh;
    padding: 0.2rem;
    background-color: white;
    color: #333;
    border: 1px solid #111;
    border-top: none;
  }
</style>

<!-- JavaScript -->
<!-- HTML -->
<nav>
  <div>Clonebook</div>

  <div id="searchContainer">

    <form>
      <input
        type="text"
        placeholder="Search on CloneBook"
        on:focus={getData}
        on:blur={hideSearchResults} />
    </form>

    <div id="searchResults" style="display: {searchResultsDisplay}">
      {#each ajUsers as jUser}
        <div>{jUser.name} {jUser.lastName}</div>
      {/each}
    </div>

  </div>

</nav>

<!-- Style to this component -->
