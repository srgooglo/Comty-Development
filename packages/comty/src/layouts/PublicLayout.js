import React from 'react'
import * as antd from 'antd'

import styles from './PublicLayout.less'

const { Content } = antd.Layout

export default class PublicLayout extends React.Component {
  state = {
    isMobile: false,
  }

  render() {
    const { children } = this.props
    return (
      <React.Fragment>
        <antd.Layout>
          <div className={styles.primary_layout_container}>
            <Content
              id="publicContent"
              className={styles.primary_layout_content}
            >
              {children}
            </Content>
          </div>
        </antd.Layout>
      </React.Fragment>
    )
  }
}