import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = Schema({
    username: { type: String, required: true },
    fullName: String,
    avatar: String,
    email: String,
    password: { type: String, required: true },
    roles: [],
    login_count: Number
})

const SessionSchema = Schema({
    user_id: String, // Unique Session Identificator
    token: String,
})

const StreamingSchema = Schema({
    session_id: String,
    stream_key: String,
    stream_id: String,
    user_id: String,
})

const StreamKeysSchema = Schema({
    user_id: String,
    username: String,
    key: String,
})

const StreamingResolverSchema = Schema({
    stream_key: String,
    stream_id: String,
    user_id: String,
})

export const StreamingResolver = mongoose.model('StreamingResolver', StreamingResolverSchema, "streaming_resolvers")
export const StreamKey = mongoose.model('StreamKey', StreamKeysSchema, "stream_keys")
export const Streaming = mongoose.model('Streaming', StreamingSchema, "streamings")
export const User = mongoose.model('User', UserSchema, "accounts")
export const Session = mongoose.model('Session', SessionSchema, "sessions")
