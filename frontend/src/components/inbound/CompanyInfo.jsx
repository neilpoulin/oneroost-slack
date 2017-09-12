import React from 'react'
import {connect} from 'react-redux'
import BackButton from 'molecule/BackButton'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'
import {setFormValue, saveInbound} from 'ducks/inbound'
import {Creatable as Select} from 'react-select'
import Immutable from 'immutable'
import Clickable from 'atoms/Clickable'

class CompanyInfo extends React.Component {
    render () {
        const {
            teamName,
            tags,
            tagOptions,
            channelOptions,
            selectedChannel,
            //actions
            createSetter,
            save,
        } = this.props
        return <div>
            <BackButton/>
            <div className='header'>
                <h2>Company Information</h2>
                <p className='subtitle'>Share a bit about your orginization</p>
            </div>
            <div className='sections'>
                <section className='section'>
                    <div className='content'>
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
                        <FormGroup label='Phone Number'>
                            <TextInput placeholder="555-122-5329" onChange={createSetter('phoneNumber')}/>
                        </FormGroup>
                    </div>
                </section>
                <section className='section'>
                    <div className='content'>
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
                </section>
                <section className='section'>
                    <div className='content'>
                        <h3>Target Buyer</h3>
                        <p className='description'>
                            Which Team at {teamName} will be most interested in your offering?
                        </p>
                        <FormGroup label='Team'>

                        </FormGroup>
                        <Select
                          name="form-field-name"
                          multi={false}
                          value={selectedChannel}
                          options={channelOptions}
                          clearable={true}
                          onChange={({value}) => createSetter('channelId')(value)}
                        />

                    </div>
                </section>
            </div>
            <div>
                <Clickable onClick={save} text={'Save'}/>
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
        save: () => {
            dispatch(saveInbound())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompanyInfo);
