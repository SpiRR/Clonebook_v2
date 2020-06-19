<script>

let markiplier = "http://localhost:5000/images/markiplier.jpg"
let lixiantv = "http://localhost:5000/images/lixiantv.jpg"
import {showPage} from '../pageToggle.js'

const currentPage = (nameOfPage) => {
  $showPage.pageShown = nameOfPage
}

</script>

<!-- ---------------------------------->

<section style="display: {$showPage.pageShown == 'videos' ? "block" : "none"}">
    <div id="video-container">
        
        <div class="vidoes">
        <img src={lixiantv} alt="markiplier">
            <h4>LixianTV</h4>
            <p>Hey guys, it's been a while I know, starting this week I'll be posting weekly animations!</p>

           <iframe class="vids" title="" width="560" height="315" src="https://www.youtube.com/embed/CN34Fjh0c6c" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>

        <div id="like-counter">
            <i class="far fa-thumbs-up">103.000 </i>
        </div>

        <div id="comment-counter">
            <i class="far fa-comment">30.957 </i>
        </div>

        <div id="like">
            <i class="far fa-thumbs-up"> </i>
            <i class="far fa-comment"> </i>
        </div>

    </div>

        <div id="video-container">
        
        <div class="vidoes">
        <img src={markiplier} alt="markiplier">
            <h4>Markiplier</h4>
            <p>It's time for yet another Random Horror Reaction Compilation chock full of scary and funny moments!</p>

           <iframe class="vids" title="" width="560" height="315" src="https://www.youtube.com/embed/R_AXogxHGDo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>

        <div id="like-counter">
            <i class="far fa-thumbs-up">13.050 </i>
        </div>

        <div id="comment-counter">
            <i class="far fa-comment">37.957 </i>
        </div>

        <div id="like">
            <i class="far fa-thumbs-up"> </i>
            <i class="far fa-comment"> </i>
        </div>

    </div>

</section>

<!-- ---------------------------------->

<style>

div#video-container {
    position: relative;
    top: 160px;
    width: 40vw;
    height: auto;
    background-color: #242527;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50px;
    border-radius: 25px;
    border: 1px solid #3E4042;
    padding: 14px 20px;
}

div.vidoes h4 {
    color: #E4E6EB;
    display: inline-block;
    position: relative;
    font-weight: 600;
    top: -17px;
}

div.vidoes p {
    color: #E4E6EB;
    display: block;
    position: relative;
    margin-left: 64px;
    margin-bottom: 25px;
    font-size: 16px;

}

div.vidoes img {
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
    width: 3vw;
    display: inline-block;
    height: 6vh;
}

.vids {
    display: block;
    margin-left: auto;
    margin-right: auto;
}



div#comment-counter{
    position: relative;
    color: #0084FF;
    left: 116px;
    float: left;
    top: -2px;
}

#like-counter {
    position: relative;
    color: #0084FF;
    top: 17px;
    left: 48px;
}

#like {
    border-top: 1px solid #3E4042;
    border-bottom: 1px solid #3E4042;
    color: #0084FF;
    cursor: pointer;
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    padding: 6px;
    margin-top: 39px;
    top: -9px;
    left: 1px;
    width: 100%;
}

/* div#like i {
    font-size: 20px;
    left: 0;
    position: relative;
} */
</style>