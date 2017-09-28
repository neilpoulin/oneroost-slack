import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Clickable from 'atoms/Clickable'
import {uploadFile} from '../../actions/FileActions'
import Dropzone from 'react-dropzone'
import {Line} from 'react-progressbar.js'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'

class FileUploadForm extends React.Component {
    static propTypes = {
        onSuccess: PropTypes.func,
        onProgress: PropTypes.func,
        buttonText: PropTypes.string,
        buttonOutline: PropTypes.bool,
        className: PropTypes.string,
        fileKeyPrefix: PropTypes.string,
        onCompleted: PropTypes.func,
        onClear: PropTypes.func,
        selectedFilePath: PropTypes.string,
        showUrlInput: PropTypes.bool,
        onUrlChange: PropTypes.func,
        url: PropTypes.string,
    }

    static defaultProps = {
        buttonText: 'Upload',
        fileKeyPrefix: 'misc',
        onProgress: () => null,
        onCompleted: () => null,
        showUrlInput: false,
        onUrlChange: () => null,
        url: '',
    }

    constructor(props){
        super(props)
        let filename = props.selectedFilePath ? props.selectedFilePath.split('/')[props.selectedFilePath.split('/').length - 1 ] : null
        this.state = {
            isUploading: false,
            percentCompleted: filename ? 1 : 0,
            success: filename ? true : false,
            error: null,
            showProgressBar: filename ? true : false,
            filename,
        };

        this._handleDrop = this._handleDrop.bind(this)
        this._onProgress = this._onProgress.bind(this)
        this._onCompleted = this._onCompleted.bind(this)
        this._reset = this._reset.bind(this)
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

    _reset(e){
        e.preventDefault()
        this.setState({
            isUploading: false,
            percentCompleted: 0,
            success: false,
            error: null,
            showProgressBar: false,
            filename: null,
        })
        if (this.props.onClear){
            this.props.onClear()
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
            showUrlInput,
            onUrlChange,
            url,
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
                disabled={url ? true : false}
                >
                <div className='dropTarget'>
                    <Clickable outline={buttonOutline} text={url ?'Clear link to upload' : buttonText} display-if={!showProgressBar} disabled={url ? true : false}/>
                    <div display-if={error} className='error'>
                        Oops, something went wrong while uploading {filename} {error.message ? ': ' + error.message : null}
                    </div>
                    <div display-if={showProgressBar} className='progressContainer'>
                        <div className='fileInfo'>
                            <div className='filename'>{`${isUploading ? 'Uploading' : 'Uploaded'} ${filename}`}</div>
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
            <Clickable className='link-small' text={'Remove'} display-if={success} onClick={this._reset} look={'link'}/>
            <div className='urlInput' display-if={showUrlInput && !showProgressBar}>
                <div className='divider'>Or, share a link</div>
                <FormGroup label='Link'>
                    <TextInput placeholder='' onChange={onUrlChange} value={url}/>
                </FormGroup>
            </div>
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
