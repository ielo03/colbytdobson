window.addEventListener(`load`, () => {
    const refreshTokenExpiry = window.MyApp?.cookies?.refreshTokenExpiry;
    console.log(`refreshTokenExpiry: ${refreshTokenExpiry}`);
    if (refreshTokenExpiry !== undefined && refreshTokenExpiry > new Date()) {
        document.getElementById('main').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
    }
});