<script>

import {post} from './data.js'
import {user} from './data.js'

const fetchUserPosts = (async () => {
    const connection = await fetch("/posts", 
    {
        method: 'get',
        credentials: 'include', 
        headers: 
        {"token": localStorage.token}
    })
    let response = await connection.json()
    $post = response
    // console.log($post)
})()

</script>

<!-- -------------------------------- -->

<section>

        {#each $post.reverse() as userPost}
        <div class="user-posts">
            <div id="mypost">
                <img src="http://localhost:5000/images/userImages/{userPost.author.author_img}" alt="user"/> <!--friend img -->
                    <p>{userPost.author.author_firstName} {userPost.author.author_lastName}</p> <!--friend name -->
                <div id="post">{userPost.post}</div>
            </div>
            <div id="like-counter">
                <i class="far fa-thumbs-up">1 </i>
            </div>

            <div id="like">
                <i class="far fa-thumbs-up"></i>
                <i class="far fa-comment"></i>
            </div>
        </div>
        {/each}

</section>

<!-- -------------------------------- -->

<style>


div.user-posts {
    position: relative;
    width: 40vw;
    height: auto;
    background-color: #FAFAFA;
    color: white;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 30px;
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
    font-weight: 600;
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
    margin-left: 50px;
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
    top: -9px;
    left: 1px;
    width: 100%;
}

div#like i {
    font-size: 20px;
    left: 0;
    position: relative;
}
</style>