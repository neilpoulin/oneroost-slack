import {STATUS_NONE } from 'ducks/payment'

export function getSubscriptionStatus(state){
    const {payment} = state
    let subscription = payment.get('subscription')
    if (!subscription){
        return STATUS_NONE
    }
    return subscription.get('status')
}