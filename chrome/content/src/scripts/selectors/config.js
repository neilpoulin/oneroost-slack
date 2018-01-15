import {getDomainFromEmail} from 'util/emailUtil'

export function showRoostInfoForEmail(email, state){
    try{
        if (!email){
            return false
        }
        let domain = getDomainFromEmail(email)
        let userEmail = state.user ? state.user.email : null
        let userDomain = getDomainFromEmail(userEmail)

        let suppressedEmailDomains =  state.config.suppressedEmailDomains
        return suppressedEmailDomains.indexOf(domain) === -1 && userDomain !== domain
    } catch(e){
        console.error('failed to get the suppressed email domains', e)
        return true
    }

}