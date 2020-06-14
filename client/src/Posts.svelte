<script>

let src = "./images/me.jpg"

</script>

<!-- ---------------------------------->

<section>
<div id="post-container">
    
    <img {src} alt="user"/> 

        <form action="">
            <input placeholder="What's on your mind?"/>
            <i class="fas fa-paper-plane"></i>
        </form>

    <div class="extras">
        <i class="fab fa-youtube"><p>Video</p></i>
        <i class="far fa-images"><p>Images</p></i>   
        <i class="far fa-surprise"><p>Surprise</p></i> 
    </div>
</div>

</section>

<!-- ---------------------------------->

<style>

div#post-container {
    position: relative;
    top: 130px;
    width: 40vw;
    height: 14vh;
    background-color: #FAFAFA;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px;
    border: 1px solid lightgray;
    padding: 10px;
    box-shadow: 2px 5px lightgray;
}

div#post-container img {
    width: 3vw;
    border-radius: 50%;
    margin-left: 12px;
    margin-top: 4px;
}

div#post-container input {
    background-color: #FAFAFA;
    color: black;
    border-radius: 20px;
    width: 30vw;
    padding: 8px;
    display: inline-block;
    top: 20px;
    position: absolute;
    left: 95px;
}

div#post-container form i {
    display: inline-block;
    position: absolute;
    font-size: 20px;
    top: 26px;
    right: 36px;
}

div#post-container i {
    position: relative;
    margin-left: auto;
    margin-right: auto;
    font-size: 20px;
    right: -107px;
}

.extras {
    display: grid;
    grid-template-columns: 1fr 5fr 1fr;
    bottom: 22px;
    left: 0;
    position: absolute;
    /* grid-gap: 5rem; */
}

.extras p {
    color: black;
    font-size: 14px;
    display: inline-block;
    padding-left: 5px;
}

.extras .fa-youtube {
    color: red;
    font-size: 20px;
}
.extras .fa-images {
    font-size: 20px;
    color: blue;
}
.extras .fa-surprise {
    font-size: 20px;
    color: green;
}

</style>