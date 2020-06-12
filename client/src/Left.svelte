<script context="module">

</script>

<!-- HTML -->

<main>

	<section id="sites">
       <h3>Sites</h3>

        <div>
        <img src="./images/point.svg" alt="point">
        <h4>General</h4>
        </div>

        <div>
        <img src="./images/building.svg" alt="point">
        <h4>Goverment</h4>
        </div>

        <div>
        <img src="./images/virus.svg" alt="point">
        <h4>COVID-19: Information Center</h4>
        </div>

    </section>

    <section id="groups">
       <h3>Groups</h3>

        <div>
        <img src="./images/nodejs.jpg" alt="point">
        <h4>Node.js Developers</h4>
        </div>

        <div>
        <img src="./images/webdev.jpg" alt="point">
        <h4>Web Development</h4>
        </div>

        <div>
        <img src="./images/dat.jpg" alt="point">
        <h4>Computer Science</h4>
        </div>
       
    </section>

</main>


<!-- Style to this component -->
<style> 

   main {
        position: fixed;
        padding-left: 0.6rem;
        background-color: #FAFAFA;
        color: black;
        width: 16vw;
        height: 91%;
        bottom: 0;
        left: 0;
    }

    section {
        color: grey;
    }

    section#sites div img {
        margin-bottom: 10px; 
        width: 2vw;
        border-radius: 25px;
    }

    section#sites, section#groups {
        margin-left: 10px;
    }

    section#sites h3,  section#groups h3{
        margin-bottom: 25px;
    }

    section#sites h4, section#groups h4 {
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