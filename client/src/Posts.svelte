<script>

let src = "./images/me.jpg"

</script>

<!-- -------------------------------- -->

<section>
    <div id="post-container">
    
    <img {src} alt="user"/> 

        <form action="">
            <input 
                placeholder="What's on your mind?"
            />
            <button>Post</button>
        </form>

            <button>Photo / Video</button>
            <button>Tag a friend</button>
            <button>Something</button>
    </div>

</section>

<!-- -------------------------------- -->

<style>

div#post-container {
    position: relative;
    top: 150px;
    width: 30vw;
    height: 10vh;
    background-color: #242526;
    margin-left: auto;
    margin-right: auto;
    border-radius: 20px;
    padding: 10px;
}

div#post-container img {
    width: 3vw;
    border-radius: 50%
}

div#post-container input {
    background-color: #3A3B3C;
    color: #B8BBBF;
    border-radius: 20px;
    width: 20vw;
    padding: 8px;
    display: inline-block;
    top: 12px;
    position: absolute;
    left: 95px;
}

div#post-container form button {
    display: inline-block;
    position: absolute;
    top: 19px;
    right: 22px;
}

div#post-container button {
    position: relative;
    margin-left: auto;
    margin-right: auto;
    right: -107px;
}



</style>