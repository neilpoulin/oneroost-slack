import React from 'react'
import PropTypes from 'prop-types'

import Clickable from 'atoms/Clickable'
import Logo from 'atoms/Logo'

import JoinWaitlist from 'organisms/JoinWaitlist'
import EditorialImage from 'organisms/EditorialImage'
import FeatureGridItem from './FeatureGridItem';
import FeatureGrid from './FeatureGrid';
import ChromeExtensionButton from 'molecules/ChromeExtensionButton'

class MarketingLandingPage extends React.Component {
    static propTypes = {
        sections: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            description: PropTypes.string,
            showWaitlist: PropTypes.bool,
            showVendorLink: PropTypes.bool,
            vendorInboundUrl: PropTypes.string,
            testimonials: PropTypes.arrayOf(PropTypes.shape({
                quote: PropTypes.string.isRequired,
                imageUrl: PropTypes.string,
                name: PropTypes.string.isRequired,
                title: PropTypes.string,
                companyName: PropTypes.string.isRequired,
                companyUrl: PropTypes.string,
            })),
        })),
        testimonials: PropTypes.arrayOf(PropTypes.shape({
            quote: PropTypes.string.isRequired,
            imageUrl: PropTypes.string,
            name: PropTypes.string.isRequired,
            title: PropTypes.string,
            companyName: PropTypes.string.isRequired,
            companyUrl: PropTypes.string,
        })),
        showSignup: PropTypes.bool,
        showChromeExtensionButton: PropTypes.bool,
        featureGrid: PropTypes.shape({
            items: PropTypes.array,
            title: PropTypes.string,
        }),
        firstImagePosition: PropTypes.oneOf(['left', 'right']),
        //actions
        setNav: PropTypes.func,
    }

    render () {
        const {
            sections,
            testimonials,
            featureGrid,
            firstImagePosition,
            showSignup,
            showChromeExtensionButton,
        } = this.props

        var page =
                <div className={'main'} >
                    <div display-if={sections} className={'editorialImages'}>
                        {sections.map(({title,
                            showWaitlist,
                            description,
                            imageUrl,
                            testimonials,
                            showVendorLink,
                            vendorInboundUrl,
                            imageCaption}, i) =>
                            <EditorialImage key={`editorial_image_${i}`}
                                title={title}
                                showWaitlist={showWaitlist}
                                description={description}
                                imageUrl={imageUrl}
                                testimonials={testimonials}
                                vendorInboundUrl={vendorInboundUrl}
                                showVendorLink={showVendorLink}
                                showChromeExtensionButton={showChromeExtensionButton}
                                firstImagePosition={firstImagePosition}
                                imageCaption={imageCaption}
                            />
                        )}
                    </div>
                    <div className={'testimonials'} display-if={testimonials}>
                        {testimonials.map(({quote, imageUrl, name, title, companyName, companyUrl}, i) =>
                            <div key={`testimonial_${i}`} className={'testimonial'}>
                                <div className={'avatar'}>
                                    <img src={imageUrl}/>
                                </div>
                                <div className={'text'}>
                                    <q className='quote'>{quote}</q>
                                    <p className='user'>
                                        {name} <span className="title" display-if={title}> - {title}</span>
                                    </p>
                                    <p className='company'>
                                        <Clickable display-if={companyUrl}
                                            look={'link'}
                                            colorType={'white'}
                                            text={companyName}
                                            href={companyUrl}
                                            target={'_blank'}
                                        />
                                        <span display-if={!companyUrl}>{companyName}</span>
                                    </p>
                                </div>

                            </div>
                        )}
                    </div>
                    <div display-if={featureGrid && featureGrid.items}>
                        <FeatureGrid items={featureGrid.items} title={featureGrid.title}/>
                    </div>

                    <footer className="">
                        <Logo/>
                        <div className="links">
                            <Clickable look='link' text='Privacy' to='/privacy' colorType={'white'}/>
                            <Clickable to='/support' look='link' text='Support' colorType={'white'}/>
                            <Clickable to='/login' look='link' text='Log In' colorType={'white'}/>
                        </div>
                    </footer>
                </div>
        return page;
    }
}

export default MarketingLandingPage