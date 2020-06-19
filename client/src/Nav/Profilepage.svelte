<script >

import {showPage} from '../pageToggle.js'
import {user} from '../data.js'

$: firstName = $user.firstName
$: lastName = $user.lastName

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
  async function updateDetails () {
    let formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)

    
    const connection = await fetch('/edit', 
    {   
        method: 'post', 
        credentials: 'include', 
        body: formData,     
        headers:{"token": localStorage.token}
    })
    let response = await connection.json()
    $user = response
    close()
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
        <form class="modal-body" on:submit|preventDefault={updateDetails}>
            <input type="text" value={firstName} on:input={e => firstName = e.target.value} name="firstName">
            <input type="text" value={lastName} on:input={e => lastName = e.target.value} name="lastName">
            <input type="email" value={$user.email} name="email" disabled>
            <button>Update</button>
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
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    border: 1px solid #3E4042;
    padding: 10px;
}

#modal {
    position: fixed;
    top: 29%;
    left: 43%;
    text-align: center;
    color: #E4E6EB;
    background-color: #18191A;
    max-width: 15vw;
    width: 15vw;
    height: 31vh;
    margin-top: 20px;
    display: none;
    border: 1px solid #3E4042;
    border-radius: 10px;
    }

.modal-header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #3E4042; 
}

.modal-header h3 {
    font-size: 17px;
    color: #E4E6EB;
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
    color: #E4E6EB;
    width: 76%;
    border-radius: 4px;
    margin-top: 25px;
    height: 3vh;
}

.modal-body input {
    display: block;
    color: #E4E6EB;
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

}

.profileinfo h3 {
    color: #E4E6EB;
    display: block;
    margin-top: 17px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

.profileinfo .fas {
    position: absolute;
    color: #E4E6EB;
    margin-right: auto;
    margin-left: auto;
    display: block;
    text-align: center;
    width: 100%;
    margin-top: 16px;
    cursor: pointer;
}

button {    
    cursor: pointer;
    border: none;
    outline: none;
}

</style>