/**
 * Place to put all your
 * configuration keys
 */
Config = function() {
    return {
        // You will need to replace with your own Firebase configuration
        // This can be retrieved from clicking "Add App" from the project overview page.
        firebase: {
            apiKey: "apiKey",
            authDomain: "projectId.firebaseapp.com",
            databaseURL: "https://databaseName.firebaseio.com",
            storageBucket: "bucket.appspot.com",
        },
        // Replace with an API key for Google Cloud Vision API
        // DO NOT DO THIS IN PRODUCTION!!! For Demo purposes only.
        visionAPI: {
            key: "apiKey"
        }
    }
}();
