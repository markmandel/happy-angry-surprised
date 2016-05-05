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
 * Deals with layout and UI
 */
var UI = (function() {

    //public functions
    return {
        /*
        * Fill layout vertically in the browser
        * */
        fillVertically: function() {
            //fill vertically
            var header = document.querySelector("header");
            var chat = document.querySelector("#chat");
            chat.style.height = (window.innerHeight - header.clientHeight - 32) + "px";

            //expand out chat area
            var messages = document.querySelector("#chat-messages");
            var header = document.querySelector("#chat-header");
            var input = document.querySelector("#chat-input");

            messages.style.height = (chat.clientHeight - (header.clientHeight + input.clientHeight)) + "px";
        },

        /*
        * Simple way to show a snackbar at the bottom of the page
        * */
        snackbar: function(data) {
            document.querySelector("#snackbar").MaterialSnackbar.showSnackbar(data);
        }
    }
})();