import React from 'react'

class FlexBoxes extends React.Component {
    render () {
        const {children} = this.props
        return <div className='sections'>
            {React.Children.map(children, (child, i) => {
                return <section className='section'>
                    <div className='content' key={`flexboxs_${i}`}>
                        {child}
                    </div>
                </section>
            })}
        </div>
    }
}

export default FlexBoxes;
