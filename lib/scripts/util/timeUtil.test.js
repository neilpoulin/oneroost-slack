import {formatDateShort} from './timeUtil'

const timestamp = 1514477648461 // 12/28/2017

describe('format date short', () => {
    test('new date, using timestamp', () => {
        expect(formatDateShort(timestamp)).toBe('12/28/2017')
    })
})