import React from 'react'
import Clickable from 'atoms/Clickable'
import {connect} from 'react-redux'
import {postTeam} from 'ducks/slack'

class HomePage extends React.Component {
    render () {
        const {createTeam} = this.props
        return <div className="content">
          <h2>Home</h2>
          <Clickable text={'Button Primary!'} onClick={createTeam}/>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {

    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        createTeam: () => dispatch(postTeam)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
