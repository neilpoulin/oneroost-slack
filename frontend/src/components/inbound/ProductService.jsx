import React from 'react'
import BackButton from 'molecule/BackButton'
import Header from './Header'
import FlexBoxes from 'molecule/FlexBoxes'
import FormGroup from 'molecule/FormGroup'
import TextArea from 'atoms/form/TextArea'
import Clickable from 'atoms/Clickable'

class ProductService extends React.Component {
    render () {
        const {teamName} = this.props
        return <div>
            <BackButton/>
            <Header title="Product / Service Information" subtitle={`Tell us more about what you’re offering and how it helps ${teamName}`}/>
            <FlexBoxes>
                <div>
                    <h3>Elevator Pitch</h3>
                    <p className='description'>
                        300 charachters max
                    </p>
                    <FormGroup label='Team'>
                        <TextArea/>
                    </FormGroup>
                </div>
                <div>
                    <h3>Revelancy</h3>
                    <p className='description'>
                        300 charachters max
                    </p>
                    <FormGroup label='Team'>
                        <TextArea/>
                    </FormGroup>
                </div>
                <div>
                    <h3>Pitch Material</h3>
                    <p className='description'>Upload the most recent pitch deck.  Ideally it includes features, benefits, and pricing!</p>
                    <Clickable text='Upload Document'/>
                </div>
            </FlexBoxes>
        </div>
    }
}

export default ProductService;
