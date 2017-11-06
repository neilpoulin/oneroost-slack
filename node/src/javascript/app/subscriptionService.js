import StripeClient from 'stripe'
import {
    STRIPE_SECRET_KEY
} from 'util/Environment'
import {Parse} from 'parse/node'
const Stripe = StripeClient(STRIPE_SECRET_KEY)

export function handleRequest({user, planId, token}){
    console.log('handling subscription request', planId, token)
    return new Promise(async (resolve, reject) => {
        try{
            await user.fetch()
            let customerId = user.get('stripeCustomerId')
            let updates = {}
            if (!customerId){
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
                if ( currentSubscription){
                    hasActiveSubscription = userPlanId === planId && currentSubscription.status === 'active'
                    console.log('User already has active subscription, not updating')
                    resolve({message: 'not updating users subscription - already active'})
                }
            }

            if (!hasActiveSubscription)
            {
                let subscription = await addUserToPlan(customerId, planId, token.id)
                console.log('subscription created', subscription)
                updates.stripePlanId = planId
                updates.stripeSubscriptionId = subscription.id
            }

            if (updates){
                user.set(updates)
                console.log('updating user with ', updates)
                await user.save(null, {useMasterKey: true})
                console.log('successfully saved user')
            }
            resolve({message: 'payment successful'})
        } catch(e){
            console.error(e)
            reject(e)
        }
    })
}

function createCustomer(user){
    let customerId = user.get('stripeCustomerId')
    if (customerId){
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

async function addUserToPlan(customerId, planId, tokenId){
    console.log('adding user to plan')
    return await Stripe.subscriptions.create({
        customer: customerId,
        source: tokenId,
        items: [
            {
                plan: planId
            },
        ],
    })
}

export async function getCurrentExtensionPlanId(){
    return Parse.Config.get().then(config => {
        let planId = config.get('extensionPlanId')
        console.log('found extension plan id', planId)
        return planId
    })
}

export async function getExtensionPlan(){
    const planId = await getCurrentExtensionPlanId()
    return Stripe.plans.retrieve(planId).then(plan => {
        console.log('found plan', plan)
        return plan
    }).catch(error => {
        console.error('failed to get plan', error)
    });
}

export async function getSubscriptionById(subscriptionId){
    return await Stripe.subscriptions.retrieve(subscriptionId)
}