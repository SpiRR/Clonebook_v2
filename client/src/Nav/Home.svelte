<script>
 
  import Posts from '../Posts.svelte'
  import UserPosts from '../UserPosts.svelte'

import {showPage} from '../pageToggle.js'

</script>

<section style="display: {$showPage.pageShown == 'home' ? "block" : "none"}">
Home

<Posts />
<UserPosts />
</section>


<style>


 
</style>