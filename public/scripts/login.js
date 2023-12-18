window.addEventListener("load", function () {
    document.getElementById("login-btn").addEventListener("click", login);

    document.getElementById("username").addEventListener("keydown", function (event) {
        enter(event);
    });
    document.getElementById("password").addEventListener("keydown", function (event) {
        enter(event);
    });
});

function enter (event) {
    if (event.key === 'Enter') {
        login();
    }
}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("login");

    if (username.length > 0 && password.length > 0) {
        const usernameError = document.getElementById("usernameError");
        fetch("/login", {
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