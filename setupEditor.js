import { EditorState, basicSetup } from "./_snowpack/pkg/@codemirror/basic-setup.js";
import { defaultTabBinding } from "./_snowpack/pkg/@codemirror/commands.js";
import { json } from "./_snowpack/pkg/@codemirror/lang-json.js";
import { EditorView, keymap } from "./_snowpack/pkg/@codemirror/view.js";

export default function setupEditor() {

    const jsonRequestBody = document.querySelector('[data-json-request-body]');

    const jsonResponseBody = document.querySelector('[data-json-response-body]');


    const basicExtensions = [
        basicSetup,
        keymap.of([defaultTabBinding]),
        json(),
        EditorState.tabSize.of(2)
    ]


    // Creating request editor
    const requestEditor = new EditorView({
        state: EditorState.create({
            doc: "{\n\t\n}",
            extensions: basicExtensions
        }),
        parent: jsonRequestBody
    })

    // Creating response editor
    const responseEditor = new EditorView({
        state: EditorState.create({
            doc: "{}",
            extensions: [...basicExtensions, EditorView.editable.of(false)],
        }),
        parent: jsonResponseBody
    })

    function updateResponseEditor(value) {
        responseEditor.dispatch({
            changes: {
                from: 0,
                to: responseEditor.state.doc.length,
                insert: JSON.stringify(value, null, 2)
            },
        })
    }

    return { requestEditor, updateResponseEditor }
}