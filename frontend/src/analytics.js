import ReactGA from 'react-ga'

export function initialize(config, currentUser){
    const {INTERCOM_APP_ID, GA_TRACKING_ID} = config;
    initializeGA(GA_TRACKING_ID, currentUser)
    initializeIntercom(INTERCOM_APP_ID)
}

function initializeIntercom(INTERCOM_APP_ID){
    if (window.Intercom){
        window.Intercom('boot', {
            app_id: INTERCOM_APP_ID
        });
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