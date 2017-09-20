import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'
import {setFormValue, saveInbound} from 'ducks/inbound'
import {Creatable as Select} from 'react-select'
import Immutable from 'immutable'
import Clickable from 'atoms/Clickable'
import {withRouter} from 'react-router-dom'
import Header from './Header'
import FlexBoxes from 'molecule/FlexBoxes'

class CompanyInfo extends React.Component {
    static propTypes = {
        nextRoute: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired
    }
    render () {
        const {
            teamName,
            tags,
            tagOptions,
            channelOptions,
            selectedChannel,
            //actions
            createSetter,
            saveAndContinue,
        } = this.props
        return <div>
            <Header title="Company Information" subtitle={'Share a bit about your orginazation'}/>
            <FlexBoxes defaultContentStyles={true}>
                <div>
                    <h3>Basics</h3>
                    <FormGroup label='Company Name'>
                        <TextInput onChange={createSetter('companyName')}/>
                    </FormGroup>
                    <FormGroup label='Your Name'>
                        <TextInput placeholder="Jon Doe" onChange={createSetter('fullName')}/>
                    </FormGroup>
                    <FormGroup label='Email' >
                        <TextInput placeholder="name@company.com" onChange={createSetter('email')} type='email'/>
                    </FormGroup>
                    <FormGroup label='Website' >
                        <TextInput placeholder="https://www.company.com" onChange={createSetter('website')} type='url'/>
                    </FormGroup>
                    <FormGroup label='Phone Number'>
                        <TextInput placeholder="555-122-5329" onChange={createSetter('phoneNumber')}/>
                    </FormGroup>
                </div>
                <div>
                    <h3>Categories</h3>
                    <p className='description'>
                        Which categories best represent your offering, e.g. CRM, applicant tracking, etc.
                    </p>
                    <Select
                      name="form-field-name"
                      multi={true}
                      value={tags}
                      options={tagOptions}
                      clearable={false}
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
        label: `#${c.name}`,
        value: c.id,
    }))
    return {
        tagOptions: state.inbound.get('tagOptions').toJS(),
        tags: state.inbound.getIn(['formInput', 'tags'], Immutable.List()).toJS(),
        channelOptions,
        selectedChannel: state.inbound.getIn(['formInput', 'channelId'])
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
