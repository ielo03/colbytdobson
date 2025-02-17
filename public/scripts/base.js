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
    let link = App.decodedToken.picture;
    if (!link) {
        link = decodeToken().picture;
    }
    document.getElementById('profile').setAttribute('src', link);
});

window.App = window.App || {};
App.cookies = parseCookies();