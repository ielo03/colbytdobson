const parseCookies = () => {
    const cookies = document.cookie.split('; ');
    const cookieObj = {};
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        cookieObj[key] = decodeURIComponent(value || '');
    }
    return cookieObj;
}

window.addEventListener('loggedIn', () => {
    document.getElementById('profile').setAttribute('src', App.decodedToken.picture);
});

window.App = window.App || {};
App.cookies = parseCookies();