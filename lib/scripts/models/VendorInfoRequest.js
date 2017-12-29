import {VENDOR_INFO_REQUEST} from './ModelConstants'

export const create = (Parse) => {
    class VendorInfoRequest extends Parse.Object {
        constructor(args) {
            super(VENDOR_INFO_REQUEST)
            if (args) {
                this.set(args);
            }
        }
    }

    Parse.Object.registerSubclass(VENDOR_INFO_REQUEST, VendorInfoRequest)
    return VendorInfoRequest
}

export default create
