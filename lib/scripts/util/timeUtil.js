import moment from 'moment'

export function formatDateShort(input){
    return moment(input).format('l')
}
