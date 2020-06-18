<!-- JavaScript -->
<script context="module">

let src = "http://localhost:5000/images/me.jpg"

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
        <i class="fas fa-paper-plane"></i>
    </div>
</div>

</section>


<!-- Style to this component -->
<style> 

div#chat-container {
    display: none;
    border: 1px solid lightgray;
    position: fixed;
    background-color: #FAFAFA;
    width: 17vw;
    height: 47vh;
    bottom: 0px;
    right: 150px;
    cursor: pointer;
    border-radius: 15px;
    box-shadow: 2px 5px lightgray;
}

div#top-container {
    border-bottom: 1px solid lightgray;
    height: 8vh;
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
    width: 13vw;
    height: 4vh;
    top: 13px;
    left: 18px;
}

div#bot-container i {
    position: relative;
    top: 13px;
    left: 29px;
}
</style>