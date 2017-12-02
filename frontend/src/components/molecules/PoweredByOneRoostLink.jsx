import React from 'react'
import Logo from 'atoms/Logo'
import {Link} from 'react-router-dom'

class PoweredByOneRoostLink extends React.Component {
    static propTypes = {

    }

    render(){
        const {} = this.props
        return <Link to='/' className='link'>Powered by <Logo/></Link>
    }

}

export default PoweredByOneRoostLink