import axios from 'axios'
import {getUserInfo} from 'slack/slackService'
import {Parse} from 'parse/node'

export async function validateAuthData(authData, options) {
    console.log('authData', authData)
    let {user} = await getUserInfo(authData.access_token)
    if (!user){
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Slack user not found for provided access_token')
    }
    else if ( user.id !== authData.id){
        console.log('user', user)
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'The use ID found does not match the provided user id')
    }
    return
}

export function validateAppId(appIds, authData) {
    return Promise.resolve()
}
