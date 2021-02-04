import runtime from '@nodecorejs/dot-runtime'
import localforage from 'localforage'

console.log(runtime)
let settingDB = runtime.config?.db ?? "configdb_default"

localforage.getItem(settingDB, function (err, value) {
    console.log(err, value)
})


export const controller = {
    add: () => {

    },
    get: () => {

    },
    set: () => {

    }
}

export default controller