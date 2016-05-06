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
    var STATE = {OPEN: 1, JOINED: 2, TAKE_PICTURE: 3};

    //ui elements
    var create;
    var gameList;
    var cam;
    var dialog;

    /*
     * enable the ability to create a game
     * */
    function enableCreateGame(enabled) {
        create.disabled = !enabled;
    }

    /*
     * Add the join game button to the list
     * */
    function addJoinGameButton(key, game) {
        var item = document.createElement("li");
        item.id = key;
        item.innerHTML = '<button id="create-game" ' +
                'class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">' +
                'Join ' + game.creator.displayName + '</button>';
        item.addEventListener("click", function() {
            joinGame(key);
        });

        gameList.appendChild(item);
    }

    /*
     * Create a game in Firebase
     * */
    function createGame() {
        console.log("creating a game!");
        enableCreateGame(false);

        var user = firebase.auth().currentUser;
        var currentGame = {
            creator: {
                uid: user.uid,
                displayName: user.displayName
            },
            state: STATE.OPEN
        };

        var key = ref.push();
        key.set(currentGame, function(error) {
            if (error) {
                console.log("Uh oh, error creating game.", error);
                UI.snackbar({message: "Error creating game"});
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
        var user = firebase.auth().currentUser;
        ref.child(key).transaction(function(game) {
            //only join if someone else hasn't
            if (!game.joiner) {
                game.state = 2;
                game.joiner = {
                    uid: user.uid,
                    displayName: user.displayName
                }
            }
            return game;
        }, function(error, committed, snapshot) {
            if (committed) {
                if (snapshot.val().joiner.uid == user.uid) {
                    enableCreateGame(false);
                    watchGame(key);
                } else {
                    UI.snackbar({message: "Game already joined. Please choose another."});
                }
            } else {
                console.log("Could not commit when trying to join game", error);
                UI.snackbar({message: "Error joining game"});
            }
        });
    }

    /*
     * Adds an image to a game, in the appropriate place
     * and updates the game state
     * */
    function addImageToGame(key, gsPath, downloadURL) {


    }

    /*
     * Take a picture, and upload it to file storage
     * */
    function takePicture(key) {
        var canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        var context = canvas.getContext("2d");
        context.drawImage(cam, 0, 0, canvas.width, canvas.height);

        var picRef = firebase.storage().ref().child("games/" + key + "/" + firebase.auth().currentUser.uid + ".png");

        canvas.toBlob(function(blob) {
            var uploadTask = picRef.put(blob);
            uploadTask.on("state_changed",
                    function(snapshot) {
                    },
                    function(error) {
                        console.log("Error uploading image:", error);
                        UI.snackbar("Error uploading photo.");
                    }, function() {
                        console.log("Image has been uploaded!");
                        dialog.close();
                        //no reason to re-download this from GCS. Just set it locally.
                        document.querySelector("#my-image").setAttribute("src", canvas.toDataURL("image/png"));

                        addImageToGame(key, uploadTask.snapshot.ref.fullPath, uploadTask.snapshot.downloadURL);
                    });
        });
    }

    /*
     * Show the UI for taking a picture, counts down
     * and takes a photo!
     * */
    function countDownToTakingPicture(key) {
        var title = dialog.querySelector(".mdl-dialog__title");
        dialog.showModal();
        window.setTimeout(function() {
            title.innerText = 5;
            var f = function() {
                var count = parseInt(title.innerText);
                if (count > 1) {
                    count--;
                    title.innerText = count;
                    setTimeout(f, 1000);
                } else {
                    console.log("Taking picture!");
                    title.innerText = "CHEESE!";
                    cam.pause();
                    takePicture(key);
                    document.querySelector("#cam-progress").style.display = "block";
                }
            };
            setTimeout(f, 1000);
        }, 2000);
    }

    /*
     * Watch the current game, and depending on state
     * changes, perform actions.
     * */
    function watchGame(key) {
        var gameRef = ref.child(key);
        gameRef.on("value", function(snapshot) {
            var game = snapshot.val();
            console.log("Game update:", game);

            //if we get a null value, because remove - ignore it.
            if (!game) {
                return
            }

            switch (game.state) {
                case STATE.JOINED:
                {
                    if (game.creator.uid == firebase.auth().currentUser.uid) {
                        UI.snackbar({message: game.joiner.displayName + " has joined your game."});
                        //wait a little bit
                        window.setTimeout(function() {
                            gameRef.update({state: STATE.TAKE_PICTURE});
                        }, 1000);
                    }
                    break;
                }

                case STATE.TAKE_PICTURE:
                {
                    countDownToTakingPicture(key);
                    break;
                }
            }
        })
    }

    return {
        /*
         * Initialisation function
         * */
        init: function() {
            create = document.querySelector("#create-game");
            create.addEventListener("click", createGame);

            gameList = document.querySelector("#games ul");
            cam = document.querySelector("#cam");
            dialog = document.querySelector("#game-cam");

            ref = firebase.database().ref("/games");

            var openGames = ref.orderByChild("state").equalTo(STATE.OPEN);
            openGames.on("child_added", function(snapshot) {
                console.log("games:", snapshot);
                var data = snapshot.val();

                //ignore our own games
                if (data.creator.uid != firebase.auth().currentUser.uid) {
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
