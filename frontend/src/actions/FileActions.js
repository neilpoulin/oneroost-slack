import Parse from 'parse'
import axios from 'axios'

export function getSignedUploadUrl({filename, contentType, pathPrefix='documents-misc'}){
    return Parse.Cloud.run('getPresignedUploadUrl', {filename, contentType, pathPrefix})
        .then(({signedUrl, filePath}) => {
            return {signedUrl, filePath}
        }).catch(error => {
            console.error(error)
        })
}

export function uploadFile(file, pathPrefix='misc', options={}){
    if (!(file instanceof File)){
        console.error('File is not of the correct type. Passed file: ', file)
    }
    const {type: contentType, name: filename} = file;
    return getSignedUploadUrl({contentType, filename, pathPrefix})
        .then(({signedUrl, filePath}) => {
            console.log('signedUrl', signedUrl)
            const {
                onProgress=() => null,
            } = options;

            return doUpload({
                file,
                method: 'PUT',
                url: signedUrl,
                contentType,
                onProgress
            }).then(() => {
                console.log('upload complete')
                return {filePath}
            }).catch(error => {
                console.error(error.message)
                return Promise.reject({message: error.message})
            })
        })
}

function doUpload({file, url, contentType, method='POST', onProgress=() => null}){
    console.log('starting actual upload')
    return axios({
        method,
        url,
        data: file,
        headers: {'Content-Type': contentType},
        timeout: 10000, //miliseconds
        onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total) / 100;
            onProgress({percentCompleted})
        }
    })
}
