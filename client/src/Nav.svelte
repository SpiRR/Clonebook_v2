<script>

let src = "http://localhost:5000/images/me.jpg"

import {showPage} from './pageToggle.js'
import {user} from './data.js'

const currentPage = (nameOfPage) => {
  $showPage.pageShown = nameOfPage
}

function logout () {
  window.localStorage.removeItem('token')
  location.href = "http://localhost:80/login"
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
			<img src="http://localhost:5000/images/userImages/{$user.profilepicture}" alt="user"/> 
      <p>{$user.firstName}</p>       
		</div>

    <div class="menu">
      <a id="logout" on:click={logout}><i class="fas fa-sign-out-alt"></i></a>
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
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  grid-gap: 2rem;
  align-items: center;
}

nav div.right img {
  width: 2vw;
  border-radius: 50%;
  height: 4vh;
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

nav div.right div.menu {
  top: -1px;
  left: 20px;
}

nav div.right div.menulist i {
  text-decoration: none;
  text-transform: none;
  font-size: 14px;
  text-align: left;
  left: 14px;
  color:  #1da1f2;
  position: absolute;
  font-weight: 500;
}

nav div.right div.menulist i:active, nav div.right div.menulist i:focus {
  color:  #1da1f2;
}

</style>