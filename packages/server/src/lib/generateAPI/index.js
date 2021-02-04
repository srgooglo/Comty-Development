import express from 'express'
import APIS from '../../api.json'
import path from 'path'

const router = express.Router()

export default ({ MiddlewaresPath, ControllersPath }) => {
    try {
        if (typeof (APIS) !== "object") {
            console.error("INVALID APIS!!!")
            return false
        }
        APIS.forEach((api) => {
            try {
                if (typeof (api.path) == "undefined") {
                    console.log(`[INIT ERROR] Path is required!`)
                    return false
                }
    
                let model = [api.path]
    
                let thisMiddleware = api.middleware ? require(path.resolve(MiddlewaresPath, `./${api.middleware}/index.js`)).default : null
                let thisController = api.controller ? require(path.resolve(ControllersPath, `./${api.controller}/index.js`)).default : null
    
                if (typeof (api.exec) !== "undefined") {
                    thisController = thisController[api.exec]
                } else {
                    thisController = thisController.get
                }
    
                if (thisMiddleware) {
                    model.push(thisMiddleware)
                }
                if (thisController) {
                    model.push(thisController)
                }
    
                router[api.method.toLowerCase() ?? "get"](...model)
            } catch (error) {
                console.log(`🚫 Error loading API ${api.path} > \n`)
                console.log(error)
            }
        })
        return router
    } catch (error) {
        console.error(`Invalid APIS > ${error}`)
        return false
    }
}