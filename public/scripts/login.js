window.App = window.App || {};
App.accessToken = null;
App.decodedToken = null;

function decodeToken() {
    if (!App.accessToken) {
        console.error("No access token to decode.");
        return null;
    }

    try {
        // Split the token into its components
        const parts = App.accessToken.split(".");
        if (parts.length !== 3) {
            console.error("Invalid token format.");
            return null;
        }

        // Decode the payload (middle part of the token)
        const payload = atob(parts[1]); // Decode Base64
        App.decodedToken = JSON.parse(payload); // Parse JSON payload
        // console.log(App.decodedToken);
        return App.decodedToken;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}

async function refreshAccessToken() {
    if (!App?.cookies?.refreshTokenExpiry) {
        console.log("No refresh token cookie found.");
        return false;
    }

    try {
        const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (res.ok) {
            const data = await res.json();
            App.accessToken = data.accessToken;
            if (decodeToken()) {
                console.log("Refreshed.");
                return true;
            }
            return false;
        } else {
            console.error("Failed to refresh access token:", await res.text());
            return false;
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return false;
    }
}

// Function to check and ensure a valid access token
async function ensureAccessToken() {
    if (!App.accessToken) {
        console.log("No access token found. Attempting to refresh...");

        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            console.log("No valid tokens available. Showing login prompt...");
            showLogin(); // Show login only if refresh fails
            return false;
        }
    }
    return true;
}

async function logout() {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
            CustomAuthorization: `Bearer ${App.accessToken}`,
        },
    });

    if (res.ok) {
        // Clear access token
        App.accessToken = null;
        App.decodedToken = null;

        // Clear cookies
        document.cookie = "refreshTokenExpiry=; Max-Age=0; Path=/;";
        document.cookie = "refreshToken=; Max-Age=0; Path=/;";

        showLogin();
    } else {
        alert("Unable to log out. Refresh and try again.");
    }
}

async function handleCredentialResponse(response) {
    // console.log(JSON.stringify(response));
    try {
        // Hide the login container
        document.getElementById("login-div").style.display = "none";

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken: response.credential }),
        });

        if (res.ok) {
            const data = await res.json();
            // console.log(JSON.stringify(data));

            // Store the access token
            App.accessToken = data.accessToken;
            decodeToken();

            // document.cookie =
            //     "refreshTokenExpiry=true; Max-Age=2592000; Path=/;";

            // Show the dynamic resume page
            showLogout();
        } else {
            const errorData = await res.json();
            console.error("Authentication failed:", errorData.error);
            alert("Authentication failed. Please try again.");
            showLogin();
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        alert("An error occurred. Please try again.");
        showLogin();
    }
}

function showLogin() {
    console.log('Showing login...');
    document.getElementById("logout-div").style.display = "none";
    document.getElementById("login-div").style.display = "block";
    google.accounts.id.prompt();
}

function showLogout() {
    document.getElementById("login-div").style.display = 'none';
    document.getElementById("logout-div").style.display = 'block';
    
}

window.addEventListener("load", async () => {
    google.accounts.id.initialize({
        client_id:
            "182771232102-a1v3mnft3j68t41mka93qv4hnqq915lv.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
        document.getElementById("login-div"),
        {theme: "filled_black", size: "large", shape: "pill"}
    );

    document
        .getElementById("logout-div")
        .addEventListener("click", logout);

    try {
        if (App?.cookies?.refreshTokenExpiry || App.accessToken) {
            const hasToken = await ensureAccessToken();
            if (hasToken) {
                return showLogout();
            }
        } else {
            console.log("No valid tokens found. Showing login prompt...");
            showLogin();
        }
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});