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

    /*
     * Linking for the Google Account
     * */
    function link(credential) {
        console.log("Attempting to link account");
        firebase.auth().currentUser.link(credential).then(function(user) {
            console.log("Account linking success", user);
        }, function(error) {
            console.log("Account linking error", error);
        });
    }

    /*
     * Sign the user in, with the given credentials
     * */
    function signIn(credential, successCallback) {
        var noop = function(){};

        successCallback = successCallback || noop();

        firebase.auth().signInWithCredential(credential).then(function(user) {
            console.log('Sign In Success', user);
            link(credential);
            successCallback();
            closeLoginDialog();
        }, function(error) {
            console.error('Sign In Error', error);
            closeLoginDialog();
        });
    }

    /*
     * Close the dialog, if it is open
     * */
    function closeLoginDialog() {
        var dialog = document.querySelector("#login-dialog");
        if (dialog.open) {
            dialog.close();
        }
    }

    /*
     * Exported functions
     * */
    return {
        /*
         * initialisation function of this module
         * */
        init: function() {
            var login = document.querySelector("#login");
            var dialog = document.querySelector("#login-dialog");
            login.addEventListener("click", function() {
                dialog.showModal();
            })
        },

        /*
         * Google sign in
         * */
        googleSignin: function(googleUser) {
            console.log("Google Signin", googleUser.getAuthResponse().id_token);
            var credential = firebase.auth.GoogleAuthProvider.credential({
                'idToken': googleUser.getAuthResponse().id_token
            });
            signIn(credential, function() {
                var login = document.querySelector("#login");
                var logout = document.querySelector("#google-logout");

                login.style.visibility = "none";
                logout.style.visibility = "block";
            });
        }
    }
})();

/*
 * Make life easier for the google signin button, have a global function
 * */
function googleSignin(googleUser) {
    Session.googleSignin(googleUser);
}