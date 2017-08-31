import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import Clickable from './Clickable';

describe('<Clickable/>', () => {
    test('renders with the provided text and default classes', () => {
        const button = shallow(<Clickable look="button" text="Test Text"/>)
        expect(button.text()).toEqual('Test Text')
        expect(button.hasClass('btn'))
        expect(button.hasClass('btn-primary'))
        expect(!button.hasClass('link'))
        expect(!button.hasClass('btn-outline-primary'))
    })

    test('render with link look', () => {
        const button = shallow(<Clickable look="link" text="Test Text"/>)
        expect(button.text()).toEqual('Test Text')
        expect(!button.hasClass('btn'))
        expect(!button.hasClass('btn-primary'))
        expect(button.hasClass('link'))
        expect(button.hasClass('link-primary'))
    })

    test('outline button secondary', () => {
        const button = shallow(<Clickable outline={true} styleType="secondary" text="Test Text"/>)
        expect(button.hasClass('btn-outline-secondary'))
        expect(button.hasClass('btn'))
        expect(button.find('span')).toHaveLength(1)
        expect(button.find('a')).toHaveLength(0)
    })

    test('href prop gets an anchor tag and href', () => {
        const button = shallow(<Clickable look="link" text="Test Text" href='/test'/>)
        expect(button.find('a')).toHaveLength(1)
        expect(button.find('span')).toHaveLength(0)
        expect(button.props().href).toEqual('/test')
    })

})
