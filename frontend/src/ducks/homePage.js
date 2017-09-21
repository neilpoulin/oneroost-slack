import Immutable from 'immutable'
import Parse from 'parse'

export const GET_PAGE_CONFIG = 'oneroost/homePage/GET_HOME_PAGE_CONFIG'
export const SET_PAGE_CONFIG = 'oneroost/homePage/SET_PAGE_CONFIG'

export const initialState = Immutable.fromJS({
    heroTitle: null,
    heroSubTitle: null,
    ctaSubText: null,
    ctaButtonText: null,
    paragraphs: [],
    extensionUrl: null,
    isLoading: false,
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
