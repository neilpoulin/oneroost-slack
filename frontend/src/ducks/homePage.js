import Immutable from 'immutable'
import Parse from 'parse'

export const GET_PAGE_CONFIG = 'oneroost/homePage/GET_HOME_PAGE_CONFIG'
export const SET_PAGE_CONFIG = 'oneroost/homePage/SET_PAGE_CONFIG'

export const INSTALL_CHROME_EXTENSION_REQUEST = 'oneroost/homePage/INSTALL_CHROME_EXTENSION_REQUEST'
export const INSTALL_CHROME_EXTENSION_SUCCESS = 'oneroost/homePage/INSTALL_CHROME_EXTENSION_SUCCESS'
export const INSTALL_CHROME_EXTENSION_ERROR = 'oneroost/homePage/INSTALL_CHROME_EXTENSION_ERROR'

export const initialState = Immutable.fromJS({
    heroTitle: null,
    heroSubTitle: null,
    ctaSubText: null,
    ctaButtonText: null,
    paragraphs: [],
    extensionUrl: null,
    isLoading: false,
    chromeExtension: {
        installing: false,
        installed: false,
        success: false,
        error: null
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
