import Immutable from 'immutable'

export const SET_NAV_PROPERTY = 'oneroost/basePage/SET_NAV_PROPERTY'
export const RESET_PAGE = 'oneroost/basePage/RESET_PAGE'
export const SET_PROPERTY = 'oneroost/basePage/SET_PROPERTY'

const initialState = Immutable.fromJS({
    nav: {
        show: true,
        fixed: true,
        style: 'default'
    },
    title: 'OneRoost'
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case RESET_PAGE:
            state = initialState;
            break;
        case SET_NAV_PROPERTY:
            state = state.setIn(['nav', ...action.payload.get('name', '').split('.')], action.payload.get('value'))
            break;
        case SET_PROPERTY:
            state = state.setIn([...action.payload.get('name', '').split('.')], action.payload.get('value'))
            break;
        default:
            break
    }
    return state
}

export function resetPage(){
    return {
        type: RESET_PAGE
    }
}

export function setProperty({name, value}){
    return {
        type: SET_PROPERTY,
        payload: {
            name,
            value
        }
    }
}

export function hideNav(){
    return {
        type: SET_NAV_PROPERTY,
        payload: {
            name: 'show',
            value: false
        }
    }
}

export function showNav(){
    return {
        type: SET_NAV_PROPERTY,
        payload: {
            name: 'show',
            value: true
        }
    }
}

export function setNavProperty({name, value}){
    return {
        type: SET_NAV_PROPERTY,
        payload: {
            name,
            value,
        }
    }
}
