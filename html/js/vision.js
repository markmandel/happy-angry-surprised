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
 * Module for interacting with the cloud vision API
 */
var Vision = (function() {

    /*
     * Build the object structure for a Vision API request and return it.
     * */
    function buildVisionRequest(gcsPath) {
        return {
            requests: [{
                image: {source: {gcsImageUri: gcsPath}},
                features: [{type: "FACE_DETECTION", maxResults: 1}]
            }]
        };
    }

    /*
     * Exposed functions
     * */
    return {

        /*
         * Detect a fact in a gcsBucket image
         * */
        detectFace: function(gcsPath, successCallback) {
            console.log("Sending face request for image", gcsPath);

            var url = "https://vision.googleapis.com/v1/images:annotate?key=" + Config.visionAPI.key;

            var request = new XMLHttpRequest();
            request.open("POST", url);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.send(JSON.stringify(buildVisionRequest(gcsPath)));
            request.onreadystatechange = function() {
                if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
                    var result = JSON.parse(request.responseText);
                    successCallback(result);
                } else if (request.status != 200) {
                    console.log("Vision API Error:", request.status, request.responseText);
                }
            }
        }
    }
})();
