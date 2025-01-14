window.addEventListener(`loggedIn`, () => {
    document.getElementById('main').style.display = 'block';
    document.getElementById('placeholder').style.display = 'none';
    // const refreshTokenExpiry = window.App?.cookies?.refreshTokenExpiry;
    // console.log(refreshTokenExpiry);
    // if (refreshTokenExpiry !== undefined && refreshTokenExpiry > new Date()) {
    //     document.getElementById('main').style.display = 'block';
    //     document.getElementById('placeholder').style.display = 'none';
    // }
});

window.addEventListener('loggedOut', () => {
    document.getElementById('placeholder').style.display = 'block';
    document.getElementById('main').style.display = 'none';
});