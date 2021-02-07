import React from 'react'
import { Helmet } from 'react-helmet'
import { Loader } from 'components'
import { withRouter, connect } from 'umi'
import { queryLayout } from 'core'
import WindowNavbar from 'components/Layout/WindowNavbar'
import { Splash } from 'components'
import { enquireScreen, unenquireScreen } from 'enquire-js'
import store from 'store'
import config from 'config'
import contextMenuList from 'schemas/contextMenu'

import PrimaryLayout from './PrimaryLayout'
import PublicLayout from './PublicLayout'

import 'theme/index.less'

const LayoutMap = {
  primary: PrimaryLayout,
  public: PublicLayout,
}

@withRouter
@connect(({ app, contextMenu, loading }) => ({ app, contextMenu, loading }))
export default class BaseLayout extends React.Component {
  state = {
    collapsed: config.defaults.sidebarCollaped ? true : false,
    isMobile: false
  }
  previousPath = ''
  renderLoading = true

  componentDidMount() {
    // include API extensions
    window.dispatcher = this.props.dispatch
    window.openLink = (e) => {
      if (this.props.app.embedded) {
        this.props.app.electron.shell.openExternal(e)
      } else {
        window.open(e)
      }
    }

    window.toogleSidebarCollapse = () => {
      this.props.dispatch({
        type: "app/updateState",
        payload: { sidebar_collapsed: !this.props.app.sidebar_collapsed }
      })
    }

    if (this.props.app.embedded) {
      // window.inspectElement = (e) => this.props.dispatch({
      //   type: "app/ipcInvoke",
      //   payload: {
      //     key: "inspectElement",
      //     payload: { x: e.xPos, y: e.yPos }
      //   }
      // })

      window.contextMenu.addEventListener(
        {
          priority: 1,
          onEventRender: contextMenuList,
          ref: document.getElementById("root")
        }
      )
    }

    this.enquireHandler = enquireScreen(mobile => {
      const { isMobile } = this.state
      if (isMobile !== mobile) {
        window.isMobile = mobile
        this.setState({ isMobile: mobile })
      }
    })
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler)
  }

  onCollapseChange = () => {
    const fromStore = store.get('collapsed')
    this.setState({ collapsed: !this.state.collapsed })
    store.set('collapsed', !fromStore)
  }

  render() {
    const { loading, children, location, app } = this.props
    const currentPath = location.pathname + location.search

    const Container = LayoutMap[queryLayout(config.layouts, location.pathname)]
    const containerProps = { baseState: this.state, onCollapseChange: this.onCollapseChange }

    if (currentPath !== this.previousPath) {
      this.renderLoading = true
    }

    if (!loading.global) {
      this.previousPath = currentPath
      this.renderLoading = false
    }

    if (app.splash.render) {
      return <Splash fadeout={app.splash.fadeout} />
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{config.app.siteName}</title>
        </Helmet>
        {this.props.app.electron ? <WindowNavbar /> : null}
        {Loader(this.renderLoading)}
        <Container {...containerProps}>{children}</Container>
      </React.Fragment>
    )
  }
}