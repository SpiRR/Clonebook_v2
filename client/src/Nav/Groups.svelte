<script>
 
import {showPage} from '../pageToggle.js'

</script>

<!-- Groups feed -->
<section style="display: {$showPage.pageShown == 'groups' ? "block" : "none"}">
 
    <div id="group-container">

        <div id="group-posts">
            <img src="./images/nodejs.jpg" alt="point">
            <h4>Node.js Developers</h4>
            <p id="post-message">
            This is a security release.
            Vulnerabilities fixed:
            CVE-2020-8174: napi_get_value_string_*() allows various kinds of memory corruption (High).
            CVE-2020-10531: ICU-20958 Prevent SEGV_MAPERR in append (High).
            CVE-2020-11080: HTTP/2 Large Settings Frame DoS (Low).
            For more info go to <a href="https://nodejs.org/en/blog/">Node.js</a>
            </p>

            <div id="like-counter">
                <i class="far fa-thumbs-up">1 </i>
            </div>

            <div id="like">
                <i class="far fa-thumbs-up">Like </i>
                <i class="far fa-comment">Comment </i>
            </div>

        </div>

        <div id="group-posts">
            <img src="./images/webdev.jpg" alt="point">
            <h4>Web Development</h4>
            <p id="post-message">
            One of the most common problems that I run into when using Redux is trying to figure out why an action is not being captured by a reducer. 
            For someone just getting starting with Redux, debugging this issue can be especially overwhelming because of how Redux manages data flow. 
            Read more on <a href="https://reactjsnews.com/">React News</a>
            </p>

            <div id="like-counter">
                <i class="far fa-thumbs-up">1 </i>
            </div>

            <div id="like">
                <i class="far fa-thumbs-up">Like </i>
                <i class="far fa-comment">Comment </i>
            </div>
        </div>

        <div id="group-posts">
            <img src="./images/dat.jpg" alt="point">
            <h4>Computer Science</h4>
            <p id="post-message">
            Scientists have developed the world's first 3D artificial eye with capabilities better than existing bionic eyes and in some cases, 
            even exceed those of the human eyes, 
            bringing vision to humanoid robots and new hope to patients with visual impairment. 
            For more info to go <a href="https://www.sciencedaily.com/releases/2020/06/200610102726.htm">SciendeDaily</a>
            </p>

            <div id="like-counter">
                <i class="far fa-thumbs-up">1 </i>
            </div>

            <div id="like">
                <i class="far fa-thumbs-up">Like </i>
                <i class="far fa-comment">Comment </i>
            </div>
        </div>

        <div id="group-posts">
            <img src="./images/lol.jpg" alt="point">
            <h4>League of Legends</h4>
            <p id="post-message">
                Happy June! Y'all ready for a summer of fun (safely indoors on League?) <br>
                This patch, we dipped our toe in the usual pool, adjusting some champions that have been standing out, some of whom have been in a rough spot 
                (Akali, Brand, Viktor, Xayah).
            </p>

            <div id="like-counter">
                <i class="far fa-thumbs-up">1 </i>
            </div>

            <div id="like">
                <i class="far fa-thumbs-up">Like </i>
                <i class="far fa-comment">Comment </i>
            </div>
        </div>

        <div id="group-posts">
            <img src="./images/wow.png" alt="point">
            <h4>World of Warcraft</h4>
            <p id="post-message">
                Within war-torn Maldraxxus, might—of all kinds—makes right. Here, in the birthplace of necromantic magic, 
                those who master the powers of death turn legions of ambitious souls into relentless immortal armies.
            </p>

            <div id="like-counter">
                <i class="far fa-thumbs-up">1 </i>
            </div>

            <div id="like">
                <i class="far fa-thumbs-up">Like </i>
                <i class="far fa-comment">Comment </i>
            </div>
        </div>

    </div>
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
    /* border: 1px solid lightgray; */
    padding: 10px;
}

div#group-posts {
    position: relative;
    top: 0;
    width: 40vw;
    height: 30vh;
    background-color: #FAFAFA;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50px;
    border-radius: 25px;
    border: 1px solid lightgray;
    box-shadow: 2px 5px lightgray;
    padding: 10px;
}

div#group-posts img {
    border-radius: 50%;
    margin-right: 10px;
    width: 3vw;
    display: inline-block;
}

div#group-posts h4 {
    position: relative;
    top: -18px;
    display: inline-block;
    border-radius: 50%;
}

div#like-counter {
    position: relative;
    top: 20px;
    left: 60px;
}

div#like {
    cursor: pointer;
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    margin-top: 50px;
    margin-bottom: 10px;
    top: -9px;
    left: 1px;
    width: 100%;
}

div#like i {
    font-size: 20px;
    left: 0;
    position: relative;
}
 
 
.extras {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    bottom: 22px;
    left: -15px;
    position: absolute;
    grid-gap: 5rem;
}


</style>