import React from 'react'
import PropTypes from 'prop-types'
// import Logo from 'Logo'
import {connect} from 'react-redux'
import {loadPage} from 'ducks/homePage'
import Clickable from 'atoms/Clickable'
import Logo from 'atoms/Logo'
// import TermsOfServiceLink from 'TermsOfServiceLink'
// import RoostNav, {TRANSPARENT_STYLE, LIGHT_FONT_STYLE, DARK_FONT_HOVER_STYLE} from 'RoostNav'

class HomePage extends React.Component{
    componentDidMount(){
        document.title = 'OneRoost'
        this.props.loadPage()
    }

    render () {
        const {
            heroTitle,
            heroSubTitle,
            ctaSubText,
            ctaButtonText,
            paragraphs,
            hasMore,
            isLoading,
            extensionUrl,
            //actions
        } = this.props

        const $footer = <div className="container">
            &copy; 2017 OneRoost
        </div>

        if (isLoading){
            return null
        }
        console.log(test)
        let test = 'la'
        var page =
        <div className={'main'} >
            <section className="background-primary textured">
                <div className="container">
                    <div className="logoContainer">
                        <Logo size='heading'/>
                    </div>

                    <div className="heroContainer" display-if={heroTitle}>
                        <h1>{heroTitle}</h1>
                        <p className="tagline" display-if={heroSubTitle}>{heroSubTitle}</p>
                    </div>
                    <div className="emailContainer form-group" display-if={ctaButtonText}>
                        <Clickable text={'Get the Chrome Extenstion'} colorType={'secondary'} inline={true} href={extensionUrl} target="_blank"/>
                    </div>
                    <div display-if={ctaSubText} className={'actionSubTextContainer'}>
                        {ctaSubText}
                    </div>
                </div>
                <div className="hasMoreContainer" display-if={hasMore && false}>
                    <div className="hasMore">
                        <i className="fa fa-arrow-down fa-3x"></i>
                    </div>
                </div>
                <footer display-if={!hasMore} className="">
                    {$footer}
                </footer>
            </section>
            <section className="textInfo background-light" display-if={paragraphs && paragraphs.length > 0}>
                {paragraphs.map(({title, content}, i) =>
                <div className="info" key={`content_${i}`}>
                    <h3 className="title">{title}</h3>
                    <p className="content">
                        {content}
                    </p>
                </div>
                )}
            </section>
            <footer className="" display-if={hasMore}>
                {$footer}
            </footer>
        </div>
        return page;
    }
}

const mapStateToProps = (state, ownProps) => {
    const homePage = state.homePage.toJS()
    let {
        heroTitle,
        heroSubTitle,
        ctaSubText,
        ctaButtonText,
        paragraphs,
        isLoading,
        extensionUrl
    } = homePage

    const hasMore = paragraphs && paragraphs.length > 0
    return {
        heroTitle,
        heroSubTitle,
        ctaSubText,
        ctaButtonText,
        paragraphs,
        isLoading,
        hasMore,
        extensionUrl,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadPage: () => {
            dispatch(loadPage())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)
