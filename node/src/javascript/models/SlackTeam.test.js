import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import SlackTeam from './SlackTeam'

describe('SlackTeam model', () => {
    test('set channels works', () => {
        let team = new SlackTeam()
        expect(team.get('channels')).toEqual({})
        team.setChannels([{id: '1', name: 'test'}])
        expect(team.get('channels')).toMatchObject({'1': {id: '1', name: 'test'}})

        team.addChannel({id: '2', name: 'test2'})
            .addChannel({id: '3', name: 'test3'})

        expect(team.get('channels')).toMatchObject({
            '1': {id: '1', name: 'test'},
            '2': {id: '2', name: 'test2'},
            '3': {id: '3', name: 'test3'}
        })
    })
})
