// src/middleware/authCheck.js
function ensureAuthenticated(req, res, next) {
    if (req.session?.accessToken) {
        return next();
    } else {
        console.log('Unauthenticated access – redirecting to login');
        return res.redirect('/index.html');
    }
}

module.exports = ensureAuthenticated;
