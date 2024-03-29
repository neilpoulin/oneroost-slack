import {INBOUND_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class Inbound extends Parse.Object {
        constructor(args) {
            super(INBOUND_CLASSNAME)
            if (args) {
                this.set(args);
            }
        }

    }

    Parse.Object.registerSubclass(INBOUND_CLASSNAME, Inbound)
    return Inbound
}

export default create
