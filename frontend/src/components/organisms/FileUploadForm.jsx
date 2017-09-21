import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Clickable from 'atoms/Clickable'
import {uploadFile} from '../../actions/FileActions'
import Dropzone from 'react-dropzone'
import {Line} from 'react-progressbar.js'

class FileUploadForm extends React.Component {
    static propTypes = {
        onSuccess: PropTypes.func,
        onProgress: PropTypes.func,
        buttonText: PropTypes.string,
        buttonOutline: PropTypes.bool,
        className: PropTypes.string,
        fileKeyPrefix: PropTypes.string,
    }

    static defaultProps = {
        buttonText: 'Upload',
        fileKeyPrefix: 'misc',
        onProgress: () => null,
        onCompleted: () => null,
    }

    constructor(props){
        super(props)

        this.state = {
            isUploading: false,
            percentCompleted: 0,
            success: false,
            error: null,
            showProgressBar: false,
            filename: null,
        };

        this._handleDrop = this._handleDrop.bind(this)
        this._onProgress = this._onProgress.bind(this)
        this._onCompleted = this._onCompleted.bind(this)

    }

    _onProgress({percentCompleted}){
        const {onProgress} = this.props
        if (onProgress){
            onProgress({percentCompleted})
        }
        this.setState({
            isUploading: true,
            percentCompleted: percentCompleted,
            showProgressBar: true,
        })
    }

    _onCompleted({filePath}){
        this.setState({
            isUploading: false,
            success: true,
            error: null,
        })
        const {onCompleted} = this.props;
        if (onCompleted){
            onCompleted({filePath})
        }
    }

    _handleDrop(acceptedFiles, rejectedFiles){
        console.log('accepted files', acceptedFiles)
        console.log('rejected files', rejectedFiles)
        let file = acceptedFiles[0]
        console.log('file', file)
        const {fileKeyPrefix} = this.props
        this.setState({
            filename: file.name,
            isUploading: true,
            percentCompleted: 0,
            success: false,
            error: null,
            showProgressBar: true,
        })
        uploadFile(file, fileKeyPrefix, {
            onProgress: this._onProgress,
        }).then(({filePath}) => {
            this._onCompleted({filePath})
        }).catch(error => {
            this.setState({
                error,
                isUploading: false,
                success: false,
                showProgressBar: false,
            })
        })
    }

    render () {
        const {
            buttonText,
            className: containerClassName,
            buttonOutline,
        } = this.props

        const {
            isUploading,
            percentCompleted,
            success,
            error,
            showProgressBar,
            filename,
        } = this.state

        return <div className={containerClassName}>
            <Dropzone onDrop={this._handleDrop}
                className='dropzone'
                activeClassName='active'
                acceptClassName='accepted'
                multiple={false}
                >
                <div className='dropTarget'>
                    <Clickable outline={buttonOutline} text={buttonText} display-if={!showProgressBar}/>
                    <div display-if={error} className='error'>
                        Oops, something went wrong while uploading {filename} {error.message ? ': ' + error.message : null}
                    </div>
                    <div display-if={showProgressBar} className='progressContainer'>
                        <div className='fileInfo'>
                            <div className='filename'>{`${isUploading ? 'Uploading' : 'Uploaded'} ${filename}`}</div>
                            <Clickable className='link-small' text={'Choose a different file'} display-if={success} look={'link'}/>
                        </div>
                        <Line
                            progress={percentCompleted}
                            text={`${Math.floor(percentCompleted * 100)}%`}
                            options={{
                                strokeWidth: 2,
                                color: (success ? '#007f00' : '#737373'),
                                text: {
                                    style: {
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        padding: 0,
                                        margin: '1rem 0 0 0',
                                        transform: {
                                            prefix: true,
                                            value: 'translate(-50%, -50%)'
                                        }
                                    },
                                }
                            }}
                            initialAnimate={false}
                            containerClassName={'FileUploadForm progressbar'}
                            />
                    </div>
                </div>
            </Dropzone>

        </div>

    }
}

const mapStateToProps = (state, ownProps) => {
    return {

    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onProgress: ({percentCompleted}) => {
            console.log('percent completed - prop', percentCompleted)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploadForm);
