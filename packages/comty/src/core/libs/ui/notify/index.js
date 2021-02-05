import { notification } from 'antd'
import { Triangle, Clock, Loader } from 'feather-reactjs'

export default {
  fatal: (...res) => {
    notification.error({
      message: 'Fatal Error',
      icon: <Triangle style={{ color: '#fa8c16' }} />,
      description: res,
      placement: 'bottomLeft'
    })
  },
  expire: (...res) => {
    notification.error({
      message: 'Hey ',
      icon: <Clock />,
      description: res,
      placement: 'bottomLeft',
    })
  },
  info: (...res) => {
    notification.info({
      message: 'Well',
      description: res.toString(),
      placement: 'bottomLeft',
    })
  },
  exception: (...res) => {
    notification.error({
      message: 'WoW!',
      description: res.toString(),
      placement: 'bottomLeft',
    })
  },
  warn: (...res) => {
    notification.warn({
      message: 'Hey!',
      description: res.toString(),
      placement: 'bottomLeft',
    })
  },
  success: (...res) => {
    notification.success({
      message: 'Well',
      description: res.toString(),
      placement: 'bottomLeft',
    })
  },
  error: (...params) => {
    const ErrorWrapperStyle = {

    }
    const ErrorContentStyle = {
      marginBottom: "15px"
    }
    const ErrorBoxStyle = {
      width: "100%",
      height: "fit-content",
      maxHeight: "500px",
      overflow: "scroll",

      borderRadius: "8px",
      backgroundColor: "rgba(200, 40, 30, 0.3)",
      fontStyle: "italic",

      color: "#333333",
      padding: "10px",
    }

    let { title, message, duration } = params[0]

    if (params.length > 1) { // parse params
      try {
        title = params[0]
        message = params[1]
        duration = params[2]
      } catch (error) {
        // terrible...
      }
    }

    if (typeof (title) !== "string") {
      try {
        title = title.toString()
      } catch (error) {
        title = String(title)
      }
    }

    if (typeof (message) !== "string") {
      try {
        message = message.toString()
      } catch (error) {
        message = String(message)
      }
    }

    notification.error({
      message: 'An wild error appears !',
      duration: duration ?? 10,
      description: (
        <div style={ErrorWrapperStyle}>
          <div style={ErrorContentStyle}>
            <span>{title}</span>
          </div>
          <div style={ErrorContentStyle}>
            <div style={ErrorBoxStyle}> ⇥ {message}</div>
          </div>
        </div>
      ),
      placement: 'bottomLeft',
    })
  },
  proccess: (...res) => {
    notification.open({
      icon: <Loader style={{ color: '#108ee9' }} />,
      message: 'Please wait',
      description: <div>{res}</div>,
      placement: 'bottomLeft',
    })
  },
  open: (props) => {
    notification.open({
      placement: props.placement ? props.placement : 'bottomLeft',
      duration: props.duration ? props.placement : 15,
      icon: props.icon ? props.icon : <Triangle style={{ color: '#fa8c16' }} />,
      message: props.message ? props.message : '',
      description: props.description ? props.description : ''
    })
  },
}