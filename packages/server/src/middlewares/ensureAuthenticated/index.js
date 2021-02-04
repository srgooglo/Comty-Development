import passport from 'passport'

export const ensureAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(403).json(`An error occurred while trying to authenticate`)
        }

        if (!user) {
            return res.status(403).json(`This request needs authentication that you do not have`)
        }

        req.userData = user

        next()
    })(req, res, next)
}

export default ensureAuthenticated