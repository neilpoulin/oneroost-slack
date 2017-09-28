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
        teamName: PropTypes.string,
        nextRoute: PropTypes.any,
        saveAndContinue: PropTypes.func,
        addTestimonial: PropTypes.func,
        createTestimonialSetter: PropTypes.func,
        removeTestimonial: PropTypes.func,
        setCaseStudyFilePath: PropTypes.func,
        caseStudyFilePath: PropTypes.string,
        setCaseStudyUrl: PropTypes.func,
        clearCaseStudy: PropTypes.func,
        caseStudyUrl: PropTypes.string,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render () {
        const {
            testimonials,
            caseStudyFilePath,
            teamName,
            caseStudyUrl,
            //actions
            saveAndContinue,
            createTestimonialSetter,
            addTestimonial,
            removeTestimonial,
            setCaseStudyFilePath,
            setCaseStudyUrl,
            clearCaseStudy,
        } = this.props

        return <div className='container'>
            <Header title={'Customer Validation'} subtitle={'Let us know what previous customers are saying.  Optional but highly recommended!'}/>
            <div className='flexboxes'>
                <FlexBoxes defaultContentStyles={false}>
                    <div className='content'>
                        <h3>Case Study</h3>
                        <p className='description'>Upload the a case study that illustrates how your offering could impact {teamName}.</p>
                        <FileUploadForm buttonText={'Upload a Case Study'}
                            fileKeyPrefix={'inbound/pitches'}
                            onCompleted={setCaseStudyFilePath}
                            buttonOutline={true}
                            selectedFilePath={caseStudyFilePath}
                            onClear={clearCaseStudy}
                            showUrlInput={true}
                            onUrlChange={setCaseStudyUrl}
                            url={caseStudyUrl}
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
        caseStudyFilePath: formInput.get('caseStudyFilePath'),
        caseStudyUrl: formInput.get('caseStudyUrl'),
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
        },
        setCaseStudyUrl: (url='') => {
            dispatch(setFormValue('caseStudyUrl', url.trim()))
        },
        clearCaseStudy: () => {
            dispatch(setFormValue('caseStudyUrl', null))
            dispatch(setFormValue('caseStudyFilePath', null))
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomerValidation));
