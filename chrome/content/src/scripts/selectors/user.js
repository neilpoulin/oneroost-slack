
export const getFullName = (state) => {
    const user = state.user
    if (user.isLoggedIn){
        return `${user.firstName ? user.firstName : ""} ${user.lastName ? user.lastName : ""}`.trim()
    }
}
