import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {withRouter, NavLink} from 'react-router-dom'

class PageTabs extends React.Component {
    static propTypes = {
        match: PropTypes.any,
        fixed: PropTypes.bool,
        links: PropTypes.arrayOf(PropTypes.shape({
            path: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
        }))
    }

    static defaultProps = {
        links: [],
        fixed: false,
    }

    render () {
        const {
            match,
            links,
            fixed,
        } = this.props
        let containerClassnames = classNames('tabs', 'list-unstyled', {fixed: fixed})
        return <ul className={containerClassnames}>
            {links.map(({path, text}, i) =>
                <li key={`pagetabs_${i}`} className='tab'><NavLink className='link' exact to={`${match.url}${(path && !path.startsWith('/')) ? `/${path}`: path  }`}>{text}</NavLink></li>
            )}
        </ul>
    }
}

export default withRouter(PageTabs);
