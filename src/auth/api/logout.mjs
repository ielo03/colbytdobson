async function post(req, res) {
    try {
        // Log the incoming request for debugging purposes
        console.log('Request:', req);

        res.cookie('refreshToken', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0 // Deletes the cookie by setting its age to 0
        });

        res.cookie('refreshTokenExpiry', '0', {
            path: '/',
            maxAge: 0 // Deletes the cookie by setting its age to 0
        });

        res.send('Cookies deleted!');
    } catch (error) {
        console.error('Error handling logout:', error);

        // Send an error response if something goes wrong
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default {
    post,
};