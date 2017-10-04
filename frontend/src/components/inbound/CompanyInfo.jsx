import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'
import {setFormValue, saveInbound} from 'ducks/inbound'
import Select, {Creatable} from 'react-select'
import Immutable from 'immutable'
import Clickable from 'atoms/Clickable'
import {withRouter} from 'react-router-dom'
import Header from './Header'
import FlexBoxes from 'molecule/FlexBoxes'

class CompanyInfo extends React.Component {
    static propTypes = {
        nextRoute: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        tagOptions: PropTypes.arrayOf(PropTypes.object),
        channelOptions: PropTypes.arrayOf(PropTypes.object),
        selectedChannel: PropTypes.string,
        companyName: PropTypes.string,
        website: PropTypes.string,
        fullName: PropTypes.string,
        email: PropTypes.string,
        phoneNumber: PropTypes.any,
        //actions
        createSetter: PropTypes.func.isRequired,
        saveAndContinue: PropTypes.func.isRequired,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render () {
        const {
            teamName,
            tags,
            tagOptions,
            channelOptions,
            selectedChannel,
            companyName,
            website,
            fullName,
            email,
            phoneNumber,
            //actions
            createSetter,
            saveAndContinue,
        } = this.props
        return <div>
            <Header title="Company Information" subtitle={'Share a bit about your organization'}/>
            <FlexBoxes defaultContentStyles={true}>
                <div>
                    <h3>Basics</h3>
                    <FormGroup label='Company Name'>
                        <TextInput onChange={createSetter('companyName')} value={companyName}/>
                    </FormGroup>
                    <FormGroup label='Your Name'>
                        <TextInput placeholder="Jon Doe" onChange={createSetter('fullName')} value={fullName}/>
                    </FormGroup>
                    <FormGroup label='Email' >
                        <TextInput placeholder="name@company.com" onChange={createSetter('email')} type='email' value={email}/>
                    </FormGroup>
                    <FormGroup label='Website' >
                        <TextInput placeholder="https://www.company.com" onChange={createSetter('website')} value={website}/>
                    </FormGroup>
                    <FormGroup label='Phone Number'>
                        <TextInput placeholder="555-122-5329" onChange={createSetter('phoneNumber')} value={phoneNumber}/>
                    </FormGroup>
                </div>
                <div>
                    <h3>Categories</h3>
                    <p className='description'>
                        Which categories best represent your offering, e.g. CRM, applicant tracking, etc.
                    </p>
                    <Creatable
                        name="form-field-name"
                        multi={true}
                        value={tags}
                        options={tagOptions}
                        clearable={false}
                        placeholder={'Enter tags...'}
                        noResultsText={'Enter a new tag...'}
                        onChange={createSetter('tags')}
                    />
                </div>
                <div >
                    <h3>Target Buyer</h3>
                    <p className='description'>
                        Which Team at {teamName} will be most interested in your offering?
                    </p>
                    <FormGroup label='Team'>
                        <Select
                            name="form-field-name"
                            multi={false}
                            value={selectedChannel}
                            options={channelOptions}
                            clearable={true}
                            placeholder={'Select a team...'}
                            onChange={({value}) => createSetter('channelId')(value)}
                        />
                    </FormGroup>
                </div>
            </FlexBoxes>
            <div>
                <Clickable onClick={saveAndContinue} text={'Continue'}/>
            </div>
        </div>

    }
}

const mapStateToProps = (state, ownProps) => {
    const channelOptions = state.inbound.get('channels', Immutable.List()).toJS().map(c => ({
        label: `${c.name}`,
        value: c.id,
    }))
    const {
        companyName,
        website,
        fullName,
        email,
        phoneNumber,
    } = state.inbound.get('formInput').toJS()
    return {
        tagOptions: state.inbound.get('tagOptions').toJS(),
        tags: state.inbound.getIn(['formInput', 'tags'], Immutable.List()).toJS(),
        channelOptions,
        selectedChannel: state.inbound.getIn(['formInput', 'channelId']),
        companyName,
        website,
        fullName,
        email,
        phoneNumber,
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
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CompanyInfo));
