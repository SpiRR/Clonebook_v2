<script>
 
import {showPage} from '../pageToggle.js'

let src = "./images/construction.png"

</script>

<!-- Market place -->
<section style="display: {$showPage.pageShown == 'marketplace' ? "block" : "none"}">

    <img src={src} alt="">
</section>


<style>

section {
    position: relative;
    top: 150px;
    width: 40vw;
    height: 14vh;
    background-color: #FAFAFA;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    padding: 10px;
}

section img {
    width: 33vw;
}

 
</style>