print('starting clean.js')

var collectionsToClean = [
    '_User',
    'Vendor',
    'Waitlist',
    'StripeEvent',
    'Redirect',
    '_Session',
    '_Role',
    'Inbound',
]

try{
    main()
} catch (e)
{
    print('Something went wrong: ')
    printjson(e)
}


function main(){
    print('printing db collection names')
    collectionsToClean.forEach(cleanTable)

}

function cleanTable(collectionName){
    var result= db.getCollection(collectionName).deleteMany({})
    print(`${result.deletedCount} ${collectionName} deleted`)
}