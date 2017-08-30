import {fromJS} from "immutable"
import axios from "axios"

import {
    CREATE_FILTER_ALIAS,
    GET_FILTERS_ALIAS,
    GET_FILTERS_SUCCESS,
    GET_FILTERS_ERROR,
    GET_FILTERS_REQUEST,
    CREATE_FILTER_SUCCESS,
    CREATE_FILTER_ERROR,
} from "actions/gmail"

const initialState = {
    filters: [],
    error: null,
}

export default function reducer(state=initialState, action){
    state = fromJS(state)
    switch (action.type) {
        case GET_FILTERS_REQUEST:
            break;
        case GET_FILTERS_ERROR:
            break;
        case GET_FILTERS_SUCCESS:
            state = state.set("filters", action.payload)
            break;
        case CREATE_FILTER_SUCCESS:
            state = state.set("filters", state.get("filters").push(action.payload))
            state = state.set("error", null)
            break;
        case CREATE_FILTER_ERROR:
            state = state.set("error", action.error)
            break;
        default:
            break;
    }
    return state.toJS()
}

export const aliases = {
    [GET_FILTERS_ALIAS]: getGmailFilters,
    [CREATE_FILTER_ALIAS]: createFilter,
}

export function getGmailFilters(){
    return (dispatch, getState) => {
        axios.get("https://www.googleapis.com/gmail/v1/users/me/settings/filters")
            .then(({data}) => {
                console.log("filters!", data)
                dispatch({
                    type: GET_FILTERS_SUCCESS,
                    payload: data.filter
                })
            }).catch(error => {
                console.error(error)
                dispatch({
                    type: GET_FILTERS_ERROR,
                    error,
                })
            })
    }
}

/*
{
"id": string,
"criteria": {
"from": string,
"to": string,
"subject": string,
"query": string,
"negatedQuery": string,
"hasAttachment": boolean,
"excludeChats": boolean,
"size": integer,
"sizeComparison": string
},
"action": {
"addLabelIds": [
string
],
"removeLabelIds": [
string
],
"forward": string
}
}
*/
// https://developers.google.com/gmail/api/v1/reference/users/settings/filters#resource
export function createFilter({senderName, senderEmail, vanityUrl, ...action}){
    return (dispatch, getState) => {
        if (!senderEmail){
            return null;
        }
        const labelName = `OneRoost | ${vanityUrl}`
        axios.post("https://www.googleapis.com/gmail/v1/users/me/labels", {
            name: labelName
        })
            .then(({data}) => {
                console.log("created label!", data);
                return data;
            })
            .catch(error => {
                console.warn("failed to create label...trying to find it", error)
                return axios.get("https://www.googleapis.com/gmail/v1/users/me/labels")
                    .then(({data}) => {
                        let foundLabel = data.labels.find(label => label.name === labelName)
                        if (foundLabel){
                            return foundLabel
                        }
                        throw new Error("Failed to create or find a label with name: " + labelName)
                    })
            })
            .then(label => {
                return axios.post("https://www.googleapis.com/gmail/v1/users/me/settings/filters", {
                    criteria: {
                        from: senderEmail
                    },
                    action: {
                        addLabelIds: [label.id],
                        removeLabelIds: ["INBOX"]
                    }
                })
            })
            .then(filter => {
                dispatch({
                    type: CREATE_FILTER_SUCCESS,
                    payload: filter
                })
            })
            .catch(error => {
                console.error(error)
                dispatch({
                    type: CREATE_FILTER_ERROR,
                    error
                })
            })
    }
}
