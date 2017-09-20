import {REDIRECT_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class Inbound extends Parse.Object {
        constructor(args) {
            super(REDIRECT_CLASSNAME)
            if (args) {
                this.set(args);
            }
        }
    }

    Parse.Object.registerSubclass(REDIRECT_CLASSNAME, Inbound)
    return Inbound
}

export default create
