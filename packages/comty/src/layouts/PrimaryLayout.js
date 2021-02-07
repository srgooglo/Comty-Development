import React from 'react'
import { withRouter, connect } from 'umi'
import { AppLayout } from 'components'
import classnames from 'classnames'
import { theme } from 'core/libs/style'
import * as antd from 'antd'

const { Content } = antd.Layout
const { Sider, Overlay, RightSider } = AppLayout
const isActive = (key) => { return key ? key.active : false }

@withRouter
@connect(({ app, contextMenu, loading }) => ({ app, contextMenu, loading }))
export default class PrimaryLayout extends React.Component {
  state = {
      
  }

  render() {
    const { location, dispatch, children, app } = this.props
    const { collapsed, isMobile } = this.state
    const { onCollapseChange } = this
    const currentTheme = theme.get()

    const SiderProps = { isMobile, collapsed, onCollapseChange }
    const OverlayProps = { isMobile }

    window.darkMode = isActive(currentTheme["darkmode"]) ? true : false
    document.getElementsByTagName("body")[0].setAttribute("class", window.darkMode ? "dark" : "light")

    return (
      <React.Fragment>
        {isActive(currentTheme['backgroundImage'])
          ? <div style={{
            backgroundImage: `url(${currentTheme.backgroundImage.src})`,
            transition: "all 150ms linear",
            position: 'absolute',
            width: '100vw',
            height: '100vh',
            backgroundRepeat: "repeat-x",
            backgroundSize: "cover",
            backgroundPositionY: "center",
            overflow: "hidden",
            opacity: currentTheme.backgroundImage.opacity
          }} /> : null}
        <antd.Layout id="app" className={classnames("app", {
          ["interfaced"]: this.props.app.embedded,
          ["dark_mode"]: window.darkMode,
          ["mobile"]: isMobile,
          ["overlayActive"]: this.props.app.overlayActive
        })}>
          <Sider {...SiderProps} />
          <div className={window.classToStyle("layout_container")}>
            <Content className={window.classToStyle("layout_content")}>
              {children ? children : null}
            </Content>
          </div>
          <RightSider />
          <Overlay {...OverlayProps} />
        </antd.Layout>
      </React.Fragment>
    )
  }
}