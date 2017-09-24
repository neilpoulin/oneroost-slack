import React from 'react'
import BasePage from './BasePage'
class PrivacyPage extends React.Component {
    render () {
        return <BasePage>
            <div>
                <h1>Privacy</h1>
                <div>
                    View our privacy policy <a target='_blank' href='https://docs.google.com/document/d/11UO7TeoxVmxOVHogNf-WAhASsPy0s-zRuIzwgCrI6Wo'>here</a>
                </div>
            </div>
        </BasePage>
    }
}

export default PrivacyPage;
