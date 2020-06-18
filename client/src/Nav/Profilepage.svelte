<script >

import {showPage} from '../pageToggle.js'
import {user} from '../data.js'
import {changeDetails} from '../data.js'

function toggle() {
  const modal = document.getElementById("modal");
  if (modal.style.display === "block") {  
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
  }
} 

function close () {
    const modal = document.getElementById("modal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
  }
}

  // CHANGE YOUR DETAILS
  function updateDetails () {
      console.log('updated')
  }


</script>

<!-- -------------------------------- -->

<section style="display: {$showPage.pageShown == 'profilepage' ? "block" : "none"}">

<div class="profileinfo">
    <img src="http://localhost:5000/images/userImages/{$user.profilepicture}" alt="user"/> 
    <h3>{$user.firstName} {$user.lastName}</h3>

    <button on:click={toggle}><i class="fas fa-cog"></i></button>

    <div id="modal">
        <div class="modal-header">
            <h3>Update you info</h3>
            <button on:click={close}><i class="fas fa-times"></i></button>
        </div>
        <form class="modal-body">
            <input type="text" value={$user.firstName} name="firstName">
            <input type="text" value={$user.lastName} name="lastName">
            <input type="email" value={$user.email} disabled>
            <button type="button" on:click={updateDetails}>Update</button>
        </form>
    </div>



</div>

</section>

<!-- -------------------------------- -->

<style>

section {
    background-image: url("../images/bg.jpg");
    position: relative;
    top: 150px;
    width: 55vw;
    height: 28vh;
    background-color: #FAFAFA;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    border: 1px solid lightgray;
    padding: 10px;
}

#modal {
    position: fixed;
    top: 29%;
    left: 43%;
    text-align: center;
    background-color: #FAFAFA;
    max-width: 15vw;
    width: 15vw;
    height: 31vh;
    margin-top: 20px;
    display: none;
    border: 1px solid lightgray;
    border-radius: 10px;
    }

.modal-header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid lightgray; 
}

.modal-header h3 {
    font-size: 17px;
}

.modal-header button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    display: inline-block;
    left: -18px;
    position: relative;
    top: -14px;
}

.modal-body {
    padding: 10px 15px;
}

.modal-body button {
    margin-left: auto;
    margin-right: auto;
    display: block;
    cursor: pointer;
    border: none;
    outline: none;
    background: #3FB227;
    color: white;
    width: 76%;
    border-radius: 4px;
    margin-top: 25px;
    height: 3vh;
}

.modal-body input {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 12px;
    height: 3vh;
    font-weight: 500;
}

.profileinfo {
    position: absolute;
    display: inline-block;
    width: 100%;
    top: 150px;
}

.profileinfo img{
    display: block;
    position: relative;
    width: 10vw;
    border-radius: 50%;
    margin-left: auto;
    margin-right: auto;
    border: 3px solid white;
}

.profileinfo h3 {
    display: block;
    margin-top: 17px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

.profileinfo .fas {
    position: absolute;
    margin-right: auto;
    margin-left: auto;
    display: block;
    text-align: center;
    width: 100%;
    margin-top: 16px;
    cursor: pointer;
}

</style>