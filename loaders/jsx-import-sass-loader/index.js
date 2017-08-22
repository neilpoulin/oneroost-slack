const fs = require('fs')
const path = require('path')

function safeString(input){
    return input.replace(/\W/g, '_');
}

module.exports = function(source){
    const callback = this.async();

    const targetScssFilePath = path.join(this.context, path.basename(this.resourcePath, path.extname(this.resourcePath))) + '.scss';
    if ( fs.existsSync(targetScssFilePath)){
        callback( null, `import ${safeString(targetScssFilePath)} from './${path.basename(targetScssFilePath)}';
        ${source}`);
    } else {
        callback(null, source);
    }
}
