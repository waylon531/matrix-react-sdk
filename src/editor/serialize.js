/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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

import Markdown from '../Markdown';
import marked from 'marked';
//import { parse, HtmlGenerator } from 'latex.js'
import {makeGenericPermalink} from "../utils/permalinks/Permalinks";

export function mdSerialize(model) {
    return model.parts.reduce((html, part) => {
        switch (part.type) {
            case "newline":
                return html + "\n";
            case "plain":
            case "command":
            case "pill-candidate":
            case "at-room-pill":
                return html + part.text;
            case "room-pill":
            case "user-pill":
                return html + `[${part.text}](${makeGenericPermalink(part.resourceId)})`;
        }
    }, "");
}

export function htmlSerializeIfNeeded(model, {forceHTML = false} = {}) {
    const md = mdSerialize(model);

    let parsed = marked(md);
    // This doesn't have the <p> tag or anything at the end
    // Useful for checking for noops
    // const parsedInline = marked.parseInline(md);

    // TODO: this is bad, I don't want to parse the whole thing,
    // just chunks in $$
    // let generator = new HtmlGenerator({ hyphenate: false });
    // let doc = parse(latex, { generator: generator }).htmlDocument()

    // Check to see if the plaintext and rendered text would be the same
    //if (true || parsedInline != md || forceHTML ) {
        //return parser.toHTML();

    //Trim out the trailing newline
    parsed = parsed.slice(0,-1);
    
    //Trim out the <p> tags that surround text messages
    //These fuck up the display of emojis
    if (parsed.startsWith("<p>") && parsed.endsWith("</p>")) {
        parsed = parsed.slice(3).slice(0,-4);
    }

    return parsed;
    //}
}

export function textSerialize(model) {
    return model.parts.reduce((text, part) => {
        switch (part.type) {
            case "newline":
                return text + "\n";
            case "plain":
            case "command":
            case "pill-candidate":
            case "at-room-pill":
                return text + part.text;
            case "room-pill":
            case "user-pill":
                return text + `${part.text}`;
        }
    }, "");
}

export function containsEmote(model) {
    return startsWith(model, "/me ");
}

export function startsWith(model, prefix) {
    const firstPart = model.parts[0];
    // part type will be "plain" while editing,
    // and "command" while composing a message.
    return firstPart &&
        (firstPart.type === "plain" || firstPart.type === "command") &&
        firstPart.text.startsWith(prefix);
}

export function stripEmoteCommand(model) {
    // trim "/me "
    return stripPrefix(model, "/me ");
}

export function stripPrefix(model, prefix) {
    model = model.clone();
    model.removeText({index: 0, offset: 0}, prefix.length);
    return model;
}

export function unescapeMessage(model) {
    const {parts} = model;
    if (parts.length) {
        const firstPart = parts[0];
        // only unescape \/ to / at start of editor
        if (firstPart.type === "plain" && firstPart.text.startsWith("\\/")) {
            model = model.clone();
            model.removeText({index: 0, offset: 0}, 1);
        }
    }
    return model;
}
