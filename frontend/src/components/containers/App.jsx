import React from 'react'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'
import LoginPage from 'LoginPage'
import NavBar from 'NavBar'
import {connect} from 'react-redux'
import HomePage from './HomePage'
import SettingsPage from './SettingsPage'
import TeamInboundPage from './TeamInboundPage'
import PrivateRoute from './PrivateRoute'

const App = ({hasLoaded}) => (
  <Router>
    <div className="container">
      <NavBar/>      
      <div className="pageBase" display-if={hasLoaded}>
          <Route exact path="/" component={HomePage}/>
          <div className='padded'>
              <Route path="/login" component={LoginPage}/>
              <Route path={'/teams/:teamId'} component={TeamInboundPage}/>
              <PrivateRoute path='/settings' component={SettingsPage}/>
          </div>

      </div>
      <div display-if={!hasLoaded}>
          Loading!
      </div>
    </div>
  </Router>
)

const mapStateToProps = (state, ownProps) => {
    const {config} = state;
    const isLoading = config.get('isLoading')
    const hasLoaded = config.get('hasLoaded')
    return {
        isLoading,
        hasLoaded,
    }
}

export default connect(mapStateToProps)(App)
