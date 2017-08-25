// SLACK
export const SLACK_OAUTH_TOKEN = process.env.SLACK_OAUTH_TOKEN || ''
export const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || ''
export const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || ''
export const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN || ''

//DATABASE
export const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/oneroost-db";

//SERVER
export const PORT = process.env.SERVER_PORT || 8081;
export const HOSTNAME = process.env.HOSTNAME || "https://dev.oneroost.com"

//PARSE
export const PARSE_MASTER_KEY = process.env.PARSE_MASTER_KEY || ''
export const PARSE_MOUNT = process.env.PARSE_MOUNT || '/parse'
export const PARSE_APP_ID = process.env.PARSE_APP_ID || ''

//ENVIRONMENT
export const ENV_NAME = process.env.ENV_NAME || "dev" //such as prod-green or prod-blue
export const ENV = process.env.ENV || "dev"

//ANALYTICS
export const GA_TRACKING_ID = process.env.GA_TRACKING_ID || "UA-87950724-3"

//GOOGLE
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''

//LINKEDIN
export const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '78v10otstxnu8h'

//Helper Methods
export const isProd = () => {
    return ENV.toLowerCase() === 'prod'
}

export const isDev = () => {
    return ENV.toLowerCase() === 'dev'
}

export const isStage = () => {
    return ENV.toLowerCase() === 'stage'
}

export const PARSE_PUBLIC_URL = `${HOSTNAME}${PARSE_MOUNT}`
export const PARSE_LOCAL_URL = `http://localhost:"${PORT}${PARSE_MOUNT}`