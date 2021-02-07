import store from 'store'
import config, { defaults } from 'config'
import { queryIndexer, setLocale } from 'core'
import { ui } from 'core/libs'
import { history } from 'umi'
import { objectToArrayMap, verbosity } from '@nodecorejs/utils'

import jwt from 'jsonwebtoken'

function isPathname(pathname) {
  const force = JSON.parse(new URLSearchParams(window.location.search).get('force')) ?? false
  return (window.location.pathname == pathname) && !force
}

export default {
  namespace: 'app',
  state: {
    fadeclock: 500,
    splash: {
      render: true,
      fadeout: false
    },
    queryDone: false,

    session_valid: false,
    session_token: null,
    session: false,

    account_data: [],
    notifications: [],

    sidebar_collapsed: store.get("sidebar_collapse") ?? false,
    overlayActive: false,
    overlayElement: null,
    embedded: false,
    dispatcher: null,

    electron: null,
    app_settings: store.get(config.app.storage.settings) || [],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'updateState', payload: { dispatcher: dispatch } })
      dispatch({ type: 'initEarly' })
      dispatch({ type: 'initFrames' })
      dispatch({ type: 'query' })
    },
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: location.query,
          },
        })
      })
    },
    setupRequestCancel({ history }) {
      history.listen(() => {
        const { cancelRequest = new Map() } = window
        cancelRequest.forEach((value, key) => {
          if (value.pathname !== window.location.pathname) {
            cancelRequest.delete(key)
          }
        })
      })
    },
  },
  effects: {
    *initEarly({ dispatcher }, { call, put, select }) {
      const state = yield select(state => state.app)

      window.changeLocale = setLocale
      window.dispatcher = state.dispatcher
      window.Externals = []

      try {
        const electron = window.require("electron")
        state.dispatcher({ type: 'updateState', payload: { electron, embedded: true } })
      } catch (error) {
        // nothing
      }

      window.requiresState = (conditions) => {
        let requirePass = false
        if (typeof (conditions) !== "undefined") {
          objectToArrayMap(conditions).forEach((condition) => {
            if (typeof (state[condition.key]) !== "undefined") {
              if (state[condition.key] == condition.value) {
                requirePass = true
              } else {
                requirePass = false
              }
            } else {
              requirePass = false
            }
          })
        }
        return requirePass
      }

    },
    *query({ payload }, { call, put, select }) {
      const state = yield select(states => states.app)

      if (state.session) {
        let updated = {}
      
        const fromSessionFrame = ["username", "sub", "iat", "fullName", "avatar", "email", "roles"]

        fromSessionFrame.forEach((e) => {
          try {
            if (state.session[e] != null) {
              return updated[e] = state.session[e]
            }
          } catch (error) {
            return console.log(error)
          }
        })

        state.dispatcher({ type: "updateState", payload: { account_data: updated } })
      }

      if (config.app.queryIndexer) {
        queryIndexer(config.app.queryIndexer, (callback) => {
          window.location = callback
        })
      }

      if (state.session_valid) {
        if (isPathname("login")) {
          return history.push(config.app?.mainPath ?? "/")
        }
      } else {
        history.push(`/login`)
      }
      
      state.dispatcher({ type: "closeSplash" })

    },
    *closeSplash({ }, { select }) {
      const state = yield select(state => state.app)

      state.dispatcher({
        type: "updateState",
        payload: {
          queryDone: true,
          splash: { render: true, fadeout: state.fadeclock }
        }
      })

      setTimeout(() => {
        state.dispatcher({
          type: "updateState",
          payload: {
            splash: { render: false, fadeout: false }
          }
        })
      }, state.fadeclock)
    },
    *initFrames({ payload }, { select }) {
      const state = yield select(state => state.app)

      const signkey = store.get(config.app.storage.signkey)
      const session = store.get(config.app.storage.session_frame)

      if (session) {
        try {
          if (config.app.certified_signkeys?.includes(signkey)) {
            jwt.verify(session, signkey, (err, decoded) => {
              if (err) {
                verbosity.log([`Invalid token > `, err])
                state.dispatcher({ type: "logout" })
              }
              if (decoded) {
                state.dispatcher({
                  type: "updateState", payload: {
                    session_token: session,
                    session: decoded,
                    session_valid: true
                  }
                })
              }
            })
          } else {
            verbosity.log(`signed key is not an certifed signkey`)
          }
        } catch (error) {
          console.log(error)
        }
      }
    },
    *refreshToken({ callback }, { call, put, select }) {
      const state = yield select(state => state.app)

    },
    *login({ payload, callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "login",
          body: payload
        },
        callback: (error, response) => {
          if (error) {
            return callback(true, response)
          }
          store.set(config.app.storage.signkey, response.data.originKey)
          store.set(config.app.storage.session_frame, response.data.token)
          location.reload()
          if (typeof (callback) !== "undefined") {
            if (error) {
              return callback(true, response)
            }
            return callback(false, null)
          }
        }
      })
    },
    *isAuth({ payload, callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "isAuth"
        },
        callback: (error, response) => {
          if (typeof (callback) !== "undefined") {
            if (error) {
              return callback(false)
            }
            callback(response)
          }
          if (response.code == 200 && response.data) {
            ui.Notify.success("You are authed")
          } else {
            ui.Notify.warn("Its seems like you are not authed")
          }
        }
      })
    },
    *logout({ payload }, { put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "api/request",
        payload: {
          endpoint: "logout"
        },
        callback: (error, response) => {
          if (error) {
            return console.error(`Falied to logout > ${response}`)
          }
          return console.log(response)
        }
      })
      state.dispatcher({ type: "destroySession" })
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload }
    },
    destroySession(state) {
      state.session = false
      state.session_valid = false
      store.remove(config.app.storage.session_frame)
      store.remove(config.app.storage.signkey)
    }
  },
}
