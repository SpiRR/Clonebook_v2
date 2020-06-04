<!-- JavaScript -->
<script>
let src = "./images/me.jpg"

</script>


<!-- HTML -->
<main>

	<section id="contacts">
    <h3>Contacts</h3>

       <div class="friend">
        <img {src} alt="user"/>
        <p>Stine Knarkegaard Petersen</p>
       </div>
    </section>

</main>


<!-- Style to this component -->
<style>

    section#contacts {
        position: fixed;
        padding-left: 0.6rem;
        background-color: #18191A;
        width: 17vw;
        height: 100%;
        top: 48px;
        right: 0;
    }

    section#contacts h3 {
        color: grey;
    }

    section#contacts .friend {
        cursor: pointer;
        color: white;
    }

    section#contacts .friend img {
        position: relative;
        top: 10px;
        width: 2vw;
        border-radius: 50%;
    }

    section#contacts .friend p {
        position: relative;
        display: inline-block;
        top: -5px;
        margin-left: 10px;
    }

</style>