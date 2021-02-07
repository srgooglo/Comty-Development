import config from 'config'
import store from 'store'

export default {
    namespace: 'theme',
    state: {
        style_prefix: config.app.defaultStyleClass ?? "app_",
        current: store.get(config.app.storage.theme) || [],
    },
    subscriptions: {
        setup({ dispatch }) {
            dispatch({ type: 'init' })
        },
    },
    effects: {
        *init({ payload }, { select, put }) {
            const state = yield select(states => states.theme)

            window.classToStyle = (key) => {
                if (typeof (key) !== "string") {
                    try {
                        const toString = JSON.stringify(key)
                        if (toString) {
                            return toString
                        } else {
                            return null
                        }
                    } catch (error) {
                        return null
                    }
                }
                if (typeof (state.style_prefix) !== "undefined") {
                    return `${state.style_prefix}${key}`
                }
                return key
            }
        },
        *updateTheme({ payload }, { put, select }) {
            if (!payload) return false
            let container = yield select(states => states.theme.current)
            
            let style_keys = []
            let tmp = []

            container.forEach((e) => { style_keys[e.key] = e.value })

            if (!style_keys[payload.key]) {
                tmp.push({ key: payload.key, value: payload.value })
            }
            container.forEach((e) => {
                let obj = {}
                if (e.key === payload.key) {
                    obj = { key: payload.key, value: payload.value }
                } else {
                    obj = { key: e.key, value: e.value }
                }
                tmp.push(obj)
            })
            return tmp ? yield put({ type: 'handleUpdateTheme', payload: tmp }) : null
        },
    },
    reducers: {
        handleUpdateTheme(state, { payload }) {
            verbosity.log(payload)
            store.set(config.app?.storate?.theme ?? "theme", payload)
            state.current = payload
        },
        updateState(state, { payload }) {
            return { ...state, ...payload }
        }
    }
}
