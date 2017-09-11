export function isLoggedIn(state){
    return state.user.get('isLoggedIn', false)
}

export function isUserLoading(state){
    return state.user.get('isLoading', false)
}

export function hasUserLoaded(state){
    return state.user.get('hasLoaded', false)
}
