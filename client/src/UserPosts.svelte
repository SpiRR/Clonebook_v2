<script>

let src = "../images/me.jpg"

</script>

<!-- -------------------------------- -->

<section>

    <div class="user-posts">
        <div id="mypost">
            <img {src} alt="user"/> 
            <p>User name</p>
            <div id="post">Report writing before I'm gonna throw my code out the window for being a bitch 😂👌
            #webdevelopment #webdeveloper  #reactjs #nodejs #bachelordegree
            </div>
        </div>

        <div id="like">
            <button>Like</button>
            <button>Comment</button>
        </div>

      <div id="comments">
        <img {src} alt="user"/> 
        <p>I feel you!!</p>
      </div>

       <div id="comment-post">
            <img {src} alt="user"/> 
            <input 
            placeholder="Your comment...."/>
            <button> > </button>
        </div>
    </div>

</section>

<!-- -------------------------------- -->

<style>


div.user-posts {
    position: relative;
    top: 150px;
    width: 30vw;
    min-height: 45vh;
    margin-top: 20px;
    background-color: #242526;
    color: white;
    margin-left: auto;
    margin-right: auto;
    border-radius: 20px;
    padding: 10px;
}

div.user-posts p {
    position: relative;
    display: inline-block;
    top: -24px;
    right: -17px;
    
}

div.user-posts div {
    /* background-color: #faf; */
    margin-top: 25px;
    color: #B8BBBF;
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
    margin-left: auto;
    margin-right: auto;
    border-radius: 20px;
    padding: 10px;
    top: -33px;
    left: -18px;
}


div#post {
    margin-bottom: 10px;
}

div#like {
    position: relative;
    text-align: center;
    display: inline-block;
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    top: -9px;
    left: 1px;
    width: 100%;
}

div#like button {
    margin-right: 100px;
    margin-left: 100px;
    margin-top: 10px;
    margin-bottom: 10px;
}

div#comments {
    display: inline-block;
    position: relative; 
    top: 0;
}

div#comments p {
    outline: 1px solid black;
    background-color: black;
    padding: 10px
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
    background-color: #3A3B3C;
    color: #B8BBBF;
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




</style>