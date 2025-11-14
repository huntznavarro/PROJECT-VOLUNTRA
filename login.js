function login() {
     const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const message = document.getElementById("message");


    if (email === "" || pass === "") {
        message.textContent = "Please enter both email and password.";
        return;
    }
}