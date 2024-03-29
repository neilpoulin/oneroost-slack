import Immutable from 'immutable'
import Parse from 'parse'
import {SLACK_TEAM_CLASSNAME} from 'models/ModelConstants'
import Inbound from 'models/Inbound'
import SlackTeam from 'models/SlackTeam'
import Vendor from 'models/Vendor'

export const LOAD_TEAM_REQUEST = 'oneroost/inbound/LOAD_TEAM_REQUEST'
export const LOAD_TEAM_SUCCESS = 'oneroost/inbound/LOAD_TEAM_SUCCESS'
export const LOAD_TEAM_ERROR = 'oneroost/inbound/LOAD_TEAM_ERROR'
export const SET_TAG_OPTIONS = 'oneroost/inbound/SET_TAG_OPTIONS'
export const ADD_TAG_OPTION = 'onerost/inbound/ADD_TAG_OPTION'
export const SET_FORM_VALUE = 'oneroost/inbound/SET_FORM_VALUE'
export const UPDATE_TESTIMONIAL = 'oneroost/inbound/UPDATE_TESTIMONIAL'
export const DELETE_TESTIMONIAL = 'oneroost/inbound/DELETE_TESTIMONIAL'
export const ADD_NEW_TESTIMONIAL = 'oneroost/inbound/ADD_NEW_TESTIMONIAL'
export const SUBMIT_SUCCESS = 'oneroost/inbound/SUBMIT_SUCCESS'
export const SUBMIT_ERROR = 'oneroost/inbound/SUBMIT_ERROR'
export const SUBMIT_REQUEST = 'oneroost/inbound/SUBMIT_REQUEST'
export const VENDOR_SIGNUP_REQUEST = 'oneroost/inbound/VENDOR_SIGNUP_REQUEST'
export const VENDOR_SIGNUP_SUCCESS = 'oneroost/inbound/VENDOR_SIGNUP_SUCCESS'
export const VENDOR_SIGNUP_ERROR = 'oneroost/inbound/VENDOR_SIGNUP_ERROR'
export const SET_PRODUCT_INBOUND_SLACK_TEAM_ID = 'oneroost/inbound/SET_PRODUCT_INBOUND_SLACK_TEAM_ID'
export const RESET_STATE = 'oneroost/inbound/RESET_STATE'
export const SET_SELLER_PLANS = 'oneroost/inbound/SET_SELLER_PLANS'

const DEFAULT_SAVE_ERROR_MESSAGE = 'Something went wrong submitting the form. Please try again later.'

const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    teamId: null,
    teamName: null,
    channels: [],
    tagOptions: [],
    submitted: false,
    saving: false,
    error: null,
    vendorSignupSaving: false,
    vendorSignupSuccess: false,
    vendorSignupError: null,
    vendor: null,
    submittedInbound: null,
    sellerPlans: [],
    formInput: {
        tags: [],
        testimonials: [],
    }
})

export default function reducer(state=initialState, action){
    switch (action.type) {
        case RESET_STATE:
            state = initialState
            break;
        case LOAD_TEAM_REQUEST:
            state = state.set('isLoading', true)
            state = state.set('teamId', action.payload.get('teamId'))
            break
        case LOAD_TEAM_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.set('teamName', action.payload.get('name'))
            state = state.set('channels', action.payload.get('channels').toList()
                .filter(c => action.payload.get('selectedChannels').includes(c.get('id')))
                .map(c => c.set('name', action.payload.getIn(['channelVanityNames', c.get('id')], c.get('name'))))
            )
            break;
        case SET_FORM_VALUE:
            state = state.setIn(['formInput', ...action.payload.get('name', '').split('.')], action.payload.get('value'))
            state = state.set('error', null)
            break;
        case SET_TAG_OPTIONS:
            state = state.set('tagOptions', action.payload.get('tags', Immutable.List()))
            break;
        case ADD_TAG_OPTION:
            state = state.set('tagOptions', state.get('tagOptions').push(action.payload))
            break;
        case UPDATE_TESTIMONIAL:
            state = state.setIn(['formInput', 'testimonials', action.payload.get('index'), action.payload.get('name')], action.payload.get('value'))
            break
        case DELETE_TESTIMONIAL:
            state = state.setIn(['formInput', 'testimonials'], state.getIn(['formInput', 'testimonials']).delete(action.payload.get('index')))
            break
        case ADD_NEW_TESTIMONIAL:
            state = state.setIn(['formInput', 'testimonials'], state.getIn(['formInput', 'testimonials']).push(Immutable.fromJS({customerName: '', comment: ''})))
            break;
        case SUBMIT_REQUEST:
            state = state.set('saving', true)
            state = state.set('error', null)
            break;
        case SUBMIT_SUCCESS:
            state = state.set('saving', false)
            state = state.set('submitted', true)
            state = state.set('error', null)
            state = state.set('submittedInbound', action.payload)
            break;
        case SUBMIT_ERROR:
            state = state.set('saving', false)
            state = state.set('submitted', false)
            state = state.set('error', Immutable.Map({
                friendlyText: action.payload.getIn(['message', 'friendlyText'], DEFAULT_SAVE_ERROR_MESSAGE)
            }))
            break;
        case VENDOR_SIGNUP_REQUEST:
            state = state.set('vendorSignupSaving', true)
            state = state.set('vendorSignupSuccess', false)
            state = state.set('vendorSignupError', null)
            break;
        case VENDOR_SIGNUP_SUCCESS:
            state = state.set('vendorSignupSaving', false)
            state = state.set('vendorSignupSuccess', true)
            state = state.set('vendorSignupError', null)
            state = state.set('vendor', action.payload)
            break;
        case VENDOR_SIGNUP_ERROR:
            state = state.set('vendorSignupSaving', false)
            state = state.set('vendorSignupSuccess', false)
            state = state.set('vendorSignupError',  Immutable.Map({
                friendlyText: action.payload.getIn(['message', 'friendlyText'], DEFAULT_SAVE_ERROR_MESSAGE)
            }))
            break;
        case SET_PRODUCT_INBOUND_SLACK_TEAM_ID:
            state = state.set('productInboundSlackTeamId')
            break;
        case SET_SELLER_PLANS:
            state = state.set('sellerPlans', action.payload)
            break
        default:
            break
    }
    return state
}

//Use dot-delimited to nest values
export function setFormValue(name, value){
    return {
        type: SET_FORM_VALUE,
        payload: {
            name,
            value,
        }
    }
}

export function updateTestimonal({index, name, value}){
    return {
        type: UPDATE_TESTIMONIAL,
        payload: {
            index,
            name,
            value,
        }
    }
}

export function createTestimonial(){
    return {
        type: ADD_NEW_TESTIMONIAL
    }
}

export function deleteTestimonial(index){
    return {
        type: DELETE_TESTIMONIAL,
        payload: {
            index,
        }
    }
}

export function getSlackTeamById(teamId){
    let query = new Parse.Query(SLACK_TEAM_CLASSNAME)
    return query.get(teamId)
}

export function loadTeam(teamId){
    return dispatch => {
        dispatch({
            type: RESET_STATE
        })
        dispatch({
            type: LOAD_TEAM_REQUEST,
            payload: {
                teamId
            }
        })
        dispatch(loadTagOptions())
        return getSlackTeamById(teamId).then(team => {
            dispatch({
                type: LOAD_TEAM_SUCCESS,
                payload: team.toJSON(),
            })
        })
    }
}

export function loadProductInboundTeam(){
    return dispatch => {
        dispatch({
            type: RESET_STATE
        })
        return Parse.Config.get().then(config => {
            let slackTeamId = config.get('inboundProductSlackTeamId')
            dispatch({
                type: SET_PRODUCT_INBOUND_SLACK_TEAM_ID,
                payload: config.get('inboundProductSlackTeamId'),
            })
            return dispatch(loadTeam(slackTeamId))
        }).then(() => {
            dispatch(setFormValue('inboundType', 'PRODUCT'))
        })
    }
}

export function loadTagOptions(){
    return dispatch => {
        Parse.Config.get().then(config => {
            dispatch({
                type: SET_TAG_OPTIONS,
                payload: {
                    tags: config.get('inboundTagOptions') || []
                }
            })
        })

    }
}

export function saveInbound(){
    return (dispatch, getState) => {
        let inboundState = getState().inbound
        let form = inboundState.get('formInput').toJS()
        form.tags = form.tags.map(tag => tag.value)
        let inbound = new Inbound(form)
        inbound.set('slackTeam', SlackTeam.createWithoutData(inboundState.get('teamId')))
        return inbound.save().then(savedInbound => {
            dispatch({
                type: SET_FORM_VALUE,
                payload: {
                    name: 'objectId',
                    value: savedInbound.id
                }
            })
            return savedInbound
        })
    }
}

export function submitInbound(){
    return (dispatch, getState) => {
        dispatch({
            type: SUBMIT_REQUEST
        })
        return dispatch(saveInbound()).then(inbound => {
            return Parse.Cloud.run('submitInboundProposal', {inboundId: inbound.id}).then((result) => {
                console.log(result)
                inbound.set('submitted', true)
                inbound.set('submittedDate', new Date())
                return inbound.save()
            }).then((saved) => {
                dispatch({
                    type: SUBMIT_SUCCESS,
                    payload: saved.toJSON(),
                })
            }).catch((error) => {
                console.error(error)
                dispatch({
                    type: SUBMIT_ERROR,
                    payload: {
                        message: error.message.error,
                    }
                })
                throw error
            })
        }).catch(error => {
            console.error(error)
            throw error
        })
    }
}

export function submitVendor(){
    return (dispatch, getState) => {

        const {vendorSignupSuccess, formInput: {name, email}, submittedInbound} = getState().inbound.toJS()
        if (vendorSignupSuccess)
        {
            console.log('vendor already signed up')
            return null;
        }

        dispatch({
            type: VENDOR_SIGNUP_REQUEST
        })
        let inbound = Inbound.createWithoutData(submittedInbound.objectId)

        let vendor = new Vendor()
        vendor.set({
            name,
            email,
            inbound,
        })
        vendor.save().then(savedVendor => {
            dispatch({
                type: VENDOR_SIGNUP_SUCCESS,
                payload: savedVendor.toJSON()
            })
        }).catch(error => {
            dispatch({
                type: VENDOR_SIGNUP_ERROR,
                error,
                payload: {
                    friendlyText: 'Something went wrong while signing up. Please try again later.',
                    ...error},
            })
        })
    }
}


export function loadSellerPlans(){
    return dispatch => {
        Parse.Config.get().then(config => {
            let plans = config.get('sellerPlans')
            if (plans){
                dispatch({
                    type: SET_SELLER_PLANS,
                    payload: plans,
                })
            }
        })
    }
}