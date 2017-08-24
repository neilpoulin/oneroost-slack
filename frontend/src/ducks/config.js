import Immutable from 'immutable'

const initialState = Immutable.Map({
    slackClientId: '225772115667.227177070210',
})

export default function reducer(state=initialState, action){
    switch(action.type){
        default:
            break
    }

    return state;
}
