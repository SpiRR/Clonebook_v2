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

                
                <p id="like-counter">
                    <i class="far fa-thumbs-up">1 </i>
                </p>

                <p id="like">
                    <i class="far fa-thumbs-up"></i>
                    <i class="far fa-comment"></i>
                </p>
            </div>
        {/each}

</section>

<!-- -------------------------------- -->

<style>


div.user-posts {
   position: relative;
    top: 35px;
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

div.user-posts p {
    position: relative;
    display: inline-block;
    top: -24px;
    right: -17px;
    color: #E4E6EB;
    font-weight: 600;
}

div.user-posts div {
    margin-top: 25px;
    color: #E4E6EB;
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
    margin-left: -23px;
    width: 90%;
    font-size: 16px;
    top: 55px;
}

#like-counter {
    position: relative;
    color: #0084FF;
    top: 17px;
    left: 17px;
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
/* 
#like i {
    font-size: 20px;
    left: 0;
    position: relative;
} */
</style>