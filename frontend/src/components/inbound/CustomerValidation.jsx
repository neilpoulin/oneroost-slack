import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import Header from './Header'
import FlexBoxes from 'molecule/FlexBoxes'
import Clickable from 'atoms/Clickable'
import TextInput from 'atoms/form/TextInput'
import TextArea from 'atoms/form/TextArea'
import FormGroup from 'molecule/FormGroup'
import Immutable from 'immutable'
import FileUploadForm from 'organisms/FileUploadForm'
import {setFormValue, saveInbound, updateTestimonal, deleteTestimonial, createTestimonial} from 'ducks/inbound'

class CustomerValidation extends React.Component {
    static propTypes = {
        testimonials: PropTypes.arrayOf(PropTypes.shape({
            customerName: PropTypes.string,
            review: PropTypes.string,
        })),
        nextRoute: PropTypes.any,
        saveAndContinue: PropTypes.func,
        addTestimonial: PropTypes.func,
        createTestimonialSetter: PropTypes.func,
        removeTestimonial: PropTypes.func,
        setCaseStudyFilePath: PropTypes.func,
        caseStudyFilePath: PropTypes.string,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render () {
        const {
            testimonials,
            caseStudyFilePath,
            //actions
            saveAndContinue,
            createTestimonialSetter,
            addTestimonial,
            removeTestimonial,
            setCaseStudyFilePath
        } = this.props

        return <div className='container'>
            <Header title={'Customer Validation'} subtitle={'Let us know what previous customers are saying.  Optional but highly recommended!'}/>
            <div className='flexboxes'>
                <FlexBoxes defaultContentStyles={false}>
                    <div className='content'>
                        <h3>Case Study</h3>
                        <FileUploadForm buttonText={'Upload a Case Study'}
                            fileKeyPrefix={'inbound/pitches'}
                            onCompleted={setCaseStudyFilePath}
                            buttonOutline={true}
                            selectedFilePath={caseStudyFilePath}
                            />
                    </div>
                    {testimonials.map((testimonial, i) => {
                        return <div key={`testimonial-${i}`} className='content'>
                            <h3>Testimonials</h3>
                            <FormGroup label='Customer Name'>
                                <TextInput onChange={createTestimonialSetter(i, 'customerName')} value={testimonial.customerName}/>
                            </FormGroup>
                            <FormGroup label='Comments'>
                                <TextArea rows={6} onChange={createTestimonialSetter(i, 'comment')} value={testimonial.comment}/>
                            </FormGroup>
                            <div>
                                <Clickable look='link' onClick={() => removeTestimonial(i)} text='remove'/>
                            </div>
                        </div>
                    })}
                    <div className='addTestimonial'>
                        <div className='actions'>
                            <Clickable inline={true} onClick={addTestimonial} outline={true} text='Add New Testimonial'/>
                        </div>
                    </div>
                </FlexBoxes>
            </div>
            <div>
                <Clickable onClick={saveAndContinue} text={'Continue'}/>
            </div>
        </div>
    }
}


const mapStateToProps = (state, ownProps) => {
    const formInput = state.inbound.get('formInput', Immutable.Map())
    return {
        testimonials: formInput.get('testimonials', Immutable.List()).toJS(),
        caseStudyFilePath: formInput.get('caseStudyFilePath')
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        createSetter: (name) => (value) => {
            dispatch(setFormValue(name, value))
        },

        saveAndContinue: () => {
            dispatch(saveInbound()).then(saved => {
                ownProps.history.push(ownProps.nextRoute)
            })
        },
        createTestimonialSetter: (index, name) => value => {
            dispatch(updateTestimonal({index, name, value}))
        },
        addTestimonial: () => {
            dispatch(createTestimonial())
        },
        removeTestimonial: (i) => {
            dispatch(deleteTestimonial(i))
        },
        setCaseStudyFilePath: ({filePath}) => {
            dispatch(setFormValue('caseStudyFilePath', filePath))
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomerValidation));
