import axios from 'axios'
// helpful link https://developer.chrome.com/apps/app_identity
// https://developer.chrome.com/extensions/tut_oauth#oauth-dance

const verifyTokenUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo'
const manifest = chrome.runtime.getManifest()
const clientId = manifest.oauth2.client_id
const requiredScopes = manifest.oauth2.scopes;
var access_token = null;
var id_token = null;

window.getLastToken = function() {
    return access_token;
}

export function loadUserFromCache() {
    return oauth2(false)
}

export function handleSignInClick(event) {
    console.log('signin click fired')
    return oauth2(true);
}

function oauth2(interactive=true, isRetry=false){
    return new Promise((resolve, reject) => {
        try{
            chrome.identity.getAuthToken({
                interactive: true,
            }, function(token){
                console.log('got token', token)
                access_token = token
                console.log('Background login complete.. token =', access_token);
                getTokenInfo(access_token).then(({isValid, ...rest}) => {
                    if(isValid){
                        console.log('Token was found to be valid!!', rest)
                    }
                    else{
                        console.log('Token was not valid!')
                        if (!isRetry){
                            console.log('attempting to remove the cached token, and try again')
                            chrome.identity.removeCachedAuthToken(
                                { 'token': access_token },
                                () => oauth2(false, true)
                            )
                        } else {
                            console.log('not retrying as we already have')
                        }
                    }
                    resolve({...rest,
                        id_token,
                        access_token,
                        id: rest.sub,
                    })
                })
            });
        }
        catch (e){
            reject()
        }
    })
}

export function handleSignOutClick(event) {
    return doLogout()
}

export function doLogout(){
    console.log('handling chrome logout')
    return new Promise((resolve, reject) => {
        chrome.identity.removeCachedAuthToken(
            { 'token': access_token },
            () => {
                console.log('chrome logout complete');
                getTokenInfo(access_token).then(tokenInfo => {
                    console.log(tokenInfo)
                    access_token=null
                    resolve(tokenInfo)
                }).catch(error => {
                    console.log(error)
                    reject(error)
                })
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
                if (hasAllScopes && grantedScopes.indexOf(scope) == -1){
                    hasAllScopes = false;
                    return;
                }
            })
            if (!hasAllScopes){
                console.log('user does not have all the required scopes... asking for more')

            }
            if(data.aud === clientId){
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return {...data, isValid: true};
            }
            return false
        }).catch(function (error) {
            console.log(error);
            delete axios.defaults.headers.common['Authorization'];
            return false;
        });
}
