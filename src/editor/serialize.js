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
import katex from 'katex';
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

// TODO: collate with actual emojis somehow
function emojify(name) {
    switch(name) {
        case "markchamp": 
            return "mxc://typ3.tech/HqGFPAwmDOfLtlRNrdiajlQq";
        case "forkyou":
            return "mxc://typ3.tech/NjrJKwtQERogKRQqsLDcUBEA";
        case "666":
            return "mxc://typ3.tech/qceNXxqhMkrPRqSqbWLkaLDm";
        case "zoom-eyes":
            return "mxc://typ3.tech/cuWvHgURiYyPxRezAJLAnwiB";
        case "rip":
            return "mxc://typ3.tech/gdELiyxcqEksxVEGlXYBiSWs";
        case "neutralandroid":
            return "mxc://typ3.tech/OwpmniSTDAKFASHqQrYbJAqs";
        case "senpaineutral":
            return "mxc://typ3.tech/ASWDxAnsWBbnsngnzKFpryYp";
        case "thinkingchief":
            return "mxc://typ3.tech/ADdxzZiJJMJEnOyPvzpvGsLd";
        case "thinkingdeusvult":
            return "mxc://typ3.tech/biPDzxqUxHQNwPMCXncmXSNb";
        case "thinkingdrops":
            return "mxc://typ3.tech/hQVZeDyvTkCrpbwYqmpUrItw";
        case "thinkingeggplant":
            return "mxc://typ3.tech/evLBGumbhUEvmEoyLqBXLhVC";
        case "thinkingferrous":
            return "mxc://typ3.tech/IrVOHgccLMWFjjlZpgFGVZtr";
        case "thinkinggun":
            return "mxc://typ3.tech/HLdRAPrNGXQWbRTeDAhlJfmb";
        case "thinkinggun2":
            return "mxc://typ3.tech/zlnyBMETtUGOEpbGVVjycYmR";
        case "thinkinglenny":
            return "mxc://typ3.tech/LzBxmfjNWJbQriaUqSIPTIcr";
        case "thinkingmeta":
            return "mxc://typ3.tech/TDnixjPRMGpfGIYkykKQXiRO";
        case "thinkingnoose":
            return "mxc://typ3.tech/xJkfyGSVdVICEwernczDWUco";
        case "thinkingok":
            return "mxc://typ3.tech/UMWNcrJCETzDyEKBBozsiRCn";
        case "thinkingpixel":
            return "mxc://typ3.tech/PdvFExWcFYbUqesolHUssgTJ";
        case "thinkingrage":
            return "mxc://typ3.tech/OqjfucUmhmuZWOXuipzlPlSI";
        case "thinkingsatchel":
            return "mxc://typ3.tech/PSGjQmJEOylNsfyPGoahgjUh";
        case "thinkingscratch":
            return "mxc://typ3.tech/PSFFsqGGkxJXLxLZgfFkImTQ";
        case "thinkingshrug":
            return "mxc://typ3.tech/zrboRNATrHWiMzXekCOYVnzB";
        case "thinkingsmile":
            return "mxc://typ3.tech/ErKlbesQRAlmvgMJCigzOMIa";
        case "thinkingsmug":
            return "mxc://typ3.tech/AZOfOtyTfGsJMzKJJskfLHSM";
        case "thinkingspinner":
            return "mxc://typ3.tech/mGQFIRibzFwYRMvsqMVnPSkl";
        case "thinkingalien":
            return "mxc://typ3.tech/rosoXBJwMUoAUNcOvdUCcNbU";
        case "thinkingandroid":
            return "mxc://typ3.tech/ADDzJhzyRqzsZEUZaJDTlHqM";
        case "thinkingbugeye":
            return "mxc://typ3.tech/OJAiuknktYFXkurVIxCGQnzv";
        case "thinkingcat":
            return "mxc://typ3.tech/EdPAlvKkAGwrNwHWpSMkfEOY";
        case "thinkingcloud":
            return "mxc://typ3.tech/KAGhemdIzQLRQLLdswuKPTUO";
        case "no-u":
            return "mxc://typ3.tech/qdhTAqsRqpbQgRJKdpYYrmZX";
        case "whomst":
            return "mxc://typ3.tech/jGlWUdjThEWDhHQsvWINBOmn";
        case "rpi":
            return "mxc://typ3.tech/fKwIExHbitoRyYyaGcMKutxQ";
        case "hungy":
            return "mxc://riot.firechicken.net/lZIBSAhTiJYdraAhXQKktEIO";
        default:
            return null;
    }
}

export function htmlSerializeIfNeeded(model, {forceHTML = false} = {}) {
    var md = mdSerialize(model);

    var chunks = md.split("$$");
    // Check if there's enough $$ to actually do something
    if (chunks.length > 2) {
        // Go through all the odd numbered chunks
        // These are the ones in the interiors of the $$s
        for (var i=1; i<chunks.length; i+=2) {
            // Render each chunk with katex
            chunks[i] = katex.renderToString(chunks[i], {throwOnError: false, output: "html"});
        }
        md = chunks.join('');
    }


    let parsed = marked(md);
    // This doesn't have the <p> tag or anything at the end
    // Useful for checking for noops
    // const parsedInline = marked.parseInline(md);
    // Turns out it doesn't render quotes or lists though fml

    //Trim out the trailing newline
    parsed = parsed.slice(0,-1);
    
    //Trim out the <p> tags that surround text messages
    //These fuck up the display of emojis
    if (parsed.startsWith("<p>") && parsed.endsWith("</p>")) {
        parsed = parsed.slice(3).slice(0,-4);
    }

    //Now, turn all emoji :blocks: into emojis
    chunks = parsed.split(" ");

    for(var i=0; i<chunks.length; i++) {
        // If there's a space it's not an emoji block
        // and make sure it starts and ends with a :
        if (!chunks[i].includes(" ") && chunks[i].startsWith(":") && chunks[i].endsWith(":")) {
            // trim out those ':'s
            var t = chunks[i].slice(1,-1);
            if (emojify(t) !== null) {
                chunks[i] = "<img src=\"" + emojify(t) + "\" alt=\":" + t + ":\" title=\":" + t + ":\" height=32 />"
            }
        }
    }
    parsed = chunks.join(" ");

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
