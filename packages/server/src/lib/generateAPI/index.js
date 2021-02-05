import express from 'express'
import APIS from '../../api.json'
import path from 'path'

const router = express.Router()

export default ({ MiddlewaresPath, ControllersPath }) => {
    function getDefaultModule(type, name) {
        const typesToPath = {
            middleware: MiddlewaresPath,
            controller: ControllersPath
        }
        const modulePath = typesToPath[type]
        return require(path.resolve(modulePath, `./${name}/index.js`)).default
    }

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

                let middlewares = []
                let controller = api.controller ? getDefaultModule("controller", api.controller) : null

                if (typeof (api.middleware) !== "undefined") {
                    if (Array.isArray(api.middleware)) {
                        api.middleware.forEach((middleware) => {
                            middlewares.push(getDefaultModule("middleware", middleware))
                        })
                    } else {
                        middlewares.push(getDefaultModule("middleware", api.middleware))
                    }

                    model.push(middlewares)
                }

                if (typeof (api.controller) !== "undefined") {
                    if (typeof (api.exec) !== "undefined") {
                        controller = controller[api.exec]
                    } else {
                        controller = controller.get
                    }

                    model.push(controller)
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
