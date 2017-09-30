import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
class FlexBoxes extends React.Component {
    static propTypes = {
        defaultContentStyles: PropTypes.bool,
        children: PropTypes.any,
        columns: PropTypes.oneOf([2, 3])
    }

    static defaultProps = {
        defaultContentStyles: true,
        columns: 3,
    }

    render () {
        const {
            children,
            defaultContentStyles,
            columns
        } = this.props
        const sectionClasses = classNames('section', {
            [`col-${columns}`]: columns
        })
        let contentClasses = classNames('content', {
            'default-style': defaultContentStyles
        })
        return <div className='sections'>
            {React.Children.map(children, (child, i) => {
                return <section className={sectionClasses}>
                    <div className={contentClasses} key={`flexboxs_${i}`}>
                        {child}
                    </div>
                </section>
            })}
        </div>
    }
}

export default FlexBoxes;
