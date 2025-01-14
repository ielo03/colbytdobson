window.addEventListener(`DOMContentLoaded`, () => {
    const refreshTokenExpiry = window.MyApp?.cookies?.refreshTokenExpiry;
    if (refreshTokenExpiry !== undefined && refreshTokenExpiry > new Date()) {
        document.getElementById('main').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
    }
});