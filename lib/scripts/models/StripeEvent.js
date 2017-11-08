import {STRIPE_EVENT_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class StripeEvent extends Parse.Object {
        constructor(args) {
            super(STRIPE_EVENT_CLASSNAME)
            if (args) {
                this.set(args);
            }
        }
    }

    Parse.Object.registerSubclass(STRIPE_EVENT_CLASSNAME, StripeEvent)
    return StripeEvent
}

export default create
