import { connect } from 'umi'
import config from 'config'

// function injectAttributes(cls, attrs) {
//     const injected = function (...args) {
//         Object.assign(this, attrs)
//         return cls.apply(this, args)
//     }
//     injected.prototype = cls.prototype
//     return injected
// }

// function extendProps(WrappedComponent, extendedProps) {
//     class ComponentExtended extends React.Component {
//         constructor(...props) {
//             super(...props)
//             this.bindedComponent = injectAttributes(ComponentExtended, { returnProps: "aaaaa" }).bind(this)
//             console.log(this.bindedComponent)
//         }
//         render() {
//             return <WrappedComponent {...this.props} {...extendedProps} />
//         }
//     }
//     return ComponentExtended
// }

export default (childrenClass, connectors) => {
    const connectedStore = config.app.app_model
   
    function generateConnector(stores) {
        let uniqueStore = {}
        let scope = []

        if (typeof (connectors) == "undefined") {
            scope.push(connectedStore ?? "app")
        } else {
            if (Array.isArray(connectors)) {
                scope = connectors
            } else {
                scope.push(connectors)
            }
        }

        scope.forEach((key, index) => {
            if (typeof (stores[key]) !== "undefined") {
                uniqueStore[key] = stores[key]
            }
        })

        return uniqueStore
    }

    return connect((stores) => (generateConnector(stores)))(childrenClass)
}