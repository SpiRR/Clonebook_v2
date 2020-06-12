<script >

  import Nav from './Nav.svelte'
  import Home from './nav/Home.svelte'
  import Groups from './nav/Groups.svelte'
  import Marketplace from './nav/Marketplace.svelte'

  import Profilepage from './Nav/Profilepage.svelte'

  import Right from './Right.svelte'
  import Left from './Left.svelte'
  import ChatContainer from './ChatContainer.svelte'
  import OpenChatContainer from './OpenChatContainer.svelte'

  import {showPage} from './pageToggle.js'

</script>

<!-- -------------------------------- -->

<section>

  {#if $showPage.pageShown != 'profilepage'}
    <Left/>
    <Right/>
  {/if}

  <Nav />
  <Home />
  <Groups />
  <Marketplace />

  <Profilepage />
  <ChatContainer />
  <OpenChatContainer />

</section>

<!-- -------------------------------- -->

<style>

</style>