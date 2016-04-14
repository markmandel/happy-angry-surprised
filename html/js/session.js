/*
 *  Copyright 2016 Google Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License")
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

/**
 * Module for managing auth
 */
var Session = (function() {
    return {

        //initialisation function for auth
        init: function() {
            var login = document.querySelector("#login");
            var dialog = document.querySelector("#login-dialog");
            login.addEventListener("click", function() {
                dialog.showModal();
            })
        },

        googleSignin: function(googleUser) {
            console.log("Google Signin", googleUser.getAuthResponse().id_token);

            var credential = firebase.auth.GoogleAuthProvider.credential({
                'idToken' : googleUser.getAuthResponse().id_token
            });

            console.log("credential: ", credential);

            firebase.auth().signInWithCredential(credential).then(function(user) {
                console.log('Sign In Success', user);
            }, function(error) {
                console.error('Sign In Error', error);
            });
        }
    }
})();

/*
* Make life easier for the google signin button
* */
function googleSignin(googleUser) {
    Session.googleSignin(googleUser);
}