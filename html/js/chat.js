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
 * Module for managing the Chat system
 */
var Chat = (function() {
    var send;
    var message;
    var ref;

    function sendChatMessage() {
        enableChat(false);
        ref.push().set({
            name: firebase.auth().currentUser.displayName,
            message: message.value
        }, function(error) {
            if (error) {
                console.log("Uh oh, error saving data.", error);
                document.querySelector("#snackbar").MaterialSnackbar.showSnackbar({message: "Error sending message"});
            } else {
                message.value = "";
                message.parentElement.classList.remove("is-dirty");
            }

            enableChat(true);
        });
    }

    /*
     * Turn on or off chat
     * */
    function enableChat(enable) {
        console.log("enabling chat: ", enable);
        [send, message].forEach(function(item) {
            item.disabled = !enable;
        });
    }

    return {
        init: function() {
            send = document.querySelector("#send-chat");
            message = document.querySelector("#chat-message");

            //our realtime database reference
            ref = firebase.database().ref("/chat");

            send.addEventListener("click", sendChatMessage);
        },

        onlogin: function() {
            enableChat(true);
        }
    }
})();