import { verbosity, objectToArrayMap } from '@nodecorejs/utils'
import { User, Session, GeoRegion, Vault } from '../../models'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

export default (payload) => {
    return new Promise(async (resolve, reject) => {
        if (!payload) return reject('payload is missing')

        let codeArray = []
        let cat = []

        const schemeLenghtMap = {
            type: 1,
            region: 2,
            cat: 4,

            chipset: 1,
            manufacture: 2,
            tier: 1,

            stash: 4,
            serial: 5
        }
        const scheme = ["type", "region", "chipset", "manufacture", "tier", "cat", "serial"]

        scheme.forEach((key) => {
            const element = payload[key]

            let str = String(element ?? "0")
            let obj = []

            switch (key) {
                case "region": {
                    let nmb = String(100 + payload.region);
                    return codeArray.push(nmb.slice(1, nmb.length))
                }
                case "chipset": {
                    return cat.push(str)
                }
                case "manufacture": {
                    str = str.slice((str.length - 2), str.length)
                    return cat.push(str)
                }
                case "tier": {
                    return cat.push(str)
                }
                case "cat": {
                    return codeArray.push(cat.join(""))
                }
                default: {
                    for (let index = 0; index < schemeLenghtMap[key]; index++) {
                        const letter = str[index]

                        if (typeof (str) !== "undefined") {
                            obj[index] = letter ?? 0
                        } else {
                            obj[index] = 0
                        }
                    }
                    break
                }
            }

            return codeArray.push(obj.join(""))
        })

        return resolve(codeArray.join("-"))
    })
}