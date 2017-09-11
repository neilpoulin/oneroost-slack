import React from 'react'
import {connect} from 'react-redux'
import {loadTeam} from 'ducks/inbound'

class TeamInboundPage extends React.Component {
    componentDidMount() {
        this.props.loadTeam()
    }

    render () {
        const {
            // isLoading,
            teamId,
        } = this.props

        return <div>
            <h1>Team Page for {teamId}</h1>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    const inbound = state.inbound
    const teamId = inbound.get('teamId')
    const isLoading = inbound.get('isLoading')
    return {
        teamId,
        isLoading,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const {match} = ownProps
    return {
        loadTeam: () => {
            console.log(match)
            dispatch(loadTeam(match.params.teamId))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamInboundPage);
