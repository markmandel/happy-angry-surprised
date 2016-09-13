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
 * Module for auth and session management
 */
var Session = (function() {
    var loginDialog;
    var createDialog;
    var loggedIn = false;

    /*
     * Firebase handler for when authentication state
     * changes
     * */
    function authStateChangeListener(user) {
        console.log("Auth state change: ", user);

        //signin
        if (user) {
            console.log("I am now logged in");
            loggedIn = true;
            closeLoginDialog();
            document.querySelector("#login").style.display = "none";
            document.querySelector("#logout").style.display = "block";

            Chat.onlogin();
            Game.onlogin();
        } else { //signout
            if (loggedIn) {
                loggedIn = false;
                window.location.reload();
            }
        }
    }

    /*
     * Sign in with a username and password
     * */
    function signInWithEmailandPassword() {
        var email = document.querySelector("#email");
        var password = document.querySelector("#password");
        var valid = Forms.validateForm([email, password]);

        if (valid) {
            firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(user) {
                console.log("Signed in with user: ", user);
            }, function(error) {
                console.log("Sign in error: ", error);
            })
        } else {
            var data = {message: "All fields required"};
            UI.snackbar(data);
        }
    }

    /*
     * Sign in with you Google Account
     * */
    function signInWithGoogle() {
        console.log("attempting to sign in with Google");
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/userinfo.email");
        provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;

        }).catch(function(error) {
            console.log("Google Login error: ", error);
        });
    }

    /*
     * Close the login dialog, but only if it's open
     * */
    function closeLoginDialog() {
        var dialog = document.querySelector("#login-dialog");
        if (dialog.open) {
            dialog.close();
        }
    }

    /*
     * Do the work to actually create an account
     * with Firebase
     * */
    function submitCreateAccount() {
        //fields
        var displayName = document.querySelector("#entry-displayname");
        var email = document.querySelector("#entry-email");
        var password = document.querySelector("#entry-password");
        var valid = Forms.validateForm([displayName, email, password]);

        if (valid) {
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then(function(user) {
                console.log('Create user and sign in Success', user);
                //add the displayName
                user.updateProfile({displayName: displayName.value});
                createDialog.close();
                closeLoginDialog();
            }, function(error) {
                console.error('Create user and sign in Error', error);
                createDialog.close();
                closeLoginDialog();
            });
        } else {
            var data = {message: "All fields required"};
            UI.snackbar(data);
        }
    }

    // Exported functions
    return {
        /*
         * Sets up event listeners for login/logout UI elements.
         * */
        init: function() {
            loginDialog = document.querySelector("#login-dialog");

            firebase.auth().onAuthStateChanged(authStateChangeListener);

            //login/logout
            document.querySelector("#login").addEventListener("click", function() {
                loginDialog.showModal();
            });
            document.querySelector("#logout").addEventListener("click", function() {
                firebase.auth().signOut().then(function() {
                    console.log('Signed Out');
                }, function(error) {
                    console.error('Sign Out Error', error);
                });
            });
            document.querySelector("#sign-in").addEventListener("click", signInWithEmailandPassword);

            //google login
            document.querySelector("#google-signin img").addEventListener("click", signInWithGoogle);

            //create accounts
            createDialog = document.querySelector("#create-account-dialog");
            document.querySelector("#create-account").addEventListener("click", function() {
                createDialog.showModal();
            });
            document.querySelector("#entry-submit").addEventListener("click", submitCreateAccount);
        },
    }
})();