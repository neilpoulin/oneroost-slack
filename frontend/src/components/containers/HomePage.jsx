import React from 'react'
import Clickable from 'Clickable'

class HomePage extends React.Component {
    render () {
        return <div className="content">
          <h2>Home</h2>
          <Clickable displayText={'Button Primary!'}/>
          <Clickable displayText={'Outlined Primary!'} styleType="btn" outline={true}/>
          <Clickable displayText={'Outlined Secondary!'} styleType="btn" outline={true} colorType={'secondary'}/>
          <Clickable displayText={'Secondary Button!'} styleType="btn" outline={false} colorType={'secondary'}/>
        </div>
    }
}

export default HomePage;
