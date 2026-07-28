function requireApiAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication is required."
        });
    }

    next();
}

module.exports = requireApiAuth;