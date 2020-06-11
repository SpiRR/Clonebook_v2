<script>
//
</script>

<!-- -------------------------------- -->

<section>

<form>
    <input 
    placeholder="E-mail"
    type="text"
    name="email"
    />
    
    <input 
    placeholder="Password"
    type="password"
    name="password"
    />

    <!-- <input 
    placeholder="Repeat Password"
    type="password"

    /> -->

    <input 
    placeholder="First name"
    type="text"
    name="firstName"
    />

    <input 
    placeholder="Last name"
    type="text"
    name="lastName"
    />

    <input name="profileimg" type="file" id="img" accept="image/*">

    <button>Signup</button>

</form>

</section>

<!-- -------------------------------- -->

<style>

section {
    box-sizing: border-box;
    padding: 0;
}

section form {
    display: block;
    background-color: white;
    width: 20vw;
    height: 40vh;
    margin-right: auto;
    margin-left: auto;
    text-align: center;
}

section form input {
    width: 14vw;
    border-radius: 10px;
    outline: none;
    border: 1px lightgray solid;
    padding: 8px 9px;
    font-size: 15px;
    margin-bottom: 10px; 
}

section form input:first-child {
    margin-top: 20px;
}

section form button {
    background-color: blue;
    border: none;
    outline: none;
    color: white;
    border-radius: 10px;
    width: 15vw;
    padding: 8px 0;
}

/* section form #border {
    width: 17vw;
    text-align: center;
    margin-right: auto;
    margin-left: auto;
    border-bottom: 1px solid lightgray;
    margin-top: 85px;
} */

section form button:last-child {
    border-radius: 10px;
    width: 10vw;
    margin-right: auto;
    margin-left: auto;
    margin-top: 20px;
    background-color: #3FB227;
}

</style>