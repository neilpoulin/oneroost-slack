import {
    STATUS_NONE,
    STATUS_ACTIVE,
    STATUS_TRIALING,
    STATUS_PAST_DUE,
    STATUS_CANCELED,
    STATUS_UNPAID,
    ACTIVE_STATUSES
} from 'ducks/payment'

const statusDisplayNames = {
    [STATUS_ACTIVE]: 'Active',
    [STATUS_NONE]: 'Not Subscribed',
    [STATUS_TRIALING]: 'In Free Trial',
    [STATUS_PAST_DUE]: 'Past Due',
    [STATUS_CANCELED]: 'Canceled',
    [STATUS_UNPAID]: 'Unpaid',
}

export function getSubscriptionStatus(state) {
    const {payment} = state
    let subscription = payment.get('subscription')
    if (!subscription) {
        return STATUS_NONE
    }
    return subscription.get('status', STATUS_NONE)
}

export function hasActiveSubscription(state) {
    return ACTIVE_STATUSES.includes(getSubscriptionStatus(state))
}

export function getStatusDisplayName(status) {
    return statusDisplayNames[status]
}