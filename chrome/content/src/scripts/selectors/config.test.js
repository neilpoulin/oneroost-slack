import {showRoostInfoForEmail} from './config';

describe('show sidebar panel or not based on email', () => {
    test('using gmail (suppressed)', () => {
        let email = 'neil@gmail.com'
        let suppressedDomains = ['gmail.com', 'hotmail.com', 'aol.com']
        let state = {config: {suppressedEmailDomains: suppressedDomains}}
        let doShow = showRoostInfoForEmail(email, state)
        expect(doShow).toEqual(false)
    })

    test('using neilpoulin.com (not suppressed)', () => {
        let email = 'neil@neilpoulin.com'
        let suppressedDomains = ['gmail.com', 'hotmail.com', 'aol.com']
        let state = {config: {suppressedEmailDomains: suppressedDomains}}
        let doShow = showRoostInfoForEmail(email, state)
        expect(doShow).toEqual(true)
    })

    test('misconfigured state, returns true', () => {
        let email = 'neil@neilpoulin.com'
        let state = {}
        let doShow = showRoostInfoForEmail(email, state)
        expect(doShow).toEqual(true)
    })

    test('no email passed in, returns false', () => {
        let email = null
        let suppressedDomains = ['gmail.com', 'hotmail.com', 'aol.com']
        let state = {config: {suppressedEmailDomains: suppressedDomains}}
        let doShow = showRoostInfoForEmail(email, state)
        expect(doShow).toEqual(false)
    })

    test('not suppressed domain, but is same as user\'s', () => {
        let email = 'bob@neilpoulin.com'
        let suppressedDomains = ['gmail.com', 'hotmail.com', 'aol.com']
        let state = {
            config: {suppressedEmailDomains: suppressedDomains},
            user: {email: 'neil@neilpoulin.com'}
        }
        let doShow = showRoostInfoForEmail(email, state)
        expect(doShow).toEqual(false)
    })
})