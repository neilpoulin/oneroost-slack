import {getDomainFromEmail} from 'util/emailUtil'

export function getVendorByEmail(state, email) {
    let domain = getDomainFromEmail(email)

    return domain ? state.vendors[domain] : null
}