import React from 'react'
import * as antd from 'antd'
import * as ycore from 'ycore'
import {PostCard, PostCreator, MainSidebar} from 'components'
import styles from './index.less'

var userData = ycore.SDCP()

class Main extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            feedRaw: '',
            loading: true,
        }
    }
     
    componentDidMount(){
        ycore.GetFeedPosts((err, result) => this.setState({ feedRaw: result, loading: false }))
    }
    handleRefreshList(){
        ycore.GetFeedPosts((err, result) => this.setState({ feedRaw: result, loading: false }))
    }
   
    
    renderFeedPosts(){
        const {feedRaw} = this.state
        try {
            const feedParsed = JSON.parse(feedRaw)['data']
            return (
                feedParsed.map(item=> {
                    const {postText, post_time, publisher, postFile, postFileName} = item
                    const paylodd = {user: publisher.username, ago: post_time, avatar: publisher.avatar, content: postText, file: postFile, postFileName: postFileName, publisher: publisher }
                    ycore.DevOptions.ShowFunctionsLogs? console.log([item], paylodd) : null
                    return <PostCard payload={paylodd} />
                })
            )
        } catch (err) {
            ycore.notifyError(err)
            const paylodd = {user: 'Error', ago: '', avatar: '', content: 'Woops an error spawns here :/, maybe reloading?',  publisher: '' }
            return <PostCard payload={paylodd} />
        }
    
    }
    render(){
        const { loading } = this.state;
       
        
        return (
            <div> 
                <MainSidebar />
                <PostCreator refreshPull={() => this.handleRefreshList()} />
                {loading? <antd.Card style={{  maxWidth: '26.5vw', margin: 'auto' }} ><antd.Skeleton avatar paragraph={{ rows: 4 }} active /></antd.Card> : <div className={styles.PostsWrapper}> {this.renderFeedPosts()} </div>}
            </div>
        )
    }
}
export default Main;