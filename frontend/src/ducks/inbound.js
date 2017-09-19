import Immutable from 'immutable'
import Parse from 'parse'
import {SLACK_TEAM_CLASSNAME} from 'models/ModelConstants'
import Inbound from 'models/Inbound'
import SlackTeam from 'models/SlackTeam'

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

const DEFAULT_SAVE_ERROR_MESSAGE = 'Something went wrong submitting the form. Please try again later.'

const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    teamId: null,
    hasLoaded: false,
    teamName: null,
    channels: [],
    tagOptions: [],
    submitted: false,
    saving: false,
    error: null,
    formInput: {
        tags: [],
        testimonials: [],
    }
})

export default function reducer(state=initialState, action){
    switch (action.type) {
        case LOAD_TEAM_REQUEST:
            state = state.set('isLoading', true)
            state = state.set('teamId', action.payload.get('teamId'))
            break
        case LOAD_TEAM_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.set('teamName', action.payload.get('name'))
            state = state.set('channels', action.payload.get('channels').toList().filter(c => action.payload.get('selectedChannels').includes(c.get('id'))))
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
            break;
        case SUBMIT_ERROR:
            state = state.set('saving', false)
            state = state.set('submitted', false)
            state = state.set('error', Immutable.Map({
                friendlyText: action.payload.getIn(['message', 'friendlyText'], DEFAULT_SAVE_ERROR_MESSAGE)
            }))
            break;
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
            type: LOAD_TEAM_REQUEST,
            payload: {
                teamId
            }
        })
        dispatch(loadTagOptions())
        getSlackTeamById(teamId).then(team => {
            dispatch({
                type: LOAD_TEAM_SUCCESS,
                payload: team.toJSON(),
            })
        })
    }
}

export function loadTagOptions(){
    return dispatch => {
        dispatch({
            type: SET_TAG_OPTIONS,
            payload: {
                tags: [
                    { value: 'CRM', label: 'CRM' },
                    { value: 'APPLICANT_TRACKING', label: 'Applicant Tracking' },
                ]
            }
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
        dispatch(saveInbound()).then(inbound => {
            Parse.Cloud.run('submitInboundProposal', {inboundId: inbound.id}).then((result) => {
                console.log(result)
                inbound.set('submitted', true)
                inbound.set('submittedDate', new Date())
                return inbound.save()
            }).then(() => {
                dispatch({
                    type: SUBMIT_SUCCESS
                })
            }).catch((error) => {
                console.error(error)
                dispatch({
                    type: SUBMIT_ERROR,
                    payload: {
                        message: error.message,
                    }
                })
            })
        }).catch(error => {
            console.error(error)
        })
    }
}
