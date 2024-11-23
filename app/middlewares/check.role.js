exports.checkRole = (roles) => (req, res, next) => {
    const { role } = req.user; // Extracted from JWT
    if (!roles.includes(role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
