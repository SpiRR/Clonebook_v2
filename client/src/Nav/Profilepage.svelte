<script >

import {showPage} from '../pageToggle.js'
let src = "./images/me.jpg"

</script>

<!-- -------------------------------- -->

<section style="display: {$showPage.pageShown == 'profilepage' ? "block" : "none"}">

<div class="profileinfo">
    <img {src} alt="user"/> 
    <h3>Stine Knarkegaard Andersen</h3>
    <i class="fas fa-cog"></i>   
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
    background-color: #FAFAFA;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    border: 1px solid lightgray;
    padding: 10px;
}

.cover {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    display: block;
    font-style: italic;
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
    border: 3px solid white;
}

.profileinfo h3 {
    display: block;
    margin-top: 17px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

.profileinfo .fas {
    position: absolute;
    margin-right: auto;
    margin-left: auto;
    display: block;
    text-align: center;
    width: 100%;
    margin-top: 16px;
    cursor: pointer;
}

</style>