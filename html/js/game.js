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
 * Module for joining and playing happy, angry, surprised.
 */

var Game = (function(){

    var create;
    var ref;
    var STATE = {OPEN: 3, PLAYING: 2, FINISHED: 1};

    function createGame() {
        console.log("creating a game!");
        enableCreateGame(false);
        var user = firebase.auth().currentUser;
        ref.push().set({
            creatorUID: user.uid,
            creatorDisplayName: user.displayName,
            state: STATE.OPEN
        }, function(error) {
            if (error) {
                console.log("Uh oh, error creating game.", error);
                document.querySelector("#snackbar").MaterialSnackbar.showSnackbar({message: "Error creating game"});
            } else {
                //disable access to joining other games
                console.log("I created a game!");
            }
        })
    }

    function enableCreateGame(enabled) {
        create.disabled = !enabled;
    }

    return {
        init: function() {
            create = document.querySelector("#create-game");
            create.addEventListener("click", createGame);

            ref = firebase.database().ref("/games");
        },

        onlogin: function() {
            enableCreateGame(true);
        }
    };
})();
