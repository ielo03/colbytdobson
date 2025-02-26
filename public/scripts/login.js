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
        const decodedToken = JSON.parse(payload); // Parse JSON payload
        App.decodedToken = decodedToken;
        return decodedToken;
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
                console.log("Access token refreshed successfully.");
                scheduleAccessTokenRefresh(); // Schedule the next refresh
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

async function scheduleAccessTokenRefresh() {
    if (!App?.decodedToken?.exp) {
        console.error("No expiration time found in the token.");
        return;
    }

    const expirationTime = App.decodedToken.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const refreshTime = expirationTime - currentTime - 60000; // Schedule refresh 1 minute before expiry

    if (refreshTime > 0) {
        setTimeout(refreshAccessToken, refreshTime);
        console.log(`Scheduled access token refresh in ${Math.floor(refreshTime / 1000)} seconds.`);
    } else {
        console.warn("Token is already expired or close to expiring. Refreshing immediately...");
        await refreshAccessToken();
    }
}

// Ensure the token refresh is scheduled when the token is first fetched
async function ensureAccessToken() {
    if (!App?.accessToken || App?.decodedToken?.exp * 1000 < Date.now()) {
        console.log("No valid access token found. Attempting to refresh...");
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            console.log("Failed to acquire a valid token.");
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
            showLogout();

            // document.cookie =
            //     "refreshTokenExpiry=true; Max-Age=2592000; Path=/;";

            // Show the dynamic resume page
        } else {
            const errorData = await res.json();
            console.error("Authentication failed:", errorData.error);
            alert("Authentication failed. Please try again.");
            showLogin();
            return false;
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        alert("An error occurred. Please try again.");
        showLogin();
        return false;
    }
}

function showLogin() {
    console.log('Showing login...');
    window.dispatchEvent(new Event('loggedOut'));
    document.getElementById("logout-div").style.display = "none";
    document.getElementById("login-div").style.display = "block";
    // google.accounts.id.prompt();
}

function showLogout() {
    console.log('Showing logout...');
    App.decodedToken = decodeToken();
    window.dispatchEvent(new Event('loggedIn'));
    document.getElementById("login-div").style.display = 'none';
    document.getElementById("logout-div").style.display = 'flex';
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
                showLogout();
            } else {
                showLogin();
            }
        } else {
            console.log("No valid tokens found. Showing login prompt...");
            showLogin();
        }
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});