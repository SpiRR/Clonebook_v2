<script>
 
import {showPage} from '../pageToggle.js'

let src = "http://localhost:5000/images/construction.png"

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
    background-color: #18191A;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    padding: 10px;
}

section img {
    width: 33vw;
}

 
</style>