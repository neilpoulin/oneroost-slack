export function getFullName(user){
    if (!user){
        return ''
    }

    let lastName = user.get('lastName') || ''
    let firstName = user.get('firstName') || ''

    return `${firstName} ${lastName}`.trim()
}

export function getCompanyName(user){
    if (!user){
        return ''
    }

    let slackTeam = user.get('slackTeam')
    if (!slackTeam){
        return user.get('username').split('@')[1]
    }

    return slackTeam.get('name')

}