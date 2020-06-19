<script>

import {user} from './data.js'
import {post} from './data.js'

let postmsg = ''
  // CREATE A POST
const createAPost = (async () => {
    let formData = new FormData()
    formData.append('postmsg', postmsg)

    const connection = await fetch("/create-post",  
    {
        method: 'post',
        credentials: 'include', 
        body: formData,
        headers: {"token": localStorage.token}
        })
    let response = await connection.json()
    console.log(response)
    $post = response

    document.querySelector("#status").reset()
    console.log($post)
})

</script>

<!-- ---------------------------------->

<section>
<div id="post-container">
    
    <img src="http://localhost:5000/images/userImages/{$user.profilepicture}" alt="user"/> 

        <form id="status" on:submit|preventDefault={createAPost}>
            <input placeholder="What's on your mind?" type="text" name="postmsg" bind:value="{postmsg}"/>
            <button><i class="fas fa-paper-plane"></i></button>
        </form>

    <div class="extras">
        <i class="fab fa-youtube"><p>Video</p></i>
        <i class="far fa-images"><p>Images</p></i>   
        <i class="far fa-surprise"><p>Surprise</p></i> 
    </div>
</div>

</section>

<!-- ---------------------------------->

<style>

section {
    background-color: #18191A;
}

div#post-container {
    position: relative;
    top: 160px;
    width: 40vw;
    height: 14vh;
    background-color: #242527;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 150px;
    border-radius: 25px;
    border: 1px solid #3E4042;
    padding: 10px;
}

div#post-container img {
    width: 3vw;
    height: 6vh;
    border-radius: 50%;
    margin-left: 12px;
    margin-top: 4px;
}

div#post-container input {
    background-color: #3A3B3C;
    color: #E4E6EB;
    border-radius: 20px;
    width: 30vw;
    padding: 8px;
    display: inline-block;
    top: 20px;
    position: absolute;
    left: 95px;
}

div#post-container form i {
    display: inline-block;
    position: absolute;
    font-size: 20px;
    top: 26px;
    right: 36px;
}

div#post-container i {
    cursor: pointer;
    position: relative;
    margin-left: auto;
    margin-right: auto;
    font-size: 20px;
    right: -107px;
}

.fas.fa-paper-plane {
    color: #0084FF;
}

.extras {
    display: grid;
    grid-template-columns: 1fr 5fr 1fr;
    bottom: 22px;
    left: 24px;
    position: absolute;
    /* grid-gap: 5rem; */
}

.extras p {
    color: white;
    font-size: 14px;
    display: inline-block;
    padding-left: 5px;
}

.extras .fa-youtube {
    color: red;
    background-color: #3A3B3C;
    font-size: 20px;
}
.extras .fa-images {
    font-size: 20px;
    background-color: #3A3B3C;
    color: #0084FF;
}
.extras .fa-surprise {
    font-size: 20px;
    background-color: #3A3B3C;
    color: green;
}

</style>