<!-- JavaScript -->
<script>

import ChatContainer, {addChatWindow} from "./ChatContainer.svelte"
// Hardcoded values to test
	let ajFriends =[
        {"id":"1", "name":"X", "lastName":"AA"},
        {"id":"2", "name":"Y", "lastName":"BB"},
        {"id":"3", "name":"Z", "lastName":"CC"}
    ]

    function showChatWindow () {
        addChatWindow()
    }

    // Connecting to the API

</script>


<!-- HTML -->
<main>

	<section id="contacts">
        Contacts
        {#each ajFriends as jFriend}
            <div class="friend" on:click="{showChatWindow}">{jFriend.name} {jFriend.lastName}</div>
        {/each}
    </section>

</main>


<!-- Style to this component -->
<style>

    section#contacts {
        position: fixed;
        padding-left: 0.6rem;
        background-color: rgb(202, 193, 202);
        width: 20vw;
        height: 100%;
        top: 0;
        right: 0;
    }

    div.friend {
        cursor: pointer;
    }

</style>