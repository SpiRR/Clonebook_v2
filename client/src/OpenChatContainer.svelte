<!-- JavaScript -->
<script context="module">

let src = "./images/me.jpg"

</script>

<!-- HTML -->

<section>

<div id="chat-container">
    <div id="top-container">
        <img {src} alt="user"/>
        <p>Friend Name</p>
        <a href="/">X</a>
        <a href="/">-</a>
    </div>


    <div id="chat">

    </div>

    <div id="bot-container">
        <input 
        placeholder="Aa"
        type="text">
        <button> > </button>
    </div>
</div>

</section>


<!-- Style to this component -->
<style> 

section {
    display: none;
    position: fixed;
    background-color: #242526;
    width: 17vw;
    height: 47vh;
    bottom: 0px;
    right: 150px;
    cursor: pointer;
    border-radius: 25px;
}

div#top-container {
    border-bottom: 1px solid grey;
    height: 7vh;
}

div#top-container a {
    position: relative;
    color: white;
    display: inline-block;
    top: 20px;
    /* float: right; */
    padding: 5px;
    margin-right: 5px;
}

div#top-container img {
    padding: 15px;
    width: 2vw;
    border-radius: 50%
}

div#top-container p {
    position: relative;
    color: white;
    display: inline-block;
    top: -29px;
}

div#chat {
    width: 17vw;
    height: 33vh;
    border-bottom: 1px solid grey;
}

div#bot-container input {
    position: relative;
    background-color: #3A3B3C;
    color: #B8BBBF;
    border-radius: 25px;
    width: 11vw;
    height: 3vh;
    top: 13px;
    left: 18px;
}

div#bot-container button {
    position: relative;
    top: 13px;
    left: 60px;
}
</style>