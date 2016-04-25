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

/**
 * Helpers for managing forms
 */

Forms = (function() {
    return {
        /*
         * Takes an array of forms fields, and
         * validates to make sure they aren't empty
         * */
        validateForm: function(formFields) {
            //validate
            var valid = true;
            formFields.forEach(function(item) {
                if (item.value == "") {
                    valid = false;
                    item.parentElement.classList.add("is-invalid");
                } else {
                    item.parentElement.classList.remove("is-invalid");
                }
            });
            return valid;
        }
    }
})();