<script context="module">

</script>

<!-- HTML -->

<main>

	<section id="sites">
       <h3>Sites</h3>

        <div>
        <img src="http://localhost:5000/images/point.svg" alt="point">
        <h4>General</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/building.svg" alt="point">
        <h4>Goverment</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/virus.svg" alt="point">
        <h4>COVID-19: Information Center</h4>
        </div>

    </section>

    <section id="groups">
       <h3>Groups</h3>

        <div>
        <img src="http://localhost:5000/images/nodejs.jpg" alt="point">
        <h4>Node.js Developers</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/webdev.jpg" alt="point">
        <h4>Web Development</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/dat.jpg" alt="point">
        <h4>Computer Science</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/lol.jpg" alt="point">
        <h4>Leauge of Legends</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/wow.png" alt="point">
        <h4>World of Warcraft</h4>
        </div>
       
    </section>

    <section id="liked-pages">
        <h3>Liked pages</h3>

        <div>
        <img src="http://localhost:5000/images/markiplier.jpg" alt="point">
            <h4>Markiplier</h4>
        </div>

        <div>
        <img src="http://localhost:5000/images/lixiantv.jpg" alt="point">
            <h4>LixinaTV</h4>
        </div>

    </section>

</main>


<!-- Style to this component -->
<style> 

   main {
        position: fixed;
        padding-left: 0.6rem;
        background-color: #18191A;
        color: #E4E6EB;
        width: 16vw;
        height: 93%;
        bottom: 0;
        left: 0;
    }

    section {
        color: #E4E6EB;
    }

    section#sites div img, section#groups div img, section#liked-pages div img {
        margin-bottom: 10px; 
        width: 2vw;
        border-radius: 25px;
    }

    section#sites, section#groups, section#liked-pages {
        margin-left: 10px;
    }

    section#sites h3,  section#groups h3, section#liked-pages h3{
        margin-top: 25px;
        margin-bottom: 25px;
        font-weight: 600;
    }

    section#sites h4, section#groups h4, section#liked-pages h4 {
        display: inline-block;
        top: -21px;
        position: relative;
        margin-left: 10px;
    }

    section#groups div img {
        margin-bottom: 10px; 
        width: 2vw;
        border-radius: 25px;
    }

</style>