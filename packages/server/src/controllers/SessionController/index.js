import { Session } from '../../models'

export const SessionController = {
    set: (id, token) => {
        Session.findOne({ user_id: id }).then((sessiondata) => {
            if (sessiondata) {
                Session.findOneAndDelete({ _id: sessiondata._id }).then(() => {

                })
            }
            return SessionController.add(id, token)
        })
    },
    add: (id, token) => {
        let newSession = new Session({
            user_id: id,
            token
        })
        return newSession.save()
    },
    destroy: (req, res, next, id) => {
        let byid = req.session_id ?? id
        if (!byid) {
            return next(false)
        }

        Session.findOneAndDelete({ _id: byid }).then(() => {
            next(true)
        })
    }
}

export default SessionController