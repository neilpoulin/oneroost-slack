import Parse from "parse"
import {fromJS} from "immutable"
import {handleSignInClick, handleSignOutClick, loadUserFromCache} from "googleAuth"
import * as UserActions from "actions/user"
import {LOAD_PAGES_ALIAS} from "actions/brandPages"

const initialState = {
    isLogin: false,
    userId: null,
    accountId: null,
    firstName: null,
    lastName: null,
    isLoading: false,
    role: null,
    email: null,
    error: null,
}

const getUserIdFromAction = (action) => {
    return action.userId || action.payload.userId || action.payload.objectId || action.payload.id || null
}

export default function reducer(state=initialState, action){
    state = fromJS(state).toJS()
    const payload = action.payload
    switch(action.type){
        case UserActions.LOG_IN_REQUEST:
            state.isLoading = true;
            break;
        case UserActions.LOG_IN_SUCCESS:
            state.userId = getUserIdFromAction(action);
            state.isLoading = false;
            state.accountId = action.payload.account.objectId;
            state.isLoggedIn = true;
            break;
        case UserActions.UPDATE_USER_INFO:
            state.firstName = payload.firstName;
            state.lastName = payload.lastName;
            state.email = payload.email;
            if (payload.account){
                state.accountId = payload.account.objectId;
                state.accountName = payload.account.accountName;
            }
            if (payload.accountSeat){
                state.role = payload.accountSeat.role
            }
            break;
        case UserActions.LOG_OUT_SUCCESS:
            state = initialState
            break;
        case UserActions.LOG_IN_ERROR:
            console.error(action)
            break;
        case UserActions.SET_PROVIDER_ERROR:
            break;
        default:
            break;
    }

    return state;
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
            type: UserActions.UPDATE_USER_INFO,
            payload: user.toJSON()
        })
        dispatch({
            type: LOAD_PAGES_ALIAS,
        })
    }).catch(error => {
        console.error(error)
    })
}

export const logIn = ({email, password}) => (dispatch, getState) => {
    const state = getState()
    if (state.isLoggedIn) {
        console.log("user already logged in, exiting")
        return null
    }
    dispatch({
        type: UserActions.LOG_IN_REQUEST
    })
    Parse.User.logIn(email.toLowerCase(), password)
        .then(user => {
            dispatch({
                type: UserActions.LOG_IN_SUCCESS,
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
        dispatch({type: UserActions.LOG_OUT_SUCCESS})
        return null
    }
    Parse.User.logOut().then(() => {
        dispatch({type: UserActions.LOG_OUT_SUCCESS})
    })
}

export const logInGoogle = () => (dispatch, getState) => {
    handleSignInClick().then(({email, id_token, access_token, id}) => {
        console.log("Signed In Click finished...", email)
        dispatch(linkUserWithProvider("google", {access_token, id}))
        dispatch({type: UserActions.GOOGLE_LOG_IN_SUCCESS, payload: {email}})
    })
}

export const logOutGoogle = () => (dispatch, getState) => {
    handleSignOutClick().then(() => {
        dispatch({type: UserActions.GOOGLE_LOG_OUT_SUCCESS})
    })
}

export const loadCachedUser = () => (dispatch, getState) => {
    let user = Parse.User.current()
    if (user){
        dispatch({
            type: UserActions.LOG_IN_SUCCESS,
            userId: user.id,
            payload: user.toJSON()
        })
        dispatch(loadUserDetails(user.id))
    }
    loadUserFromCache().then(({email, access_token, id}) => {
        console.log("Loaded google user from cache finished...", email)
        dispatch(linkUserWithProvider("google", {access_token, id}))
        // dispatch({type: UserActions.GOOGLE_LOG_IN_SUCCESS, payload: {email}})
    }).catch(console.error)
}

export function linkUserWithProvider(provider, authData){
    return (dispatch, getState) => {
        console.log("authData:", authData)
        if(!authData || !authData.access_token){
            console.log("no valid auth data present, exit")
            return null;
        }
        let user = Parse.User.current() || new Parse.User({});
        dispatch(linkUser(user, provider, authData))
    }
}

export function refreshUserData(){
    return (dispatch) => {
        let user = Parse.User.current();
        if (user){
            user.fetch().then(updatedUser => {
                dispatch({
                    type: UserActions.UPDATE_USER_INFO,
                    userId: user.id,
                    payload: updatedUser.toJSON()
                })
                dispatch({
                    type: LOAD_PAGES_ALIAS
                })
            })
        }
    }
}

function linkUser(user, provider, authData){
    return (dispatch) => {
        let options = {
            authData
        }

        return user._linkWith(provider, options).then(savedUser => {
            console.info("Linked with " + provider, savedUser)
            dispatch({
                type: UserActions.LOG_IN_SUCCESS,
                userId: user.id,
                payload: savedUser.toJSON()
            })
            Parse.Cloud.run("checkEmailAfterOAuth").then((response) => {
                dispatch(refreshUserData())
            }).catch(error => console.error)
            dispatch(refreshUserData())
        }).catch(error => {
            switch (error.code){
                case 202:
                case 206:
                    error.message = "If you already have an account, you must log in before you can connect via a thrid party."
                    dispatch(linkUserWithProviderError(provider, error))
                    break
                default:
                    console.error("Failed to link with" + provider, error)
                    dispatch(linkUserWithProviderError(provider, error))
                    break
            }
        })
    }
}

export function linkUserWithProviderError(providerName, error){
    return (dispatch, getState) => {
        console.error("Failed to link " + providerName, error)
        dispatch({
            type: UserActions.SET_PROVIDER_ERROR,
            error: {
                [providerName]: error
            }
        })
    }
}

export const aliases = {
    [UserActions.LOG_IN_ALIAS]: logIn,
    [UserActions.LOG_OUT_ALIAS]: logOut,
    [UserActions.LOG_IN_GOOGLE_ALIAS]: logInGoogle,
    [UserActions.LOG_OUT_GOOGLE_ALIAS]: logOutGoogle,
}
