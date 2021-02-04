require('dotenv').config()

import { verbosity, objectToArrayMap } from '@nodecorejs/utils'
import express from 'express'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import passport from 'passport'
import path from 'path'

import { User } from './models'

import { errorHandler, notFoundHandler } from './middlewares'
import generateAPI from './lib/generateAPI'
import nodeMediaServer from './lib/nodeMediaServer'

const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const listenPort = process.env.globalPort

let app = express()
let httpServer = require('http').createServer(app)
let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.server_key,
    algorithms: ['sha1', 'RS256', 'HS256']
}

function getDBConnectionString() {
    const { db_user, db_driver, db_name, db_pwd, db_hostname, db_port } = process.env
    return `${db_driver}://${db_user}:${db_pwd}@${db_hostname}:${db_port}/${db_name}`
}

function connectDB() {
    return new Promise((resolve, reject) => {
        try {
            console.log("🌐 Trying to connect to DB...")
            mongoose.connect(getDBConnectionString(), { useNewUrlParser: true })
                .then((res) => { return resolve(true) })
                .catch((err) => { return reject(err) })
        } catch (err) {
            return reject(err)
        }
    }).then(done => {
        console.log(`✅ Connected to DB`)
    }).catch((error) => {
        console.log(`❌ Failed to connect to DB, retrying...\n`)
        console.log(error)
        setTimeout(() => {
            connectDB()
        }, 1000)
    })
}

function initPassaport() {
    passport.use(new LocalStrategy({
        usernameField: "username",
        passwordField: "password",
        session: false
    }, (username, password, done) => {
        User.findOne({ username: username })
            .then(data => {
                if (data === null) {
                    return done(null, false)
                } else if (!bcrypt.compareSync(password, data.password)) {
                    return done(null, false)
                }
                return done(null, data)
            })
            .catch(err => done(err, null))
    }))

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload.sub })
            .then(data => {
                if (data === null) {
                    return done(null, false);
                }
                else {
                    return done(null, data);
                }
            })
            .catch(err => done(err, null))
    }))

    app.use(passport.initialize())
}

function initExpress() {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        res.setHeader('Access-Control-Allow-Credentials', "true")
        next()
    })

    let notAllowedReponseData = ["password"]
    let allowedResponseData = ["_id", "username", "fullName", "avatar", "email", "roles"]

    app.use((req, res, next) => {
        const _send = res.send

        res.send = function (data, code) {
            let responseData = arguments[0]

            const responseType = typeof (responseData)
            const isArray = Array.isArray(responseData)

            if (responseType == "object") {
                let temp = []
                const source = isArray ? responseData : [responseData]

                source.forEach((item) => {
                    temp.push(JSON.parse(JSON.stringify(item, allowedResponseData)))
                })

                if (isArray) {
                    responseData = temp
                } else {
                    responseData = temp[0]
                }

                arguments[0] = responseData
            }

            _send.apply(res, arguments)
        }
        next()
    })

    app.use('/', generateAPI({
        ControllersPath: path.resolve(__dirname, `./controllers`),
        MiddlewaresPath: path.resolve(__dirname, `./middlewares`)
    }))

    app.use(errorHandler)
    app.use(notFoundHandler)

    nodeMediaServer.newNMS().run()
}

function createServer() {
    connectDB()
    initExpress()
    initPassaport()

    httpServer.listen(listenPort, () => {
        verbosity.log(`🌐 Server listening on port (${listenPort})`)
    })
}

// start the server
createServer()