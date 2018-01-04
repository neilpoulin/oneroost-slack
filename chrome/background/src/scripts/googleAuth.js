import axios from 'axios'
// helpful link https://developer.chrome.com/apps/app_identity
// https://developer.chrome.com/extensions/tut_oauth#oauth-dance
import Raven from 'raven-js'
const verifyTokenUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo'
const userProfileUrl = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
const manifest = chrome.runtime.getManifest()
const clientId = manifest.oauth2.client_id
const requiredScopes = manifest.oauth2.scopes;
var access_token = null;
var id_token = null;

window.getLastToken = function() {
    console.log('removing last access token: ', access_token)
    return access_token;
}

export function loadUserFromCache() {
    console.warn('load user form cache not implemented')
    return Promise.reject(null)
    // return oauth2(false)
}

export function handleSignInClick(event) {
    console.log('signin click fired')
    return oauth2(true);
}

function oauth2(interactive=true, isRetry=false){
    return new Promise((resolve, reject) => {
        try{
            chrome.identity.getAuthToken({
                interactive,
            }, function(token){
                console.log('got token', token)
                access_token = token
                console.log('Chrome login complete.. token =', access_token);
                getTokenInfo(access_token).then(({isValid, ...rest}) => {
                    if(isValid && rest.sub){
                        console.log('Token was found to be valid!!', rest)
                    }
                    else{
                        console.log('Token was not valid, or did not have a subject!')
                        if (!isRetry){
                            console.log('attempting to remove the cached token, and try again')
                            return chrome.identity.removeCachedAuthToken(
                                { 'token': access_token },
                                () => oauth2(false, true)
                            )
                        } else {
                            console.log('not retrying as we already have')
                            reject()
                        }
                    }

                    id_token = rest.sub || id_token
                    return resolve({...rest,
                        id_token,
                        access_token,
                        id: id_token,
                        firstName: rest.given_name,
                        lastName: rest.family_name,
                    })
                })
            });
        }
        catch (e){
            reject()
        }
    })
}

export function handleSignOutClick({token}) {
    console.log('logging out with token ', token)
    return doLogout({token}).then(result => {
        console.log('finished chrome logout after handle click', result)
    })
}

export function doLogout({token}){
    access_token = token || access_token
    console.log('handling chrome logout for token', access_token)
    return new Promise((resolve, reject) => {
        chrome.identity.removeCachedAuthToken(
            { 'token': access_token },
            () => {
                console.log('token removed from cache');
                access_token=null
                // getTokenInfo(access_token).then(tokenInfo => {
                //     console.log(tokenInfo)
                //     access_token=null
                //     console.log('got token info as part of logout flow')
                //     resolve(tokenInfo)
                // }).catch(error => {
                //     console.error('chrome logout failed for some reason', error)
                //     access_token=null
                //     Raven.captureException(error)
                //     reject(error)
                // })
            }
        )
    })
}

export function getTokenInfo(token){
    console.log('attempting to validate token')
    return axios.get(`${verifyTokenUrl}?access_token=${token}`)
        .then(({data, status}) => {
            console.log('Validated token', data)
            let grantedScopes = data.scope;
            let hasAllScopes = true;
            requiredScopes.forEach(scope => {
                if (hasAllScopes && grantedScopes.indexOf(scope) === -1){
                    hasAllScopes = false;
                    console.error('user does not have all scopes!')
                    return Promise.reject();
                }
            })
            if (!hasAllScopes){
                console.log('user does not have all the required scopes... asking for more')

            }
            if(data.aud === clientId){
                console.log('attempting to fetch profile info')
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return axios.get(`${userProfileUrl}&access_token=${access_token}`).then(({data: userInfo}) => {
                    console.log('fetched user info', userInfo)
                    return {...data, ...userInfo, isValid: true};
                }).catch(error => {
                    console.error('failed to get user info', error)
                    return {...data, isValid: true};
                })
            }
            return false
        }).catch(function (error) {
            console.log(error);
            Raven.captureException(error)
            delete axios.defaults.headers.common['Authorization'];
            return false;
        });
}
