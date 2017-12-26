export function getDomainFromEmail(email) {
    if (email.indexOf('@') !== -1)
    {
        let myRegexp = /@(.*)/g
        var match = myRegexp.exec(email)
        return match[1]
    } else {
        return email
    }
}