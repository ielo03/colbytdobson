window.addEventListener("load", function () {
    document.getElementById("register-btn").addEventListener("click", function () {
        submitRegistration();
    });

    document.getElementById("username").addEventListener("keyup", function (event) {
        validateUsername();
        enter(event);
    });
    document.getElementById("password").addEventListener("keyup", function (event) {
        validatePassword();
        enter(event);
    });
});

function enter(event) {
    if (event.key === "Enter") {
        submitRegistration();
    }
}

function validateUsername() {
    const username = document.getElementById("username").value;
    const usernameError = document.getElementById("usernameError");

    if (username.length < 3 || username.length > 20) usernameError.innerText = "Username must be between 3 and 20 characters long.";
    else if (!/^[a-zA-Z0-9_\-]+$/.test(username)) usernameError.innerText = "Username can only contain letters, numbers, hyphens, and underscores.";
    else usernameError.innerText = "";
}

function validatePassword() {
    const password = document.getElementById("password").value;
    const passwordError = document.getElementById("passwordError");

    if (password.length < 8) passwordError.innerText = "Password must be at least 8 characters long.";
    else if (!/[a-z]/.test(password)) passwordError.innerText = "Password must contain at least one lowercase letter.";
    else if (!/[A-Z]/.test(password)) passwordError.innerText = "Password must contain at least one uppercase letter.";
    else if (!/\d/.test(password)) passwordError.innerText = "Password must contain at least one number.";
    else if (!/[@$!%*?&]/.test(password)) passwordError.innerText = "Password must contain at least one special character (@, $, !, %, *, ?, or &).";
    else passwordError.innerText = "";
}

function validateRegistration() {
    validateUsername();
    validatePassword();
}

function submitRegistration() {
    validateRegistration();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    if (usernameError.innerText === "" && passwordError.innerText === "") {
        console.log("Validations passed. Submitting form...");
        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password})
        }).then((result) => {
            return result.text().then(text => ({status: result.ok, responseText: text}));
        }).then(({status, responseText}) => {
            if (status) {
                window.location = "/";
            } else {
                usernameError.innerText = responseText;
            }
        }).catch((error) => {
            console.error("Error:", error);
        });
    }
}
