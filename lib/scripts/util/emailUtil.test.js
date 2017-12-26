import {getDomainFromEmail} from './emailUtil'

describe('get domain from strings', () => {
    test('full email', () => {
        let email = 'neil@oneroost.com'
        expect(getDomainFromEmail(email)).toBe('oneroost.com')
    })

    test('only domain', () => {
        let email = 'oneroost.com'
        expect(getDomainFromEmail(email)).toBe('oneroost.com')
    })

    test('no TLD', () => {
        let email = 'neil@oneroost'
        expect(getDomainFromEmail(email)).toBe('oneroost')
    })
})