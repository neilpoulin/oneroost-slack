import {ParseServer} from "parse-server"
import ParseDashboard from "parse-dashboard"
// import SESParseAdapter from "./email/SESParseAdapter.js"
// import {S3Adapter} from "parse-server"
import path from 'path'
import {
    ENV,
    PORT,
    HOSTNAME,
    PARSE_MASTER_KEY,
    PARSE_APP_ID,
    PARSE_MOUNT,
    PARSE_PUBLIC_URL,
    PARSE_LOCAL_URL,
    DATABASE_URL,
    LINKEDIN_CLIENT_ID,
    GOOGLE_CLIENT_ID,
} from './../Environment'


export function getParseDashboard(){
    return new ParseDashboard(getDashboardConfig());
}

function getDashboardConfig(){
    let config = {
        apps: [
            {
                "serverURL": PARSE_PUBLIC_URL,
                "appId": PARSE_APP_ID,
                "masterKey": PARSE_MASTER_KEY,
                "appName": ENV
            }
        ],
        users: [
            {
                "user":"neil",
                "pass":"OneRoost88"
            },
            {
                "user":"taylor",
                "pass":"PlatformT2016"
            }
        ]
    }
    return config
}

export function getLiveQueryServer(httpServer){
    ParseServer.createLiveQueryServer(httpServer, {
        appId: envUtil.getParseAppId(),
        masterKey: envUtil.getParseMasterKey(),
        serverURL: envUtil.getParseServerUrl(),
    });
}

export function getParseServer(){
    return new ParseServer({
        databaseURI: DATABASE_URL,
        cloud: path.join(__dirname, '..', 'app.js'),
        appId: PARSE_APP_ID,
        // fileKey: "myFileKey",
        masterKey: PARSE_MASTER_KEY,
        liveQuery: {
            // classNames: ["DealComment", "Deal", "Stakeholder", "NextStep"]
        },
        serverURL: PARSE_LOCAL_URL,
        publicServerURL: PARSE_PUBLIC_URL,
        appName: "OneRoost",
        // emailAdapter: SESParseAdapter({}),
        // customPages: {
        //     verifyEmailSuccess: envUtil.getEmailVerifiedPageUrl()
        // },
        // filesAdapter: new S3Adapter(
        //     envUtil.getAwsId(),
        //     envUtil.getAwsSecretId(),
        //     "parse-direct-access",
        //     {directAccess: true}
        // ),
        // verifyUserEmails: true,
        // emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds, 2 hours
        // preventLoginWithUnverifiedEmail: false,
        auth: {
            google: {
                client_id: GOOGLE_CLIENT_ID
            },
            slack: {
                module: path.join(__dirname, 'auth', 'slack')
            },
            linkedin: {client_id: LINKEDIN_CLIENT_ID},
        }
    });
}
