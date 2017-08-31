import React from 'react'
import Clickable from 'atoms/Clickable'

class HomePage extends React.Component {
    render () {
        return <div className="content">
          <h2>Home</h2>
          <Clickable text={'Button Primary!'}/>
          <Clickable text={'Outlined Primary...'} outline={true}/>
          <Clickable text={'Outlined Secondary!'} outline={true} colorType={'secondary'}/>
          <Clickable text={'Secondary Button!'} outline={false} colorType={'secondary'}/>
        </div>
    }
}

export default HomePage;
