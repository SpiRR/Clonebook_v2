<script>

let src = "./images/me.jpg"

import {showPage} from './pageToggle.js'

const currentPage = (nameOfPage) => {
  $showPage.pageShown = nameOfPage
}

</script>



<!-- JavaScript -->
<!-- HTML -->
<nav>

	<div class="left">
		<div class="logo">
			<i class="fab fa-cuttlefish"></i>
		</div>

		<form>
		  <input type="text" placeholder="Search on CloneBook"/>
		</form>

		<!-- <div id="searchResults"></div> -->

	</div>

	<div class="middle">
    <div on:click={() => { currentPage('home') }}>
      <i class="fas fa-home"></i>
    </div>

    <div on:click={() => { currentPage('groups') }}>
      <i class="fas fa-users"></i>
    </div>  

    <div on:click={() => { currentPage('videos') }}>
      <i class="fas fa-video"></i>
    </div>  

    <div on:click={() => { currentPage('marketplace') }}>
      <i class="fas fa-shopping-basket"></i>
    </div> 

	</div>

	<div class="right">
		<div class="profilelink" on:click={() => { currentPage('profilepage') }}>
			<img {src} alt="user"/> 
      <p>Stine</p>        
		</div>

	</div>

</nav>

<!-- Style to this component -->
<style>

  nav {
  display: grid;
  grid-template-columns: 25fr 40fr 10fr;
  grid-gap: 2rem;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 4rem;
  padding: 0px 2vw;
  font-size: 1.5rem;
  color: #555;
  background: white;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
  z-index: 1;
  }

  nav .left{
  display: grid;
  grid-template-columns: 100px 1fr;
  justify-content: center;
  align-items: center;
  max-width: 350px;
}

nav .left form {
	display: grid;
  grid-template-columns: 1fr 1fr;
}

nav .left form, nav .left form input {
	width: 15vw;
	height: 3vh;
}

nav .left form input {
  margin-left: 70px;
}

nav .left .logo{
  position: absolute;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  grid-gap: 0.5rem;
  font-weight: 400;
  color: #1da1f2;
}

nav div.middle{
  display: grid;
  grid-template-columns: 5fr 5fr 5fr 5fr;
  justify-items: center;
  grid-gap: 1rem;
  align-items: center;
  position: relative;
  left: -164px;
}

nav div.middle > div{
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  align-items: center;
cursor: pointer;
  position: relative;
  width: 100%;
  height: 100%;
}

nav .middle div:active {
  border-bottom: 2px solid #1da1f2;
}

nav .middle div:focus {
  color: lightskyblue;
}


nav .middle div:hover {
  background-color: #e7e7e7;
  color: lightskyblue;
}

nav div.right{
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  grid-gap: 2rem;
  align-items: center;
}

nav div.right img {
  width: 2vw;
  border-radius: 50%;
}

nav div.right .profilelink {
  display: grid;
  font-size: 17px;
  grid-template-columns: 2fr 5fr;
  grid-gap: 1rem;
  cursor: pointer;
}

nav div.right .profilelink {
  position: relative;
}

nav div.right .profilelink p{
  top: 6px;
  right: 10px;
  position: relative;
}

nav div.right > div{
  position: relative;
}
nav div.right > div:last-child{
  text-align: right;
}



  /* div#searchResults {
    position: absolute;
    width: 8%;
    margin-top: -0.1rem;
    height: 20vh;
    padding: 0.2rem;
    background-color: white;
    color: #333;
    border: 1px solid #111;
    border-top: none;
    display: none;
  } */

</style>