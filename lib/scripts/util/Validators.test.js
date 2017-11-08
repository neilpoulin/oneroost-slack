import {isValidEmail} from './Validators';

describe('email validator', () => {
    test('neil@oneroost.com', () => {
        let email = 'neil@oneroost.com'
        expect(isValidEmail(email)).toBe(true)
    })

    test('neil@oneroost', () => {
        let email = 'neil@oneroost'
        expect(isValidEmail(email)).toBe(false)
    })
})