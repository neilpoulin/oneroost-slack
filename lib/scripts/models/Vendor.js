import {VENDOR_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class Vendor extends Parse.Object {
        constructor(args) {
            super(VENDOR_CLASSNAME)
            if (args) {
                this.set(args);
            }
        }
    }

    Parse.Object.registerSubclass(VENDOR_CLASSNAME, Vendor)
    return Vendor
}

export default create
