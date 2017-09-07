//Default timeout = 5 seconds
function Timeout(callable, timeout=5000){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Function timed out')
        }, timeout)
        callable(resolve, reject)
    })
}

export default Timeout
