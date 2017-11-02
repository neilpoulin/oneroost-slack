import ReactGA from 'react-ga'
import Raven from 'raven-js'

export function initialize(config, currentUser){
    const {INTERCOM_APP_ID, GA_TRACKING_ID, ENV} = config;
    initializeGA(GA_TRACKING_ID, currentUser)
    initializeIntercom(INTERCOM_APP_ID)
    initializeSentry(ENV)
}

function initializeSentry(ENV){
    Raven.config('https://50020b1e8db94c39be96db010cdbba4f@sentry.io/128546', {
        environment: ENV
    }).install()
}

function initializeIntercom(INTERCOM_APP_ID){
    if (window.Intercom){
        window.Intercom('boot', {
            app_id: INTERCOM_APP_ID
        });
    } else {
        window.Intercom = {}
    }
}

function initializeGA(GA_TRACKING_ID, currentUser){
    let options = {}

    if (currentUser){
        options.userId = currentUser.id
    }

    ReactGA.initialize(GA_TRACKING_ID, options);
}

export function logPageView({path}){
    ReactGA.set({ page: path });
    ReactGA.pageview(path);
    if (window.Intercom){
        window.Intercom("update");
    }
}