<script >

import {showPage} from '../pageToggle.js'
let src = "./images/me.jpg"

</script>

<!-- -------------------------------- -->

<section style="display: {$showPage.pageShown == 'profilepage' ? "block" : "none"}">

<div class="profileinfo">
    <img {src} alt="user"/> 
    <h5>Stine Knarkegaard Andersen</h5>   
</div>

</section>

<!-- -------------------------------- -->

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
    border: 1px solid lightgray;
    padding: 10px;
}

</style>