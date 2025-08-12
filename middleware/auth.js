// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.instructorId) {
        return res.redirect('/auth/login');
    }
    next();
};

// Check if already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.instructorId) {
        return res.redirect('/dashboard');
    }
    next();
};

module.exports = {
    requireAuth,
    redirectIfAuthenticated
};
