/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { SortAlgorithm, TagID } from "./models";
import {Room} from "matrix-js-sdk/src/models/room";

/**
 * Represents an algorithm for the RoomListStore to use
 */
export interface IAlgorithm {
    /**
     * Asks the Algorithm to regenerate all lists, using the tags given
     * as reference for which lists to generate and which way to generate
     * them.
     * @param tagAlgorithmMap {{[tagId: string]: SortAlgorithm}} The tags to
     * generate.
     * @returns {Promise<*>} A promise which resolves when complete.
     */
    populateTags(tagAlgorithmMap: {[tagId in TagID]: SortAlgorithm}): Promise<any>;

    /**
     * Gets an ordered set of rooms for the all known tags.
     * @returns {{[tagId: TagID]: Room[]}} The cached list of rooms, ordered,
     * for each tag. May be empty, but never null/undefined.
     */
    getOrderedRooms(): {[tagId in TagID]: Room[]};
}
