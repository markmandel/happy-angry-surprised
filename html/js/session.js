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
    var loginDialog;

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
     * Sign out of the google login
     * */
    function googleSignout() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
            console.log('User signed out.');
            window.location.reload();
        });
    }

    /*
     * Sign the user in, with the given credentials
     * */
    function signIn(credential, successCallback) {
        successCallback = successCallback || function() {
                };

        firebase.auth().signInWithCredential(credential).then(function(user) {
            console.log('Sign In Success', user);
            link(credential);
            successCallback();
            Session.closeLoginDialog();
        }, function(error) {
            console.error('Sign In Error', error);
            Session.closeLoginDialog();
        });
    }

    /*
     * Exported functions
     * */
    return {
        /*
         * initialisation function of this module
         * */
        init: function() {
            loginDialog = document.querySelector("#login-dialog");

            document.querySelector("#login").addEventListener("click", function() {
                loginDialog.showModal();
            });
            document.querySelector("#google-logout").addEventListener("click", googleSignout);
        },

        /*
         * Close the dialog, if it is open
         * */
        closeLoginDialog: function() {
            if (loginDialog.open) {
                loginDialog.close();
            }
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
                console.log("success function being called?");

                var login = document.querySelector("#login");
                var logout = document.querySelector("#google-logout");

                login.style.display = "none";
                logout.style.display = "block";
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