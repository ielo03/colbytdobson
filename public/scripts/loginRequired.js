window.addEventListener(`load`, () => {
    const refreshTokenExpiry = window.App?.cookies?.refreshTokenExpiry;
    if (refreshTokenExpiry !== undefined && refreshTokenExpiry > new Date()) {
        document.getElementById('main').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
    }
});