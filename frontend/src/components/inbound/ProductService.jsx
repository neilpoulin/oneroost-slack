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
            //actions
            saveAndContinue,
            createSetter,
            setPitchFilePath,
        } = this.props
        return <div>
            <Header title="Product / Service Information" subtitle={`Tell us more about what you’re offering and how it helps ${teamName}`}/>
            <FlexBoxes defaultContentStyles={true}>
                <div>
                    <h3>Elevator Pitch</h3>
                    <p className='description'>
                        Tell us what is special about your offering
                    </p>
                    <FormGroup label='Team' helperText={`${elevatorRemaining} characters remaining`}>
                        <TextArea placeholder={''}
                            maxLength={300}
                            value={elevatorPitch}
                            onChange={createSetter('elevatorPitch')}
                            rows={10}
                            />
                    </FormGroup>
                </div>
                <div>
                    <h3>Relevancy</h3>
                    <p className='description'>
                        Why do you think your offering will help {teamName}?
                    </p>
                    <FormGroup label='Team' helperText={`${relevancyRemaining} characters remaining`} >
                        <TextArea placeholder={null}
                            maxLength={300}
                            value={relevancy}
                            onChange={createSetter('relevancy')}
                            rows={10}
                            />
                    </FormGroup>
                </div>
                <div>
                    <h3>Pitch Material</h3>
                    <p className='description'>Upload the most recent pitch deck.  Ideally it includes features, benefits, and pricing!</p>
                    <FileUploadForm buttonText={'Upload Document'}
                        fileKeyPrefix={'inbound/pitches'}
                        onCompleted={setPitchFilePath}
                        buttonOutline={true}
                        selectedFilePath={pitchDeckFilePath}
                        />
                </div>
            </FlexBoxes>
            <div>
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
        }
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductService));
