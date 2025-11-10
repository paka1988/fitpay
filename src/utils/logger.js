function logAxiosError(err) {
    console.error('=== Axios Error ===');
    if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Headers:', err.response.headers);
        console.error('Data:', err.response.data);
    } else if (err.request) {
        console.error('No response received:', err.request);
    } else {
        console.error('Error message:', err.message);
    }
    console.error('Config:', err.config);
}

module.exports = { logAxiosError };