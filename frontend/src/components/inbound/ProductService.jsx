import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import Header from './Header'
import FlexBoxes from 'molecule/FlexBoxes'
import FormGroup from 'molecule/FormGroup'
import TextArea from 'atoms/form/TextArea'
import Clickable from 'atoms/Clickable'
import {setFormValue, saveInbound} from 'ducks/inbound'
import Immutable from 'immutable'
import FileUploadForm from 'organisms/FileUploadForm'

const MAX_CHARACTERS = 300

class ProductService extends React.Component {

    static propTypes = {
        pitchDeckFilePath: PropTypes.string,
        teamName: PropTypes.string,
        elevatorPitch: PropTypes.string,
        elevatorRemaining: PropTypes.any,
        relevancy: PropTypes.string,
        relevancyRemaining: PropTypes.any,
        saveAndContinue: PropTypes.func.isRequired,
        createSetter: PropTypes.func.isRequired,
        setPitchFilePath: PropTypes.func.isRequired,
        setPitchUrl: PropTypes.func,
        clearPitch: PropTypes.func,
        pitchDeckUrl: PropTypes.string,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render () {
        const {
            teamName,
            //state,
            elevatorPitch,
            elevatorRemaining,
            relevancy,
            relevancyRemaining,
            pitchDeckFilePath,
            pitchDeckUrl,
            //actions
            saveAndContinue,
            createSetter,
            setPitchFilePath,
            setPitchUrl,
            clearPitch,
        } = this.props
        return <div>
            <Header title="Product / Service Information" subtitle={`Let prospective buyers know what makes you unique and effective`}/>
            <FlexBoxes defaultContentStyles={true}>
                <div>
                    <h3>Elevator Pitch</h3>
                    <p className='description'>
                        Tell us what is special about your offering
                    </p>
                    <FormGroup label='' helperText={`${elevatorRemaining} characters remaining`}>
                        <TextArea placeholder={'We help our customers solve...'}
                            maxLength={300}
                            value={elevatorPitch}
                            onChange={createSetter('elevatorPitch')}
                            rows={10}
                        />
                    </FormGroup>
                </div>
                <div>
                    <h3>Integrations</h3>
                    <p className='description'>
                        List relevant integrations (comma separated)
                    </p>
                    <FormGroup label='' helperText={`${relevancyRemaining} characters remaining`} >
                        <TextArea placeholder={'SalesForce, HubSpot, Marketo, ...'}
                            maxLength={300}
                            value={relevancy}
                            onChange={createSetter('relevancy')}
                            rows={10}
                        />
                    </FormGroup>
                </div>
                <div>
                    <h3>Pitch Material</h3>
                    <p className='description'>Upload the most recent pitch deck.  Ideally it includes features, benefits, and pricing</p>
                    <FileUploadForm buttonText={'Upload Document'}
                        fileKeyPrefix={'inbound/pitches'}
                        onCompleted={setPitchFilePath}
                        buttonOutline={true}
                        onClear={clearPitch}
                        selectedFilePath={pitchDeckFilePath}
                        showUrlInput={true}
                        onUrlChange={setPitchUrl}
                        url={pitchDeckUrl}
                    />
                </div>
            </FlexBoxes>
            <div className='actions'>
                <Clickable onClick={saveAndContinue} text={'Continue'}/>
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    const formInput = state.inbound.get('formInput', Immutable.Map())
    const elevatorPitch = formInput.get('elevatorPitch', '')
    const relevancy = formInput.get('relevancy', '')
    return {
        elevatorPitch,
        elevatorRemaining:  MAX_CHARACTERS - elevatorPitch.length,
        relevancy,
        relevancyRemaining: MAX_CHARACTERS - relevancy.length,
        pitchDeckFilePath: formInput.get('pitchDeckFilePath'),
        pitchDeckUrl: formInput.get('pitchDeckUrl')
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
        setPitchFilePath: ({filePath}) => {
            console.log('got the file path!', filePath)
            dispatch(setFormValue('pitchDeckFilePath', filePath))
        },
        setPitchUrl: (url='') => {
            dispatch(setFormValue('pitchDeckUrl', url.trim()))
        },
        clearPitch: () => {
            dispatch(setFormValue('pitchDeckFilePath', null))
        }
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductService));
