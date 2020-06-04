<script>
 
</script>



<!-- JavaScript -->
<!-- HTML -->
<nav>
  <div>Clonebook</div>

  <div id="searchContainer">

    <form>
      <input
        type="text"
        placeholder="Search on CloneBook"
        />
    </form>

    <div id="searchResults">
    
    </div>

    <div id="icons">
      <a href="#"> 1 </a>
      <a href="#"> 2 </a>
      <a href="#"> 3 </a>
    </div>

  </div>

</nav>

<!-- Style to this component -->
<style>
  nav {
    /* display: grid;
    grid-template-columns: 100fr 100fr; */
    align-items: center;
    width: 100%;
    height: 3rem;
    padding: 0px 10vw;
    background-color: #242526;
    color: white;
    top: 0;
    left: 0;
    position: fixed;
  }

  div#searchContainer {
    position: relative;
  }

  div#searchContainer form input {
    border-radius: 25px;
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
    display: none;
  }

  div#icons {
    position: relative;
    top: -25px;
    left: 250px;
  }

  div#icons a {
    color: white;
    padding: 50px;
  }
</style>