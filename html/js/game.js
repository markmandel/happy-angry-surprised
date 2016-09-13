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
 * Module that controls all the gameplay logic and UI of Happy, Angry, Surprised.
 */
var Game = (function() {

    var ref;
    //set of states a game can be in.
    var STATE = {OPEN: 1, JOINED: 2, TAKE_PICTURE: 3, UPLOADED_PICTURE: 4, FACE_DETECTED: 5, COMPLETE: 6};
    var EMOTIONS = {
        HAPPY: {label: "Happy", visionKey: "joyLikelihood"},
        SURPRISED: {label: "Surprised", visionKey: "surpriseLikelihood"},
        ANGRY: {label: "Angry", visionKey: "angerLikelihood"}
    };
    var EMOTION_SCALE = ["UNLIKELY", "VERY_LIKELY", "LIKELY", "POSSIBLE"];
    var UNKNOWN_EMOTION = {label: "Unknown", likelihood: "???"};

    //ui elements
    var create;
    var gameList;
    var cam;
    var dialog;

    /*
     * Enable the ability (via the UI) for the currently logged in player
     * to create a game
     * */
    function enableCreateGame(enabled) {
        create.disabled = !enabled;
    }

    /*
     * Add a join game button to the list, for a given game.
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
     * Join an open game, via it's unique key.
     * */
    function joinGame(key) {
        console.log("Attempting to join game: ", key);
        var user = firebase.auth().currentUser;
        ref.child(key).transaction(function(game) {
            //only join if someone else hasn't
            if (!game.joiner) {
                game.state = STATE.JOINED;
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
     * One the current player has joined a game, update the UI
     * and move the game state to TAKE_PICTURE
     * */
    function joinedGame(game, gameRef) {
        if (game.creator.uid == firebase.auth().currentUser.uid) {
            UI.snackbar({message: game.joiner.displayName + " has joined your game."});
            //wait a little bit
            window.setTimeout(function() {
                gameRef.update({state: STATE.TAKE_PICTURE});
            }, 1000);
        }
    }

    /*
     * Adds the image data to a game in Firebase
     * and updates the game state to UPLOADED_PICTURE
     * */
    function addImageToGame(gameRef, game, gcsPath, downloadURL) {
        var data = {state: STATE.UPLOADED_PICTURE};

        if (game.creator.uid == firebase.auth().currentUser.uid) {
            data["creator/gcsPath"] = gcsPath;
            data["creator/downloadURL"] = downloadURL;
        } else {
            data["joiner/gcsPath"] = gcsPath;
            data["joiner/downloadURL"] = downloadURL;
        }

        gameRef.update(data);
    }

    /*
     * Take the image blob and save it via the imageRef Firebase storage reference.
     * Calls the successCallback once the upload is complete.
     * */
    function saveImage(imageRef, blob, successCallback) {
        var uploadTask = imageRef.put(blob);
        uploadTask.on("state_changed",
                function(snapshot) {
                },
                function(error) {
                    console.log("Error uploading image:", error);
                    UI.snackbar("Error uploading photo.");
                }, function() {
                    console.log("Image has been uploaded!", uploadTask.snapshot);
                    successCallback(uploadTask);
                });
    }

    /*
     * Take a picture via the webcam, and upload it to file storage
     * */
    function takePicture(gameRef, game) {
        // create a canvas, so we can get a draw the video stream on it
        var canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        var context = canvas.getContext("2d");
        context.drawImage(cam, 0, 0, canvas.width, canvas.height);

        var imageRef = firebase.storage().ref().child("games/" + gameRef.key + "/" + firebase.auth().currentUser.uid + ".png");

        // convert the canvas to a png blob
        canvas.toBlob(function(blob) {
            saveImage(imageRef, blob, function(uploadTask) {
                dialog.close();
                //no reason to re-download this from GCS. Just set it locally.
                document.querySelector("#my-image").setAttribute("src", canvas.toDataURL("image/png"));
                var uploadRef = uploadTask.snapshot.ref;
                var gcsPath = "gs://" + uploadRef.bucket + "/" + uploadRef.fullPath;
                addImageToGame(gameRef, game, gcsPath, uploadTask.snapshot.downloadURL);
            })
        });
    }

    /*
     * Show the UI for taking a picture, which counts down,
     * and takes a photo!
     * */
    function countDownToTakingPicture(gameRef, game) {
        var title = dialog.querySelector(".mdl-dialog__title");
        dialog.showModal();
        window.setTimeout(function() {
            title.innerText = 5;

            //for debugging purposes
            if (window.location.search == "?debug") {
                title.innerText = 10;
            }

            //title.innerText = Math.floor(Math.random() * (10 - 3)) + 3;
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
                    takePicture(gameRef, game);
                    document.querySelector("#cam-progress").style.display = "block";
                }
            };
            setTimeout(f, 1000);
        }, 2000);
    }

    /*
     * When an image has been uploaded from the other player
     * display it on the page.
     * */
    function displayUploadedPicture(game) {
        var image = document.querySelector("#other-image");
        var user = firebase.auth().currentUser;

        if (game.creator.downloadURL && game.creator.uid != user.uid) {
            image.src = game.creator.downloadURL;
        } else if (game.joiner.downloadURL && game.joiner.uid != user.uid) {
            image.src = game.joiner.downloadURL;
        }
    }

    /*
     * Get a single emotion value out of Vision API results
     * Either, Happy, Surprised, Angry or Unknown.
     *
     * */
    function getVisionEmotion(visionResult) {
        if (!visionResult.responses || visionResult.responses.length != 1 || visionResult.responses[0].error) {
            console.log("Error in vision result:", visionResult);
            UI.snackbar({message: "Error getting Vision API Result"});
            return
        }

        if (visionResult.responses[0].faceAnnotations.length != 1) {
            UI.snackbar({message: "No face in image"});
            return
        }

        var faceData = visionResult.responses[0].faceAnnotations[0];
        console.log("Face Data: ", faceData);
        for (var likelihood of EMOTION_SCALE) {
            for (var key in EMOTIONS) {
                var emotion = EMOTIONS[key];
                if (faceData[emotion.visionKey] == likelihood) {
                    return {label: emotion.label, likelihood: likelihood};
                }
            }
        }

        return UNKNOWN_EMOTION
    }

    /*
    * Add the current player's emotion data to the current game
    * and save it in Firebase.
    * */
    function addEmotionToGame(gameRef, game, emotion) {
        var data = {state: STATE.FACE_DETECTED};

        if (game.creator.uid == firebase.auth().currentUser.uid) {
            data["creator/emotion"] = emotion;
        } else {
            data["joiner/emotion"] = emotion;
        }

        gameRef.update(data);
    }

    /*
     * Once the game has the stored image from the webcam picture
     * Run this to detect what emotion is being shown on the face
     * in the picture, and add it to the game.
     * */
    function detectMyFacialEmotion(gameRef, game) {
        var gcsPath = game.creator.gcsPath;
        if (game.joiner.uid == firebase.auth().currentUser.uid) {
            gcsPath = game.joiner.gcsPath;
        }

        //may not be my path, so quit out early, as I may not have a value.
        if (!gcsPath) {
            return
        }

        Vision.detectFace(gcsPath, function(result) {
            var emotion = getVisionEmotion(result);

            console.log("Emotion Found: ", emotion);
            document.querySelector("#my-image-emotion h3").innerText = emotion.label + " (" + emotion.likelihood + ")";
            addEmotionToGame(gameRef, game, emotion)
        });
    }

    /*
     * Display on UI the detected emotion from Cloud Vision API.
     * */
    function displayDetectedEmotion(game) {
        var emotionText = document.querySelector("#other-image-emotion h3");
        var user = firebase.auth().currentUser;

        console.log("displayDetectedEmotion", game, user.uid);
        if (game.creator.emotion && game.creator.uid != user.uid) {
            console.log("setting creator emotion text");
            var emotion = game.creator.emotion;
            emotionText.innerText = emotion.label + " (" + emotion.likelihood + ")";
        } else if (game.joiner.emotion && game.joiner.uid != user.uid) {
            console.log("setting joiner emotion text");
            var emotion = game.joiner.emotion;
            emotionText.innerText = emotion.label + " (" + emotion.likelihood + ")";
        }
    }

    /*
     * If both players have emotions, we'll work out the
     * winner, save the results, and update the game state to COMPLETE.
     * */
    function determineWinner(gameRef, game) {
        //the creator can manage this. So if you aren't them, exit now.
        if (game.creator.uid != firebase.auth().currentUser.uid) {
            return
        }
        //make sure we have both emotions.
        if (!(game.creator.emotion && game.joiner.emotion)) {
            return
        }

        console.log("We both have emotions!");
        var creatorWins = false;
        var joinerWins = false;

        if (game.creator.emotion.label == EMOTIONS.HAPPY.label &&
                game.joiner.emotion.label == EMOTIONS.ANGRY.label) {
            creatorWins = true;
        } else if (game.creator.emotion.label == EMOTIONS.SURPRISED.label &&
                game.joiner.emotion.label == EMOTIONS.HAPPY.label) {
            creatorWins = true;
        } else if (game.creator.emotion.label == EMOTIONS.ANGRY.label &&
                game.joiner.emotion.label == EMOTIONS.SURPRISED.label) {
            creatorWins = true;
        } else if (game.creator.emotion.label == game.joiner.emotion.label) {
            //do nothing, its a draw
        } else if (game.creator.emotion.label == UNKNOWN_EMOTION.label) {
            joinerWins = true;
        } else if (game.joiner.emotion.label == UNKNOWN_EMOTION.label) {
            creatorWins = true;
        } else {
            joinerWins = true;
        }

        console.log("Setting game state as complete");
        gameRef.update({
            state: STATE.COMPLETE,
            "creator/wins": creatorWins,
            "joiner/wins": joinerWins
        });
    }

    /*
     * Displays in the UI who won!
     * */
    function showWinner(game) {
        var result = document.querySelector("#result");
        var resultTitle = result.querySelector(".mdl-dialog__title");

        if (result.open) {
            return;
        }

        if (game.creator.wins == game.joiner.wins) {
            resultTitle.innerText = "It was a DRAW! 😒";
            result.showModal();
            return;
        }

        var player = game.creator;
        if (game.joiner.uid == firebase.auth().currentUser.uid) {
            player = game.joiner;
        }

        if (player.wins) {
            resultTitle.innerText = "YOU WON! 😃";
        } else {
            resultTitle.innerHTML = "Sorry.<br/>You lost. 😢"
        }

        result.showModal();
    }

    /*
     * Watch the current game, and depending on state
     * changes, perform actions to move the game on to the next state.
     * */
    function watchGame(key) {
        var gameRef = ref.child(key);
        gameRef.on("value", function(snapshot) {
            var game = snapshot.val();
            console.log("Game update:", game);

            //if we get a null value, because remove - ignore it.
            if (!game) {
                UI.snackbar({message: "Game has finished. Please play again."});
                enableCreateGame(true);
                return
            }

            switch (game.state) {
                case STATE.JOINED:
                    joinedGame(game, gameRef);
                    break;
                case STATE.TAKE_PICTURE:
                    countDownToTakingPicture(gameRef, game);
                    break;
                case STATE.UPLOADED_PICTURE:
                    displayUploadedPicture(game);
                    detectMyFacialEmotion(gameRef, game);
                    break;
                case STATE.FACE_DETECTED:
                    displayDetectedEmotion(game);
                    determineWinner(gameRef, game);
                    break;
                case STATE.COMPLETE:
                    showWinner(game);
                    break;
            }
        })
    }

    // Exposed functions
    return {
        /*
         * Firebase event handlers for when open games are created,
         * and also handing when they are removed.
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
                var data = snapshot.val();
                console.log("Game Added:", data);

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
            });
        },

        /*
         * Enable creation of open games once the player has logged in.
         * */
        onlogin: function() {
            enableCreateGame(true);
        }
    };
})
();
