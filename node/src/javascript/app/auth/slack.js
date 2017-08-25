import axios from 'axios'

export async function validateAuthData(authData, options) {


    const {data: {team, user, ok}} =  await axios.post('https://slack.com/api/users.identity', qs.stringify({
        token: accessToken,
        scope: 'identity.email,identity.avatar,identity.team'
    }))

    
}

export function validateAppId(appIds, authData) {}
