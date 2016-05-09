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
    var messageField;
    var messages;
    var ref;

    /*
     * Turn on or off chat
     * */
    function enableChat(enable) {
        console.log("enabling chat: ", enable);
        [send, messageField].forEach(function(item) {
            item.disabled = !enable;
        });
    }

    /*
     * Send a chat message to firebase
     * */
    function sendChatMessage() {
        enableChat(false);
        ref.push().set({
            name: firebase.auth().currentUser.displayName,
            message: messageField.value
        }, function(error) {
            if (error) {
                console.log("Uh oh, error saving data.", error);
                UI.snackbar({message: "Error sending message"});
            } else {
                messageField.value = "";
                messageField.parentElement.classList.remove("is-dirty");
            }

            enableChat(true);
        });
    }

    /*
     * Add a chat message to the chat UI
     * */
    function addChatMessage(name, message) {
        var item = document.createElement("li");
        item.innerHTML = "<strong>" + name + "</strong> " + message;

        var messageList = messages.querySelector("ul");
        messageList.appendChild(item);
        messages.scrollTop = messageList.scrollHeight;
    }

    /*
     * Exposed functions
     * */
    return {
        /*
         * Initialisation function
         * */
        init: function() {
            send = document.querySelector("#send-chat");
            messageField = document.querySelector("#chat-message");
            messages = document.querySelector("#chat-messages");

            //our realtime database reference
            ref = firebase.database().ref("/chat");

            send.addEventListener("click", sendChatMessage);

            //once loaded initial set, let's grab up to date chat messages.
            ref.on("child_added", function(snapshot) {
                var message = snapshot.val();
                addChatMessage(message.name, message.message);
            });
        },

        /*
         * Call when the user has logged in
         * */
        onlogin: function() {
            enableChat(true);
        }
    }
})();