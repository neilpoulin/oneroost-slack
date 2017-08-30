import Parse from "parse"
import {fromJS} from "immutable"
import {handleSignInClick, handleSignOutClick} from "background/googleAuth"

export const LOG_IN_REQUEST = "oneroost/user/LOG_IN_REQUEST"
export const LOG_IN_SUCCESS = "oneroost/user/LOGIN_IN_SUCCESS"
export const LOG_IN_ERROR = "oneroost/user/LOG_IN_ERROR"

export const LOG_OUT_REQUEST = "oneroost/user/LOG_OUT_REQUEST"
export const LOG_OUT_SUCCESS = "oneroost/user/LOG_OUT_SUCCESS"

export const UPDATE_USER_INFO = "oneroost/user/UPDATE_USER_INFO"

export const GOOGLE_LOG_IN_SUCCESS = "oneroost/user/GOOGLE_LOG_IN_SUCCESS"
export const GOOGLE_LOG_OUT_SUCCESS = "oneroost/user/GOOGLE_LOG_OUT_SUCCESS"

// ALIASES
export const LOG_IN_ALIAS = "oneroost/user/LOG_IN_ALIAS"
export const LOG_OUT_ALIAS = "oneroost/user/LOG_OUT_ALIAS"
export const LOG_IN_GOOGLE_ALIAS = "oneroost/user/LOG_IN_GOOGLE_ALIAS"
export const LOG_OUT_GOOGLE_ALIAS = "oneroost/user/LOG_OUT_GOOGLE_ALIAS"

const initialState = {
    isLogin: false,
    userId: null,
    accountId: null,
    firstName: null,
    lastName: null,
    isLoading: false,
    googleEmail: null,
    role: null,
    error: null,
}

const getUserIdFromAction = (action) => {
    return action.userId || action.payload.userId || action.payload.objectId || action.payload.id || null
}

export default function reducer(state=initialState, action){
    state = fromJS(state).toJS()
    const payload = action.payload
    switch(action.type){
        case LOG_IN_REQUEST:
            state.isLoading = true;
            break;
        case LOG_IN_SUCCESS:
            state.userId = getUserIdFromAction(action);
            state.isLoading = false;
            state.accountId = action.payload.account.objectId;
            state.isLoggedIn = true;
            break;
        case UPDATE_USER_INFO:
            state.firstName = payload.firstName;
            state.lastName = payload.lastName;
            if (payload.account){
                state.accountId = payload.account.objectId;
                state.accountName = payload.account.accountName;
            }
            if (payload.accountSeat){
                state.role = payload.accountSeat.role
            }
            break;
        case LOG_OUT_SUCCESS:
            state = initialState
            break;
        case LOG_IN_ERROR:
            console.error(action)
            break;
        case GOOGLE_LOG_IN_SUCCESS:
            state.googleEmail = action.payload.email
            break;
        case GOOGLE_LOG_OUT_SUCCESS:
            state.googleEmail = null
            break;
        default:
            break;
    }

    return state;
}

// selectors
export const getFullName = (state) => {
    const user = state.user
    if (user.isLoggedIn){
        return `${user.firstName ? user.firstName : ""} ${user.lastName ? user.lastName : ""}`.trim()
    }
}

// Queries
const getUserQuery = (userId) => {
    let query = new Parse.Query("_User")
    query.include("account")
    query.include("accountSeat")
    return query.get(userId)
}

// Actions
export const loadUserDetails = (userId) => (dispatch, getState) => {
    getUserQuery(userId).then(user => {
        dispatch({
            type: UPDATE_USER_INFO,
            payload: user.toJSON()
        })
    }).catch(error => {
        console.error(error)
    })
}

export const logInAlias = ({email, password}) => {
    return {
        type: LOG_IN_ALIAS,
        email,
        password
    }
}

export const logIn = ({email, password}) => (dispatch, getState) => {
    const state = getState()
    if (state.isLoggedIn && Parse.User.current()) {
        console.log("user already logged in, exiting")
        return null
    }
    dispatch({
        type: LOG_IN_REQUEST
    })
    Parse.User.logIn(email.toLowerCase(), password)
        .then(user => {
            dispatch({
                type: LOG_IN_SUCCESS,
                userId: user.id,
                payload: user.toJSON()
            })
            dispatch(loadUserDetails(user.id))
        })
        .catch(error => {
            console.error(error)
        })
}

export const logOut = () => (dispatch, getState) => {
    console.log("Logging out")
    if (!Parse.User.current()){
        dispatch({type: LOG_OUT_SUCCESS})
        return null
    }
    Parse.User.logOut().then(() => {
        dispatch({type: LOG_OUT_SUCCESS})
    })
}

export const logInGoogle = () => (dispatch, getState) => {
    handleSignInClick().then(({email}) => {
        console.log("Signed In Click finished...", email)
        dispatch({type: GOOGLE_LOG_IN_SUCCESS, payload: {email}})
    })
}

export const logOutGoogle = () => (dispatch, getState) => {
    handleSignOutClick().then(() => {
        dispatch({type: GOOGLE_LOG_OUT_SUCCESS})
    })
}

export const aliases = {
    [LOG_IN_ALIAS]: logIn,
    [LOG_OUT_ALIAS]: logOut,
    [LOG_IN_GOOGLE_ALIAS]: logInGoogle,
    [LOG_OUT_GOOGLE_ALIAS]: logOutGoogle,
}
