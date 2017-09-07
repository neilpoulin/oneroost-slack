import React from 'react'
import sinon from 'sinon'
import SlackTeam from './SlackTeam'

describe('SlackTeam', () => {
    beforeEach(() => {
        sinon.spy(console, 'warn')
        sinon.spy(console, 'error')
    });

    afterEach(() => {
        console.warn.restore()
        console.error.restore()
    });

    test('set channels works', () => {
        let team = new SlackTeam()
        // expect(team.get('channels')).toEqual({})
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

    test('select channel that doesnt exist', () => {
        let team = new SlackTeam()
        team.selectChannel('badchannelid')
        expect(console.warn.calledOnce).toBeTruthy()
        expect(team.get('channels')).toEqual({})

    })

    test('add channel and select it', () => {
        let team = new SlackTeam()
        team.addChannel({id: '1', name: 'test'}, true)
        expect(console.warn.notCalled).toBeTruthy()
        expect(team.get('selectedChannels')).toEqual(expect.arrayContaining(['1']))
    })

    test('creating a SlackTeam with teamId in the consturctor works', () => {
        let teamId = '123'
        let team = new SlackTeam({teamId})
        expect(team.get('teamId')).toEqual(teamId)
    })

    test('remove a selected item', () => {
        let team = new SlackTeam();
        team.addChannel({id: '1', name: 'test'}, true)
        team.addChannel({id: '2', name: 'test2'}, true)
        expect(team.get('selectedChannels')).toHaveLength(2)
        team.addChannel({id: '1', name: 'test'}, false)
        expect(team.get('selectedChannels')).toHaveLength(1)
    })

    // test('check valid states', () => {
    //     let team = new SlackTeam();
    //     // this setter will fail and the value will be unchanged
    //     team.set({
    //         channels: null
    //     })
    //     console.log('team JSON', team.toJSON())
    //     expect(team.isValid()).toEqual(true)
    //
    //     expect(team.validate('teamId': undefined)).toBeFalsy()
    //
    //     team.set('teamId', '123')
    //     expect(team.isValid()).toEqual(true)
    //
    //     expect(team.validate('teamId': undefined)).toBeInstanceOf(Parse.Error)
    //
    //     // team.set('teamId', 'test')
    //     // expect(team.isValid()).toBeFalsy()
    //     //
    //     // team.set('channels', {})
    //     // expect(team.isValid()).toBeTruthy()
    //
    //
    // })
})
