import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import LoginPage from 'LoginPage'
import NavBar from 'NavBar'
import {connect} from 'react-redux'
import Clickable from 'Clickable'
import HomePage from 'HomePage'

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
)

const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route path={`${match.url}/:topicId`} component={Topic}/>
    <Route exact path={match.url} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </div>
)

const App = ({hasLoaded}) => (
  <Router>
    <div className="container">
      <NavBar/>
      <div className="pageBase" display-if={hasLoaded}>
          <Route exact path="/" component={HomePage}/>
          <Route path="/login" component={LoginPage}/>
          <Route path="/topics" component={Topics}/>
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
