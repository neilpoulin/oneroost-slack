import React from 'react'
import PropTypes from 'prop-types'
import JoinWaitlist from 'organisms/JoinWaitlist'
import Clickable from 'atoms/Clickable';

class EditorialImage extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        showWaitlist: PropTypes.bool,
        showVendorLink: PropTypes.bool,
        vendorInboundUrl: PropTypes.string,
        description: PropTypes.string,
        imageUrl: PropTypes.string,
        imageCaption: PropTypes.string,
        testimonials: PropTypes.arrayOf(PropTypes.shape({
            quote: PropTypes.string,
            name: PropTypes.string,
            companyName: PropTypes.string,
            title: PropTypes.string,
            companyUrl: PropTypes.string,
        })),
        firstImagePosition: PropTypes.oneOf(['left', 'right'])
    }

    static defaultProps = {
        firstImagePosition: 'right',
    }

    render(){
        const {
            title,
            showWaitlist,
            description,
            imageUrl,
            testimonials,
            showVendorLink,
            vendorInboundUrl,
            firstImagePosition,
            imageCaption,
        } = this.props
        return <section className={`start-${firstImagePosition}`}>
            <div display-if={imageUrl} className={'image'}>
                <img src={`${imageUrl}`}/>
                <div className={'caption'} display-if={imageCaption}>
                    {imageCaption}
                </div>
            </div>
            <div className="copy">
                <h2>{title}</h2>
                <p>{description}</p>
                <JoinWaitlist display-if={showWaitlist}
                    buttonText='Join the Beta'
                    inline={true}
                />
                <div display-if={testimonials} className={'testimonials'}>
                    {testimonials.map(({quote, name, companyName, companyUrl, title, imageUrl}, i) => (
                        <div key={`inline_testimonial_${i}`} className={'testimonial'}>
                            <div className='text'>
                                <q className={'quote'}>{quote}</q>
                                <div className={'caption'}>
                                    <div className={'user'}>
                                        <div>{name}, {title}</div>
                                        <div className='company' display-if={companyName}>
                                            <Clickable display-if={companyUrl}
                                                look={'link'}
                                                colorType={'secondary'}
                                                text={companyName}
                                                href={companyUrl}
                                                target={'_blank'}
                                            />
                                            <span display-if={!companyUrl}>{companyName}</span>
                                        </div>
                                    </div>

                                    <div className='avatar' display-if={imageUrl}>
                                        <img src={imageUrl}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div display-if={showVendorLink}>
                    <Clickable to={'/submit-product'} text={'Submit Your Product'}/>
                </div>
            </div>
        </section>
    }

}

export default EditorialImage