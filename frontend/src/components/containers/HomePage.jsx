import React from 'react'
import Clickable from 'Clickable'

class HomePage extends React.Component {
    render () {
        return <div>
          <h2>Home</h2>
          <Clickable displayText={'Click me!'}/>
          <Clickable displayText={'Outlined !'} styleType="btn" outline={true}/>
        </div>
    }
}

export default HomePage;
