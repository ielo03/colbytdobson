async function post(req, res) {
    try {
        // Log the incoming request for debugging purposes
        console.log('Request:', req);

        // Set the headers to delete the refreshToken cookie
        res.setHeader('Set-Cookie', [
            'refreshToken=; HttpOnly; Path=/; Max-Age=0', // Deletes the cookie by setting Max-Age=0
            'refreshTokenExpiry=0; Path=/; Max-Age=0',
        ]);

        // Send the response
        res.status(200).json({ message: 'refreshToken cookie deleted successfully' });
    } catch (error) {
        console.error('Error handling logout:', error);

        // Send an error response if something goes wrong
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default {
    post,
};