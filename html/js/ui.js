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
 * Module for generic Layout and UI controls
 */
var UI = (function() {

    // Exposed functions
    return {
        /*
         * Fill layout vertically in the browser
         * */
        fillVertically: function() {
            //fill vertically
            var pageHeader = document.querySelector("header");
            var chat = document.querySelector("#chat");
            chat.style.height = (window.innerHeight - pageHeader.clientHeight - 32) + "px";

            //expand out chat area
            var messages = document.querySelector("#chat-messages");
            var chatHeader = document.querySelector("#chat-header");
            var input = document.querySelector("#chat-input");

            messages.style.height = (chat.clientHeight - (chatHeader.clientHeight + input.clientHeight)) + "px";

            //manage image height
            var images = document.querySelectorAll("#game .face");
            var height = (chat.clientHeight / 2) - 80;
            for(var counter = 0; counter < images.length; counter++) {
                var img = images.item(counter);
                img.style.maxHeight = height + "px";
            }
        },

        /*
         * Simple way to show a MDL snackbar at the bottom of the page
         * https://getmdl.io/components/index.html#snackbar-section
         * */
        snackbar: function(data) {
            document.querySelector("#snackbar").MaterialSnackbar.showSnackbar(data);
        },

        /*
         * Initialisation for some generic ui elements
         * */
        init: function() {
            // help dialog
            document.querySelector("#help").addEventListener("click", function() {
                document.querySelector('#help-dialog').showModal();
            });

            // play again dialog
            var result = document.querySelector("#result");
            result.querySelector("button").addEventListener("click", function() {
                //result.close();
                window.location.reload();
            });
        }
    }
})();