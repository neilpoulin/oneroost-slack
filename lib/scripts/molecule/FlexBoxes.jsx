import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
class FlexBoxes extends React.Component {
    static propTypes = {
        defaultContentStyles: PropTypes.bool,
    }

    static defaultProps = {
        defaultContentStyles: true,
    }

    render () {
        const {children, defaultContentStyles} = this.props
        let contentClasses = classNames('content', {
            'default-style': defaultContentStyles
        })
        return <div className='sections'>
            {React.Children.map(children, (child, i) => {
                return <section className='section'>
                    <div className={contentClasses} key={`flexboxs_${i}`}>
                        {child}
                    </div>
                </section>
            })}
        </div>
    }
}

export default FlexBoxes;
