import './_snowpack/pkg/bootstrap';
import './_snowpack/pkg/bootstrap/dist/css/bootstrap.min.css.proxy.js';
import axios from './_snowpack/pkg/axios';
import prettyBytes from './_snowpack/pkg/pretty-bytes.js';
import setupEditors from './setupEditor.js';


const form = document.querySelector('[data-form]');
const queryParamsContainer = document.querySelector('[data-query-params]');
const requestHeadersContainer = document.querySelector('[data-request-headers]');
const keyValueTemplate = document.querySelector('[data-key-value-template]');
// Add button for query
const addKeyValueQuerybtn = document.querySelector('[data-add-query-param-btn]');

// Add button for Headers
const addKeyValueHeadersbtn = document.querySelector('[data-add-request-header-btn]');

const responseHeaderContainer = document.querySelector('[data-response-headers]');

// Appending the template
addKeyValueQuerybtn.addEventListener('click', () => {

    queryParamsContainer.append(createKeyValuePair());

});

addKeyValueHeadersbtn.addEventListener('click', () => {

    requestHeadersContainer.append(createKeyValuePair());

});

queryParamsContainer.append(createKeyValuePair())
requestHeadersContainer.append(createKeyValuePair())


axios.interceptors.request.use(request => {
    request.customData = request.customData || {};
    request.customData.startTime = new Date().getTime();
    return request;
})

function updateEndTime(response) {
    response.customData = response.customData || {};
    response.customData.time = new Date().getTime() - response.config.customData.startTime;
    return response;
}
axios.interceptors.response.use(updateEndTime, e => {
    return Promise.reject(updateEndTime(e.response));
})


const { requestEditor, updateResponseEditor } = setupEditors()
// handling the form data
form.addEventListener('submit', e => {
    e.preventDefault();

    let data;
    try {
        data = JSON.parse(requestEditor.state.doc.toString() || null);
    } catch (error) {
        alert('Json data is malformed');
        return;
    }

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-method]').value,
        params: keyValuePairsToObject(queryParamsContainer),
        headers: keyValuePairsToObject(requestHeadersContainer),
        data
    })
        .catch(err => err)
        .then(response => {
            // displaying the response
            document.querySelector('[data-response-section]').classList.remove('d-none');
            // Update the Response details, Body, and Headers

            updateResponseDetails(response);
            updateResponseEditor(response.data);
            updateResponseHeaders(response.headers);

            console.log(response)

        })
})

function updateResponseDetails(response) {
    document.querySelector('[data-status]').textContent = response.status;
    document.querySelector('[data-time]').textContent = response.customData.time;
    document.querySelector('[data-size]').textContent = prettyBytes(JSON.stringify(response.data).length + JSON.stringify(response.headers).length)
}

function updateResponseHeaders(headers) {
    responseHeaderContainer.innerHTML = "";

    for (let key in headers) {
        const keyElement = document.createElement('div');
        keyElement.textContent = key;
        responseHeaderContainer.append(keyElement);

        const valueElement = document.createElement('div');
        valueElement.textContent = headers[key];
        responseHeaderContainer.append(valueElement);
    }
}

function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true);
    const removeBtn = element.querySelector('[data-remove-btn]');

    removeBtn.addEventListener('click', (e) => {

        e.target.closest('[data-key-value-pair]').remove();
    })

    return element;

}

function keyValuePairsToObject(container) {
    const pairs = container.querySelectorAll('[data-key-value-pair]');
    return [...pairs].reduce((data, pair) => {
        const key = pair.querySelector('[data-key]').value;
        const value = pair.querySelector('[data-value]').value;

        if (key === '') return data;
        // if key exists append to data object
        return { ...data, [key]: value };
    }, {});
}
