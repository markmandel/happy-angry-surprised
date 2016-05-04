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
 * Module for controlling the camera
 */

var Cam = (function() {
    var cam;

    return {
        init: function() {
            cam = document.querySelector("#cam");

            console.log("Attempting to connect webcam...");
            var constraints = {audio: false, video: true};
            navigator.mediaDevices.getUserMedia(constraints)
                    .then(function(stream) {
                        console.log("Connected successfully to video stream");
                        cam.srcObject = stream;
                    })
                    .catch(function(error) {
                        console.log("Could not connect to camera: ", error);
                        document.querySelector("#snackbar").MaterialSnackbar.showSnackbar({message: "Error connecting to camera"});
                    });
        }
    }
})();
