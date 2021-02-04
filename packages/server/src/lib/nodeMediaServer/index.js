import NodeMediaServer from 'node-media-server'
import { getRuntimeEnv } from '@nodecorejs/dot-runtime'
import { Streaming, StreamKey, User, StreamingResolver } from '../../models'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

let { verbosity } = require('@nodecorejs/utils')
verbosity = verbosity.options({ method: `[NodeMediaServer]` })

const config = getRuntimeEnv().rtmp_server
// const helpers = require('./helpers/helpers')

function getStreamKeyFromStreamPath(path) {
    let parts = path.split('/')
    return parts[parts.length - 1]
}

export function newNMS() {
    if (!config) {
        verbosity.options({ fileDump: true }).log("😡 Invalid config ")
        return false
    }

    let nms = new NodeMediaServer(config)

    nms.on('prePublish', async (session_id, stream_path, args) => {
        let stream_key = getStreamKeyFromStreamPath(stream_path)
        let session = nms.getSession(session_id)

        verbosity.options({ fileDump: true }).log('[NodeEvent on prePublish]', `id=${session_id} StreamPath=${stream_path} args=${JSON.stringify(args)}`)

        StreamKey.findOne({ key: stream_key }).then((data) => {
            if (!data) {
                return session.reject()
            }

            User.findOne({ _id: data.user_id }).then(async (user) => {
                if (!user) {
                    return session.reject()
                }
                const { _id } = user
                const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] })
                let StreamingInstance = await Streaming.findOne({ stream_key })

                if (!StreamingInstance) {
                    StreamingInstance = new Streaming({
                        session_id,
                        stream_id: randomName,
                        user_id: _id
                    })
                    StreamingInstance.save()
                } else {
                    // hump... why this so mad 😢
                    Streaming.findOneAndUpdate({ stream_id: StreamingInstance.stream_id }, { session_id })
                }

                new StreamingResolver({
                    user_id: _id,
                    stream_id: StreamingInstance ? StreamingInstance.stream_id : randomName,
                    stream_key
                }).save()

                // helpers.generateStreamThumbnail(stream_key)
            })
        })
    })

    nms.on('donePublish', async (session_id, stream_path, args) => {
        let stream_key = getStreamKeyFromStreamPath(stream_path)

        await Streaming.findOneAndDelete({ stream_key })
        await StreamingResolver.findOneAndDelete({ stream_key })
    })

    return nms
}

export default { newNMS }
