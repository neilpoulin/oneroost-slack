import React from 'react'
// import Clickable from 'atoms/Clickable'
import {connect} from 'react-redux'

class HomePage extends React.Component {
    render () {
        return <div className="content">
          <h2>Home</h2>
          <h2>Welcome to OneRoost!</h2>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {

    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
