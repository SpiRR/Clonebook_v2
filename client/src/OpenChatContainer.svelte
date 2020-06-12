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
        <i class="fas fa-minus"></i>
        <i class="fas fa-times"></i>
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

div#chat-container {
    border: 1px solid lightgray;
    position: fixed;
    background-color: #FAFAFA;
    width: 17vw;
    height: 47vh;
    bottom: 0px;
    right: 150px;
    cursor: pointer;
    border-radius: 25px;
}

div#top-container {
    border-bottom: 1px solid lightgray;
    height: 7vh;
    display: grid;
    grid-template-columns: 1fr 3fr 1fr 1fr;
}

div#top-container i {
    position: relative;
    color: black;
    display: inline-block;
    top: 20px;
    padding: 5px;
    margin-right: 5px;
}

div#top-container img {
    padding: 15px;
    width: 4vw;
    border-radius: 50%
}

div#top-container p {
    position: relative;
    color: black;
    display: inline-block;
    bottom: -24px;
}

div#chat {
    width: 17vw;
    height: 33vh;
    border-bottom: 1px solid lightgrey;
}

div#bot-container input {
    position: relative;
    background-color: #FAFAFA;
    color: black;
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