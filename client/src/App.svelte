<script >
	import { navOptions } from './Nav.svelte'

	let selected = navOptions[0]
	let intSelected = 0

	function changeComponent(event) {
	selected = navOptions[event.srcElement.id];
	intSelected = event.srcElement.id;
}

		//  {#if option.page == 'Home'}
		// 	<img src="images/home.png" alt="Home"/>
		// {:else if option.page == 'Groups'}
		// 	<img src="images/group.png" alt="Home"/>
		// {:else if option.page == 'Marketplace'}
		// 	<img src="images/basket.png" alt="Home"/>
		// {/if} 

</script>

<!-- -------------------------------- -->

<section>

<nav>

	<div class="left">
		<div class="logo">
			<i class="fab fa-cuttlefish"></i>
		</div>
		<form>
		<input type="text" placeholder="Search on CloneBook"/>
		</form>

		<div id="searchResults"></div>

	</div>

	<div class="middle">

			{#each navOptions as option, i}
			<i class="nav-item">
				<i class={intSelected==i ? "nav-link active p-2 ml-1" : "p-2 ml-1 nav-link"} on:click={changeComponent} id={i} role="tab">{option.page}</i>
			</i>
			{/each}
				<div class="p-2">
					<h1>{selected.page}</h1>
					<!-- this is where our main content is placed -->
					<svelte:component this={selected.component}/>
		</div>

	</div>


	<div class="right">
		<div>
			Stine        
		</div>
		
		<div>
			<i class="fas fa-plus-circle"></i>
		</div>

		<div>
			<i class="far fa-comment-alt"></i>
			<div class="chat-counter">1</div>       
		</div>

		<div>
			<i class="far fa-bell"></i> 
			<div class="notification-counter">5</div>         
		</div>

		<div>
			<i class="fas fa-user"></i>      
		</div>                  
	</div>

</nav>

</section>

<!-- -------------------------------- -->

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

  nav div.left{
  display: grid;
  grid-template-columns: 5fr 10fr;
  grid-gap: 1rem;
  align-items: center;
}

nav .left form {
	display: grid;
grid-template-columns: 1fr 1fr;
}

nav .left form, nav .left form input {
	width: 15vw;
	height: 3vh;
}

nav div.left div.logo{
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
  grid-template-columns: 5fr 5fr 5fr;
  justify-items: center;
  grid-gap: 1rem;
  align-items: center;
  position: relative;
  bottom: -27px;
}
nav div.middle > div{
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  align-items: center;

  position: relative;
  width: 100%;
  height: 100%;
}
nav div.right{
  display: grid;
  grid-template-columns: 8fr 8fr 1fr 1fr 8fr;
  align-items: center;
  grid-gap: 2rem;
  align-items: center;
}


nav div.right > div{
  position: relative;
}
nav div.right > div:last-child{
  text-align: right;
}

nav div.chat-counter{
  display: grid;
  justify-content: center;
  align-content: center;

  position: absolute;
  top: -0.6rem;
  right: -1rem;

  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  background: #f02849;
  border-radius: 50%;
}
nav div.notification-counter{
  display: grid;
  justify-content: center;
  align-content: center;

  position: absolute;
  top: -0.6rem;
  right: -1rem;

  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  background: #f02849;
  border-radius: 50%;

}

.nav-item i {
	cursor: pointer;
}

#searchContainer {
	position: relative;
	float: left;
  }

  div#searchResults {
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
  }

</style>