export function getInboundEmail(state){
    return state.inbound.getIn(['formInput', 'email'])
}