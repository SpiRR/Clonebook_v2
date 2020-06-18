<script>

import {post} from './data.js'
import {user} from './data.js'



</script>

<!-- -------------------------------- -->

<section>

    <div class="user-posts">
        <div id="mypost">
             <img src="" alt="user"/> <!--friend img -->
            <p></p> <!--friend name -->
            <div id="post"> <!--friend post -->
                
            </div>
        </div>

        <div id="like-counter">
            <i class="far fa-thumbs-up">1 </i>
        </div>

        <div id="like">
            <i class="far fa-thumbs-up">Like </i>
            <i class="far fa-comment">Comment </i>
        </div>

      <!-- <div id="comments">
        <img {src} alt="user"/> 
        <p>I feel you!!</p>
      </div>

       <div id="comment-post">
            <img {src} alt="user"/> 
            <input 
            placeholder="Your comment...."/>
            <button> > </button>
        </div> -->
    </div>

</section>

<!-- -------------------------------- -->

<style>


div.user-posts {
    position: relative;
    width: 40vw;
    height: 30vh;
    margin-top: 200px;
    background-color: #FAFAFA;
    color: white;
    margin-left: auto;
    margin-right: auto;
    border-radius: 20px;
    padding: 20px 0px;
    border: 1px solid lightgray;
    box-shadow: 2px 5px lightgray;
}

div.user-posts p {
    position: relative;
    display: inline-block;
    top: -24px;
    right: -17px;
    color: black;
}

div.user-posts div {
    margin-top: 25px;
    color: black;
    width: 28vw;
    top: 60px;
    left: 30px;
    position: absolute;
}
div.user-posts #mypost img {
    width: 3vw;
    border-radius: 50%
}

div#mypost {
    position: relative;
    color: white;
    border-radius: 20px;
    padding: 10px;
    top: -33px;
    width: 100%;
    margin-left: -19px;
}


div#post {
    margin-bottom: 10px;
    margin-left: -15px;
    width: 90%;
}

div#like-counter {
    position: relative;
    top: 20px;
    left: 30px;
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

/* div#comments {
    display: inline-block;
    position: relative;
    top: 0;
}

div#comments p {
    outline: 1px solid lightgray;
    background-color: #FAFAFA;
    padding: 10px;
    color: black;
    border-radius: 25px;
}

div#comments img {
    width: 1vw;
    border-radius: 25px;
}

div#comment-post {
    position: relative;
    bottom: 0;
    left: 5px;
}

div#comment-post input{
    position: relative;
    background-color: #FAFAFA;
    color: black;
    border-radius: 25px;
    width: 23vw;
    height: 3vh;
    left: 10px;
    bottom: 15px;
}

div#comment-post img {
    width: 2vw;
    border-radius: 25px;
}

div#comment-post button {
    position: relative;
    display: inline-block;
    right: -30px;
    bottom: 12px;
}
 */
</style>