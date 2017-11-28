import Immutable from 'immutable'
import Parse from 'parse'
import Waitlist from 'models/Waitlist'
import {isValidEmail} from 'util/Validators'

export const GET_PAGE_CONFIG = 'oneroost/homePage/GET_HOME_PAGE_CONFIG'
export const SET_PAGE_CONFIG = 'oneroost/homePage/SET_PAGE_CONFIG'

export const INSTALL_CHROME_EXTENSION_REQUEST = 'oneroost/homePage/INSTALL_CHROME_EXTENSION_REQUEST'
export const INSTALL_CHROME_EXTENSION_SUCCESS = 'oneroost/homePage/INSTALL_CHROME_EXTENSION_SUCCESS'
export const INSTALL_CHROME_EXTENSION_ERROR = 'oneroost/homePage/INSTALL_CHROME_EXTENSION_ERROR'
export const SET_WAITLIST_EMAIL = 'oneroost/homePage/SET_WAITLIST_EMAIL'
export const SUBMIT_WAITLIST_REQUEST = 'oneroost/homePage/SUBMIT_WAITLIST_REQUEST'
export const SUBMIT_WAITLIST_SUCCESS = 'oneroost/homePage/SUBMIT_WAITLIST_SUCCESS'
export const SUBMIT_WAITLIST_ERROR = 'oneroost/homePage/SUBMIT_WAITLIST_ERROR'

export const initialState = Immutable.fromJS({
    heroTitle: null,
    heroSubTitle: null,
    ctaSubText: null,
    ctaButtonText: null,
    paragraphs: [],
    videos: [],
    extensionUrl: null,
    isLoading: false,
    sellerLandingPage: {},
    buyerLandingPage: {},
    chromeExtension: {
        installing: false,
        installed: false,
        success: false,
        error: null
    },
    waitlist:{
        email: '',
        emailValid: false,
        saving: false,
        saveSuccess: false,
        error: null,
    }
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case GET_PAGE_CONFIG:
            state = state.set('isLoading', true)
            break;
        case SET_PAGE_CONFIG:
            state = state.mergeDeep(action.payload)
            state = state.set('isLoading', false)
            break;
        case INSTALL_CHROME_EXTENSION_REQUEST:
            state = state.setIn(['chromeExtension', 'installing'], true)
            break;
        case INSTALL_CHROME_EXTENSION_SUCCESS:
            state = state.setIn(['chromeExtension', 'installing'], false)
            state = state.setIn(['chromeExtension', 'installed'], true)
            state = state.setIn(['chromeExtension', 'success'], true)
            state = state.setIn(['chromeExtension', 'error'], null)
            break;
        case INSTALL_CHROME_EXTENSION_ERROR:
            state = state.setIn(['chromeExtension', 'installing'], false)
            state = state.setIn(['chromeExtension', 'success'], false)
            state = state.setIn(['chromeExtension', 'error'], action.payload)
            break;
        case SET_WAITLIST_EMAIL:
            state = state.setIn(['waitlist', 'email'], action.payload.get('email'));
            state = state.setIn(['waitlist', 'emailValid'], action.payload.get('isValid'));
            state = state.setIn(['waitlist', 'saveSuccess'], false)
            break
        case SUBMIT_WAITLIST_REQUEST:
            state = state.setIn(['waitlist', 'saving'], true)
            state = state.setIn(['waitlist', 'error'], null)
            break
        case SUBMIT_WAITLIST_SUCCESS:
            state = state.setIn(['waitlist', 'saving'], false)
            state = state.setIn(['waitlist', 'saveSuccess'], true)
            state = state.setIn(['waitlist', 'error'], null)
            break
        case SUBMIT_WAITLIST_ERROR:
            state = state.setIn(['waitlist', 'saving'], false)
            state = state.setIn(['waitlist', 'saveSuccess'], false)
            state = state.setIn(['waitlist', 'error'], action.payload.error)
            break
        default:
            break;
    }
    return state;
}

export function loadPage(){
    return dispatch => {
        dispatch({
            type: GET_PAGE_CONFIG
        })

        Parse.Config.get().then(config => {
            dispatch({
                type: SET_PAGE_CONFIG,
                payload: config.get('homePage', {}),
            })
        })
    }
}

export function loadLandingPage(){
    return dispatch => {
        dispatch({
            type: GET_PAGE_CONFIG
        })

        Parse.Config.get().then(config => {
            dispatch({
                type: SET_PAGE_CONFIG,
                payload: {
                    'buyerLandingPage': config.get('buyerLandingPage', {}),
                    'sellerLandingPage': config.get('sellerLandingPage', {})
                },
            })
        })
    }
}

export function setWaitlistEmail(email){
    return dispatch => {
        dispatch({
            type: SET_WAITLIST_EMAIL,
            payload: {
                email,
                isValid: isValidEmail(email)
            },
        })
    }
}

export function submitWaitlist(){
    return (dispatch, getState) => {
        const email = getState().homePage.getIn(['waitlist', 'email'])
        dispatch({type: SUBMIT_WAITLIST_REQUEST})
        let waitlist = new Waitlist()
        waitlist.set({email})
        waitlist.save().then(saved => {
            dispatch({type: SUBMIT_WAITLIST_SUCCESS})
        }).catch(error => {
            console.error('Failed to save waitlist', error)
        })
    }
}