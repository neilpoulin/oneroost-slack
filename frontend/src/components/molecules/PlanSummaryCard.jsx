import React from 'react'
import PropTypes from 'prop-types'
import PriceCircle from 'atoms/checkout/PriceCircle'
import Clickable from 'atoms/Clickable'

class PlanSummaryCard extends React.Component {
    static propTypes = {
        plan: PropTypes.shape({
            name: PropTypes.string,
            features: PropTypes.arrayOf(PropTypes.string),
            backgroundColor: PropTypes.string,
            textColor: PropTypes.string,
            encodedPlanId: PropTypes.string,
            cta: PropTypes.string,
            formattedPrice: PropTypes.string,
            period: PropTypes.string,
        }),
        showCheckoutLink: PropTypes.bool,

    }

    static defaultProps = {
        showCheckoutLink: true,
    }

    render(){
        const {
            plan,
            showCheckoutLink,
        } = this.props
        return <div className={'tier'}>
            <div className={'content'}>
                <h3 className={'tierName'}>{plan.name}</h3>
                <div className={'priceCircle'}>
                    <PriceCircle formattedPrice={plan.formattedPrice} period={plan.period}
                        backgroundColor={plan.backgroundColor}
                        textColor={plan.textColor}/>
                </div>

                <ul className={'features'} display-if={plan.features}>
                    {plan.features.map((feature, j) =>
                        <li key={`plan_feature_${j}`}>{feature}</li>
                    )}
                </ul>
            </div>
            <div className={'actions'} display-if={showCheckoutLink}>
                <Clickable text={`${plan.cta}`} to={`/checkout/${plan.encodedPlanId}`}/>
            </div>
        </div>
    }

}

export default PlanSummaryCard