import { Streaming, StreamKey } from '../../models'
import * as uuid from 'uuid'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

export const StreamingController = {
    get: (req, res, next) => {
        const { key, user_id } = req.query

        let selector = {}

        if (typeof (key) !== "undefined") {
            selector = { key }
        } else if (typeof (user_id) !== "undefined") {
            selector = { user_id }
        }

        Streaming.find(selector).then((stream) => {
            if (stream) {
                res.json(stream)
            }
        })
    },
    getAll: (req, res, next) => {
        Streaming.find().then((stream) => {
            if (stream) {
                res.json(stream)
            }
        })
    },
    getStreamKey: (req, res, next) => {
        if (typeof (req.userData) == "undefined") {
            return res.json(`You need auth to get your stream key`)
        }

        StreamKey.findOne({ user_id: req.userData._id }).then((streamKey) => {
            if (!streamKey) {
                return res.status(404).json(`${req.userData.username} has not an valid key or not exists!`)
            }
            return res.json(streamKey.key)
        })
    },
    generateStreamKey: (req, res, next) => {
        if (typeof (req.userData) == "undefined") {
            return res.json(`You need auth to generate an stream key`)
        }
        const { username, _id } = req.userData
        const key = uuid.v4()

        StreamKey.findOne({ user_id: _id }).then((streamKey) => {
            if (streamKey) {
                StreamKey.deleteOne({ key: streamKey.key }).then(() => {

                })
            }
            let document = new StreamKey({
                user_id: _id,
                username,
                key
            })
            document.save()

            return res.json(key)
        })
    },
    create: (req, res, next) => {
        if (typeof (req.userData) == "undefined") {
            return res.json(`You need auth to generate an stream key`)
        }
        const { _id } = req.userData

        StreamKey.findOne({ user_id: _id }).then((data) => {
            if (!data) {
                return res.status(404).json(`${req.userData.username} has not an valid key or not exists!`)
            }
            const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] })
                        
            let document = new Streaming({
                session_id: null,
                stream_id: randomName,
                user_id: _id
            })

            document.save()
            return res.json(randomName)
        })

    },
}

export default StreamingController