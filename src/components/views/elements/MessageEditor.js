/*
Copyright 2019 New Vector Ltd

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
import React from 'react';
import sdk from '../../../index';
import {_t} from '../../../languageHandler';
import PropTypes from 'prop-types';
import dis from '../../../dispatcher';
import EditorModel from '../../../editor/model';
import {setCaretPosition} from '../../../editor/caret';
import {getCaretOffsetAndText} from '../../../editor/dom';
import {htmlSerialize, textSerialize, requiresHtml} from '../../../editor/serialize';
import {parseEvent} from '../../../editor/deserialize';
import Autocomplete from '../rooms/Autocomplete';
import {PartCreator} from '../../../editor/parts';
import {renderModel} from '../../../editor/render';
import {MatrixEvent, MatrixClient} from 'matrix-js-sdk';

export default class MessageEditor extends React.Component {
    static propTypes = {
        // the message event being edited
        event: PropTypes.instanceOf(MatrixEvent).isRequired,
    };

    static contextTypes = {
        matrixClient: PropTypes.instanceOf(MatrixClient).isRequired,
    };

    constructor(props, context) {
        super(props, context);
        const partCreator = new PartCreator(
            () => this._autocompleteRef,
            query => this.setState({query}),
        );
        this.model = new EditorModel(
            parseEvent(this.props.event),
            partCreator,
            this._updateEditorState,
        );
        const room = this.context.matrixClient.getRoom(this.props.event.getRoomId());
        this.state = {
            autoComplete: null,
            room,
        };
        this._editorRef = null;
        this._autocompleteRef = null;
    }

    _updateEditorState = (caret) => {
        renderModel(this._editorRef, this.model);
        if (caret) {
            try {
                setCaretPosition(this._editorRef, this.model, caret);
            } catch (err) {
                console.error(err);
            }
        }
        this.setState({autoComplete: this.model.autoComplete});
    }

    _onInput = (event) => {
        const sel = document.getSelection();
        const {caret, text} = getCaretOffsetAndText(this._editorRef, sel);
        this.model.update(text, event.inputType, caret);
    }

    _onKeyDown = (event) => {
        if (event.metaKey || event.altKey || event.shiftKey) {
            return;
        }
        if (!this.model.autoComplete) {
            return;
        }
        const autoComplete = this.model.autoComplete;
        switch (event.key) {
            case "Enter":
                autoComplete.onEnter(event); break;
            case "ArrowUp":
                autoComplete.onUpArrow(event); break;
            case "ArrowDown":
                autoComplete.onDownArrow(event); break;
            case "Tab":
                autoComplete.onTab(event); break;
            case "Escape":
                autoComplete.onEscape(event); break;
            default:
                return; // don't preventDefault on anything else
        }
        event.preventDefault();
    }

    _onCancelClicked = () => {
        dis.dispatch({action: "edit_event", event: null});
    }

    _onSaveClicked = () => {
        const newContent = {
            "msgtype": "m.text",
            "body": textSerialize(this.model),
        };
        if (requiresHtml(this.model)) {
            newContent.format = "org.matrix.custom.html";
            newContent.formatted_body = htmlSerialize(this.model);
        }
        const content = Object.assign({
            "m.new_content": newContent,
            "m.relates_to": {
                "rel_type": "m.replace",
                "event_id": this.props.event.getId(),
            },
        }, newContent);

        const roomId = this.props.event.getRoomId();
        this.context.matrixClient.sendMessage(roomId, content);

        dis.dispatch({action: "edit_event", event: null});
    }

    _onAutoCompleteConfirm = (completion) => {
        this.model.autoComplete.onComponentConfirm(completion);
    }

    _onAutoCompleteSelectionChange = (completion) => {
        this.model.autoComplete.onComponentSelectionChange(completion);
    }

    componentDidMount() {
        this._updateEditorState();
    }

    render() {
        let autoComplete;
        if (this.state.autoComplete) {
            const query = this.state.query;
            const queryLen = query.length;
            autoComplete = <div className="mx_MessageEditor_AutoCompleteWrapper">
                <Autocomplete
                    ref={ref => this._autocompleteRef = ref}
                    query={query}
                    onConfirm={this._onAutoCompleteConfirm}
                    onSelectionChange={this._onAutoCompleteSelectionChange}
                    selection={{beginning: true, end: queryLen, start: queryLen}}
                    room={this.state.room}
                />
            </div>;
        }
        const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
        return <div className="mx_MessageEditor">
                { autoComplete }
                <div
                    className="mx_MessageEditor_editor"
                    contentEditable="true"
                    tabIndex="1"
                    onInput={this._onInput}
                    onKeyDown={this._onKeyDown}
                    ref={ref => this._editorRef = ref}
                ></div>
                <div className="mx_MessageEditor_buttons">
                    <AccessibleButton kind="secondary" onClick={this._onCancelClicked}>{_t("Cancel")}</AccessibleButton>
                    <AccessibleButton kind="primary" onClick={this._onSaveClicked}>{_t("Save")}</AccessibleButton>
                </div>
            </div>;
    }
}