import StripeClient from 'stripe'
import {
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET
} from 'util/Environment'

import Vendor from 'models/Vendor'
import Inbound from 'models/Inbound'
import {Parse} from 'parse/node'

const Stripe = StripeClient(STRIPE_SECRET_KEY)

export function handleRequest({user, slackTeam, planId, token, couponCode}) {
    console.log('handling subscription request', planId, token)
    return new Promise(async (resolve, reject) => {
        try {
            await slackTeam.fetch()
            let customerId = slackTeam.get('stripeCustomerId')
            let updates = {}
            if (!customerId) {
                customerId = await createCustomer({user})
                console.log('successfully created new Stripe customer', customerId)
                updates.stripeCustomerId = customerId
            }
            //now we for sure have a customer
            let teamPlanId = slackTeam.get('stripePlanId')
            let teamSubscriptionId = slackTeam.get('subscriptionId')
            let hasActiveSubscription = false

            if (teamSubscriptionId) {
                let currentSubscription = await getSubscriptionById(teamSubscriptionId)
                if (currentSubscription) {
                    hasActiveSubscription = teamPlanId === planId && currentSubscription.status === 'active'
                    console.log('Team already has active subscription, not updating')
                    resolve({message: 'not updating users subscription - already active'})
                }
            }

            if (!hasActiveSubscription) {
                let plan = await getPlanById(planId)
                let subscription = await addCustomerToPlan(customerId, plan, token.id, couponCode)
                console.log('subscription created', subscription)
                updates.stripePlanId = planId
                updates.stripeSubscriptionId = subscription.id
            }

            if (updates) {
                slackTeam.set(updates)
                console.log('updating slack team with ', updates)
                await slackTeam.save(null, {useMasterKey: true})
                console.log('successfully updated slack team')
            }
            resolve({message: 'payment successful'})
        } catch (e) {
            console.error(e)
            reject(e)
        }
    })
}

export function handleVendorRequest({planId, token, couponCode, email, inboundId}) {
    console.log('handling subscription request', planId, token)
    return new Promise(async (resolve, reject) => {
        try {

            //TODO: fetch customer id from somewhere, so we can sync it up
            let customerId = await createCustomer({email})
            console.log('successfully created new Stripe customer', customerId)

            //now we for sure have a customer

            let plan = await getPlanById(planId)
            let subscription = await addCustomerToPlan(customerId, plan, token.id, couponCode)
            console.log('vendor subscription created', subscription)

            let vendor = new Vendor()
            vendor.set({
                email,
                inbound: inboundId ? Inbound.createWithoutData(inboundId) : null,
                stripeCustomerId: customerId,
                stripePlanId: planId,
                stripeSubscriptionId: subscription.id
            })
            let savedVendor = await vendor.save()
            console.info('saved vendor', vendor.toJSON())
            resolve({message: 'vendor payment submitted successfully', vendor: vendor.toJSON()})
        } catch (e) {
            console.error(e)
            reject(e)
        }
    })
}


function createCustomer({user, email}) {
    let metadata = {}
    let customerDescription = ''
    if (user){
        let slackTeam = user.get('slackTeam')
        let customerId = slackTeam.get('stripeCustomerId')
        if (customerId) {
            return customerId
        }
        email = user.get('username');
        let teamName = user.get('slackTeam').get('name')
        metadata = {
            ...metadata,
            slackTeam: teamName,
            userId: user ? user.id : null,
            slackTeamId: slackTeam ? slackTeam.id : null,
        }
        customerDescription = `Contact for ${teamName}`
        console.log('creating customer for slackTeam', teamName)
    } else {
        metadata = {
            ...metadata,
            subscriptionType: 'PRODUCT'
        }
    }

    return Stripe.customers.create({
        email,
        description: customerDescription,
        metadata,
    }).then(customer => {
        console.log('Customer created from stripe', customer)
        return customer.id
    }).catch(e => {
        console.error('failed to create customer', e)
    })

}

async function addCustomerToPlan(customerId, plan, tokenId, couponCode) {
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
        return null
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