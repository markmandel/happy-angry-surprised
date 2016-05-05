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

var Game = (function() {

    var ref;
    //set of states a game can be in.
    var STATE = {OPEN: 1, JOINED: 2, PICTURE: 3, RESULT: 4, CREATOR_WON: 5, CREATOR_LOST: 6, DRAW: 7};

    //ui elements
    var create;
    var gameList;

    /*
     * Create a game in Firebase
     * */
    function createGame() {
        console.log("creating a game!");
        enableCreateGame(false);

        var user = firebase.auth().currentUser;
        var currentGame = {
            creatorUID: user.uid,
            creatorDisplayName: user.displayName,
            state: STATE.OPEN
        };

        var key = ref.push();
        key.set(currentGame, function(error) {
            if (error) {
                console.log("Uh oh, error creating game.", error);
                document.querySelector("#snackbar").MaterialSnackbar.showSnackbar({message: "Error creating game"});
            } else {
                //disable access to joining other games
                console.log("I created a game!", key);
                //drop this game, if I disconnect
                key.onDisconnect().remove();
                gameList.style.display = "none";
                watchGame(key.key);
            }
        })
    }

    /*
     * Join a game that a person has already opened
     * */
    function joinGame(key) {
        console.log("Attempting to join game: ", key);
        ref.child(key).transaction(function(currentValue) {
            currentValue.state = 2;
            currentValue.joinerDisplayname = firebase.auth().currentUser.displayName;
            return currentValue;
        }, function(error, committed, snapshot) {
            if (committed) {
                enableCreateGame(false);
                watchGame(key);
            } else {
                console.log("Could not commit when trying to join game", error);
                document.querySelector("#snackbar").MaterialSnackbar.showSnackbar({message: "Error joining game"});
            }
        });
    }

    /*
     * Watch the current game, and depending on state
     * changes, perform actions.
     * */
    function watchGame(key) {
        ref.child(key).on("value", function(snapshot) {
            var game = snapshot.val();
            console.log("Game update:", game);

            switch (game.state) {
                //TODO: implement
            }
        })
    }

    /*
     * enable the ability to create a game
     * */
    function enableCreateGame(enabled) {
        create.disabled = !enabled;
    }

    /*
     * Add the jopin game button to the list
     * */
    function addJoinGameButton(key, game) {
        var item = document.createElement("li");
        item.id = key;
        item.innerHTML = '<button id="create-game" ' +
                'class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">' +
                'Join ' + game.creatorDisplayName + '</button>';
        item.addEventListener("click", function() {
            joinGame(key);
        });

        gameList.appendChild(item);
    }

    return {
        /*
         * Initialisation function
         * */
        init: function() {
            create = document.querySelector("#create-game");
            create.addEventListener("click", createGame);

            gameList = document.querySelector("#games ul");

            ref = firebase.database().ref("/games");

            var openGames = ref.orderByChild("state").equalTo(STATE.OPEN);
            openGames.on("child_added", function(snapshot) {
                console.log("games:", snapshot);
                var data = snapshot.val();

                //ignore our own games
                if (data.creatorUID != firebase.auth().currentUser.uid) {
                    addJoinGameButton(snapshot.key, data);
                }
            });

            openGames.on("child_removed", function(snapshot) {
                var item = document.querySelector("#" + snapshot.key);
                if (item) {
                    item.remove();
                }
            })
        },

        /*
         * Event handler once we have logged in
         * */
        onlogin: function() {
            enableCreateGame(true);
        }
    };
})();
