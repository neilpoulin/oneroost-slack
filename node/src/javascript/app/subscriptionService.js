import StripeClient from 'stripe'
import {
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET
} from 'util/Environment'
import {Parse} from 'parse/node'

const Stripe = StripeClient(STRIPE_SECRET_KEY)

export function handleRequest({user, planId, token, couponCode}) {
    console.log('handling subscription request', planId, token)
    return new Promise(async (resolve, reject) => {
        try {
            await user.fetch()
            let customerId = user.get('stripeCustomerId')
            let updates = {}
            if (!customerId) {
                customerId = await createCustomer(user)
                console.log('successfully created new Stripe customer', customerId)
                updates.stripeCustomerId = customerId
            }
            //now we for sure have a customer
            let userPlanId = user.get('stripePlanId')
            let userSubscriptionId = user.get('subscriptionId')
            let hasActiveSubscription = false

            if (userSubscriptionId) {
                let currentSubscription = await getSubscriptionById(userSubscriptionId)
                if (currentSubscription) {
                    hasActiveSubscription = userPlanId === planId && currentSubscription.status === 'active'
                    console.log('User already has active subscription, not updating')
                    resolve({message: 'not updating users subscription - already active'})
                }
            }

            if (!hasActiveSubscription) {
                let plan = await getPlanById(planId)
                let subscription = await addUserToPlan(customerId, plan, token.id, couponCode)
                console.log('subscription created', subscription)
                updates.stripePlanId = planId
                updates.stripeSubscriptionId = subscription.id
            }

            if (updates) {
                user.set(updates)
                console.log('updating user with ', updates)
                await user.save(null, {useMasterKey: true})
                console.log('successfully saved user')
            }
            resolve({message: 'payment successful'})
        } catch (e) {
            console.error(e)
            reject(e)
        }
    })
}

function createCustomer(user) {
    let customerId = user.get('stripeCustomerId')
    if (customerId) {
        return customerId
    }
    let email = user.get('username');

    // note: may want to create this after we've collected payment info, then attach the "source"
    return Stripe.customers.create({
        email,
    }).then(customer => {
        console.log('Customer created from stripe', customer)
        return customer.id
    }).catch(e => {
        console.error('failed to create customer', e)
    })
}

async function addUserToPlan(customerId, plan, tokenId, couponCode) {
    console.log('adding user to plan')

    let request = {
        customer: customerId,
        source: tokenId,
        items: [
            {
                plan: plan.id
            },
        ],
    }

    if (plan.trial_period_days) {
        request.trial_period_days = plan.trial_period_days
    }

    if (couponCode && couponCode.trim().length > 0) {
        request.coupon = couponCode;
    }

    return await Stripe.subscriptions.create(request)
}

export async function getCurrentExtensionPlanId() {
    return Parse.Config.get().then(config => {
        let planId = config.get('extensionPlanId')
        console.log('found extension plan id', planId)
        return planId
    })
}

export async function getExtensionPlan() {
    const planId = await getCurrentExtensionPlanId()
    return getPlanById(planId)
}

export async function getPlanById(planId) {
    return Stripe.plans.retrieve(planId).then(plan => {
        console.log('found plan', plan)
        return plan
    }).catch(error => {
        console.error('failed to get plan', error)
    });
}

export async function getSubscriptionById(subscriptionId) {
    try {
        return await Stripe.subscriptions.retrieve(subscriptionId)
    } catch (e) {
        console.log('failed to get subscription for subscriptionId = ' + subscriptionId, e)
        return null
    }
}

export async function getCouponByCode(couponCode) {
    try {
        return await Stripe.coupons.retrieve(couponCode)
    } catch (e) {
        console.error('failed to get coupon code for code = ' + couponCode, e)
        return null
    }
}

export async function cancelSubscription(subscriptionId) {
    try {
        return await Stripe.subscriptions.del(subscriptionId)
    } catch (e) {
        console.error('failed to cancel subscriptionId = ' + subscriptionId, e)
        return null
    }
}

export async function getUpcomingInvoice(customerId) {
    try {
        return await Stripe.invoices.retrieveUpcoming(customerId)
    } catch (e) {
        console.error('unable to fetch invoices for customerId = ' + customerId, e)
        return null
    }
}

export async function getSignedWebhookEvent(sig, body){
    try{

        console.log('signature', sig)
        // console.log('body', req.rawBody)
        // console.log('webhook secret', STRIPE_WEBHOOK_SECRET)
        let event = await Stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
        return event;
    } catch (e){
        console.log('failed to process webhook event', e)
    }

}