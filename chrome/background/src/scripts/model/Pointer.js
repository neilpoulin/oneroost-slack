import Parse from 'parse'

export default (arg, className) => {
    if (!arg){
        return null
    }
    let modelId = arg
    let modelClass = ''
    if (typeof arg == 'object'){
        modelId = arg.objectId || arg.id
        modelClass = arg.className
    }
    else if (typeof arg == 'string'){
        modelId = arg
    }
    const Pointer = Parse.Object.extend(className || modelClass);
    return Pointer.createWithoutData(modelId);
}
