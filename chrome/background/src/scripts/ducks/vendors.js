import Immutable from 'immutable'
import vendorReducer, {initialState} from './vendor'

export default function reducer(state=Immutable.Map({}), action){
    const vendorEmail = action.vendorEmail
    if (vendorEmail){
        let currentVendorState = state.get(vendorEmail, initialState)
        let vendorState = vendorReducer(currentVendorState, action)
        state = state.set(vendorEmail, vendorState)
    }

    return state
}
