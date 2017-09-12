import React from 'react'
import {connect} from 'react-redux'
import BackButton from 'molecule/BackButton'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'

class CompanyInfo extends React.Component {
    render () {
        return <div>

                <BackButton/>
                <div className='header'>
                    <h2>Company Information</h2>
                    <p className='subtitle'>Share a bit about your orginization</p>
                </div>
                <div className='sections'>
                    <section className='section'>
                        <div className='content'>
                            <FormGroup label='Basics'>
                                <TextInput placeholder="testing"/>
                            </FormGroup>
                            <FormGroup label='Secondaryalsdjfalskfjalkjf'>
                                <TextInput placeholder="my thing"/>
                            </FormGroup>
                            <FormGroup label='Longer Titlesbha third word please make a long selection' >
                                <TextInput placeholder="my thing"/>
                            </FormGroup>
                            <FormGroup label='Basics'>
                                <TextInput placeholder="testing"/>
                            </FormGroup>
                        </div>
                    </section>
                    <section className='section'>
                        <div className='content'>
                            Categories
                            <FormGroup label='Basics'>
                                <TextInput placeholder="testing"/>
                            </FormGroup>
                            <FormGroup label='Secondaryalsdjfalskfjalkjf'>
                                <TextInput placeholder="my thing"/>
                            </FormGroup>
                        </div>
                    </section>
                    <section className='section'>
                        <div className='content'>
                            Target Buyer
                            <FormGroup label='Basics'>
                                <TextInput placeholder="testing"/>
                            </FormGroup>
                            <FormGroup label='Secondaryalsdjfalskfjalkjf'>
                                <TextInput placeholder="my thing"/>
                            </FormGroup>
                        </div>
                    </section>
                </div>
            </div>

    }
}

const mapStateToProps = (state, ownProps) => {
    return {

    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompanyInfo);
