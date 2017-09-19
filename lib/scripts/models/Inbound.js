import {INBOUND_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class Inbound extends Parse.Object {
        constructor(args) {
            super(INBOUND_CLASSNAME)
            // this.set({
            //     channels: {},
            //     selectedChannels: [],
            // });
            if (args) {
                this.set(args);
            }
        }

        addVote(){
            
        }
    }

    Parse.Object.registerSubclass(INBOUND_CLASSNAME, Inbound)
    return Inbound
}

export default create
