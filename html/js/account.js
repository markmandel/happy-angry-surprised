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

/*
 * Module for managing manual Accounts
 * */
var Account = (function() {

    var createDialog;

    //TODO: Shift this into session.js, since creating an account actually logs you in.

    /*
     * Do the work to actually create an account
     * with firebase
     * */
    function submitCreateAccount() {
        //fields
        var displayName = document.querySelector("#entry-displayname");
        var email = document.querySelector("#entry-email");
        var password = document.querySelector("#entry-password");

        //validate
        var valid = true;
        [displayName, email, password].forEach(function(item) {
            if (item.value == "") {
                valid = false;
                item.parentElement.classList.add("is-invalid");
            } else {
                item.parentElement.classList.remove("is-invalid");
            }
        });

        if (valid) {
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then(function(user) {
                console.log('Create user and sign in Success', user);
                //add the displayname
                user.updateProfile({displayName: displayName});
                createDialog.close();
                Session.closeLoginDialog();
            }, function(error) {
                console.error('Create user and sign in Error', error);
                createDialog.close();
                Session.closeLoginDialog();
            });
        } else {
            var data = {message: "All fields required"};
            document.querySelector("#snackbar").MaterialSnackbar.showSnackbar(data);
        }
    }

    /*
     * Exported functions
     * */
    return {
        /*
         * Initialisation function for the module
         * */
        init: function() {
            createDialog = document.querySelector("#create-account-dialog");

            document.querySelector("#create-account").addEventListener("click", function() {
                createDialog.showModal();
            });

            document.querySelector("#entry-submit").addEventListener("click", submitCreateAccount);
        }
    }

})();