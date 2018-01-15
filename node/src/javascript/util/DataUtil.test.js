import {getFullName, getCompanyName} from './DataUtil';
import Parse from 'parse/node'
import SlackTeam from '../../../../lib/scripts/models/server/SlackTeam';

describe('get full name test', () => {
    test('null user', () => {
        let user = null
        let fullName = getFullName(user)
        expect(fullName).toBe('')
    })

    test('actual user - first and last name', () => {
        let user = new Parse.User({
            firstName: 'Neil',
            lastName: 'Poulin'
        })
        let fullName = getFullName(user)
        expect(fullName).toBe('Neil Poulin')
    })

    test('actual user - no last name', () => {
        let user = new Parse.User({
            firstName: 'Neil',
        })
        let fullName = getFullName(user)
        expect(fullName).toBe('Neil')
    })

    test('actual user - no first or last name', () => {
        let user = new Parse.User({
        })
        let fullName = getFullName(user)
        expect(fullName).toBe('')
    })
})

describe('get company name', () => {
    test('no user', () => {
        let user = null
        let slackTeam = null

        let companyName = getCompanyName(user)
        expect(companyName).toBe('')
    })

    test('no team, only username', () => {
        let slackTeam = null
        let email = 'neil@oneroost.com'
        let user = new Parse.User({
            slackTeam: slackTeam,
            username: email
        })

        let companyName = getCompanyName(user)
        expect(companyName).toBe('oneroost.com')
    })

    test('slack team present', () => {
        let slackTeam = new SlackTeam({
            name: 'OneRoost'
        })
        let email = 'neil@oneroost.com'
        let user = new Parse.User({
            slackTeam: slackTeam,
            username: email
        })

        let companyName = getCompanyName(user)
        expect(companyName).toBe('OneRoost')
    })
})