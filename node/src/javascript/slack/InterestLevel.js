export const YES = 'YES'
export const NOT_NOW = 'NOT_NOW'
export const NO = 'NO'

export const displayMap = {
    [YES]: {
        value: YES,
        displayText: 'Yes',
        emoji: ':white_check_mark:'
    },
    [NOT_NOW]: {
        value: NOT_NOW,
        displayText: 'Not Now',
        emoji: ':hourglass_flowing_sand:'
    },
    [NO]: {
        value: NO,
        displayText:'No',
        emoji: ':no_entry_sign:'
    },
}

export function getInterestLevelDisplayText(interestLevel){
    let level = displayMap[interestLevel];
    if (level){
        return level.displayText
    }
    return ''
}

export function getEmoji(interestLevel){
    let level = displayMap[interestLevel];
    if (level){
        return level.emoji
    }
    return ''
}
