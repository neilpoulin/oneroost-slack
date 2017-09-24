import React from 'react'
import BasePage from './BasePage'
class SupportPage extends React.Component {
    render () {
        return <BasePage>
            <div>
                <h1>Support</h1>
                <div>
                    need help? contact us at <a href='mailto:info@oneroost.com'>info@oneroost.com</a>
                </div>
            </div>
        </BasePage>
    }
}

export default SupportPage;
