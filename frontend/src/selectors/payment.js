import {STATUS_NONE, ACTIVE_STATUSES } from 'ducks/payment'

export function getSubscriptionStatus(state){
    const {payment} = state
    let subscription = payment.get('subscription')
    if (!subscription){
        return STATUS_NONE
    }
    return subscription.get('status', STATUS_NONE)
}

export function hasActiveSubscription(state){
    return ACTIVE_STATUSES.includes(getSubscriptionStatus(state))
}