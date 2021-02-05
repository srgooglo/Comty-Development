import { app } from 'config'
import axios from 'axios'
import * as ui from 'core/libs/ui'
import { objectToArrayMap, verbosity } from '@nodecorejs/utils'

export default {
    namespace: 'api',
    state: {
        api_hostname: app.api_hostname
    },
    effects: {
        *request({ payload, callback }, { put, call, select }) {
            const session_token = yield select(state => state.app.session_token)
            const state = yield select(state => state.api)

            let { method, endpoint, body, params } = payload

            if (!endpoint) {
                verbosity.log(`endpoint not defined`)
                return false
            }

            if (params) {
                let mix = []
                objectToArrayMap(params).forEach((param) => {
                    mix.push(`${param.key}=${param.value}`)
                })
                endpoint = `${endpoint}?${mix.join('&')}`
            }

            const address = `${state.api_hostname}/${endpoint}`

            axios({
                method: method ?? "POST",
                url: address,
                data: body,
                params,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Authorization': `Bearer ${session_token ?? null}`
                },
            })
                .then((res) => {
                    if (typeof (callback) !== "undefined") {
                        let isError = false
                        if (res.status !== 200) isError = true

                        return callback(isError ?? false, res.data, res.status)
                    }
                    return res.data
                })
                .catch((err) => {
                    ui.Notify.error({
                        title: "This request could not be completed",
                        message: err
                    })
                    verbosity.log(err)
                    if (typeof (callback) !== "undefined") {
                        return callback(true, err)
                    }
                    return null
                })
        }
    },
    reducers: {
        updateState(state, { payload }) {
            return { ...state, ...payload }
        },
    }
}
