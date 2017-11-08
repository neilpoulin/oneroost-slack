import {WAITLIST_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class Waitlist extends Parse.Object {
        constructor(args) {
            super(WAITLIST_CLASSNAME)
            if (args) {
                this.set(args);
            }
        }
    }

    Parse.Object.registerSubclass(WAITLIST_CLASSNAME, Waitlist)
    return Waitlist
}

export default create
