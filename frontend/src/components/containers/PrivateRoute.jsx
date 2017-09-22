import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Redirect, withRouter, Route} from 'react-router-dom'
import {isLoggedIn, isUserLoading, hasUserLoaded} from 'selectors/user'

class PrivateRoute extends React.Component {
    static propTypes = {
        component: PropTypes.any.isRequired,
        isLoggedIn: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool,
        hasLoaded: PropTypes.bool,
    }

    render () {
        const {
            isLoggedIn,
            component: Component,
            isLoading,
            hasLoaded,
            ...rest
        } = this.props

        return <Route {...rest} render={props => {
            if (isLoggedIn){
                return <Component {...props}/>
            }
            if (!hasLoaded || isLoading){
                return null
            }
            return (<Redirect to={{
                pathname: '/login',
                state: { from: props.location }
            }}/>)
        }}/>
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: isLoggedIn(state),
        isLoading: isUserLoading(state),
        hasLoaded: hasUserLoaded(state),
    }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute))
