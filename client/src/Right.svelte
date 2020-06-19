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
    section {
        background-color: #18191A;
    }

    section#contacts {
        position: fixed;
        padding-left: 0.6rem;
        width: 17vw;
        height: 93%;
        bottom: 0;
        right: 0;
    }

    section#contacts h3 {
       color: #E4E6EB;
       margin-top: 25px;
       margin-left: 10px;
        margin-bottom: 25px;
        font-weight: 600;
    }

    section#contacts .friend {
        margin-left: 10px;
        cursor: pointer;
        color: #E4E6EB
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
        font-size: 16px;
        position: relative;
        display: inline-block;
        top: -5px;
        margin-left: 10px;
        font-weight: 500;
    }

</style>