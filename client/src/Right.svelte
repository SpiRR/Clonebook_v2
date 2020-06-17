<!-- JavaScript -->
<script>
  import {user} from './data.js'

</script>


<!-- HTML -->
<main>

	<section id="contacts">
    <h3>Contacts</h3>

       <div class="friend">
       {#each $user.friends as friend}
        <li>
            <img src="http://localhost:5000/images/userImages/{friend.profilepicture}" alt="user"/>
            <p>{friend.firstName} {friend.lastName}</p>

        </li>
       {/each}
       </div>
    </section>

</main>

<!-- Style to this component -->
<style>

    section#contacts {
    position: fixed;
    padding-left: 0.6rem;
    width: 17vw;
    height: 91%;
    bottom: 0;
    right: 0;
    }

    section#contacts h3 {
        color: grey;
    }

    section#contacts .friend {
        cursor: pointer;
        color: black;
    }

    section#contacts .friend img {
        position: relative;
        top: 10px;
        width: 2vw;
        height: 4vh;
        border-radius: 50%;
    }

    section#contacts li {
        list-style: none;
        margin-bottom: 15px;
    }

    section#contacts .friend p {
        position: relative;
        display: inline-block;
        top: -5px;
        margin-left: 10px;
    }

</style>