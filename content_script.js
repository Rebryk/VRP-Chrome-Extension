var CACHE_SIZE = 100; // maximum stored voices

function storeInCache(key, val) {
    chrome.storage.local.set({key: val});
    // TODO: limit cache size
}

function retrieveFromCache(key, callback) {
    chrome.storage.local.get(key, function(res) {callback(res[key]);});
}

document.arrive(".im_msg_audiomsg", {existing: true}, function() {
    var messageId = this.id;
    var voiceUrl = this.getElementsByClassName("audio-msg-track")[0].getAttribute('data-ogg');
    
    console.log('Message id is ' + messageId);
    console.log('Voice url is ' + voiceUrl);

    var iconAndText = document.createElement("div");
    var loadingIcon = document.createElement("div");
    loadingIcon.className = "loader";
    var textNode = document.createElement("span");
    textNode.className = "loading_text";
    textNode.appendChild(document.createTextNode("Войс обрабатывается. Подождите..."));
    console.log(messageId);
    iconAndText.appendChild(loadingIcon);
    iconAndText.appendChild(textNode);
    this.appendChild(iconAndText);
    
    function showResult(resultText, isError) {
        loadingIcon.remove();
        textNode.innerHTML = '';
        textNode.appendChild(document.createTextNode(resultText));
        if (isError) {
            textNode.className = "error_text";
        }
    }
    
    retrieveFromCache(messageId, function (storedMessage) {
        console.log('storedMessage is ' + storedMessage);
        if (storedMessage) {
            console.log('Found ' + storedMessage + ' in cache');
            showResult(storedMessage);
        } else {
            console.log('Not found. Sending request.')
            var xhr = new XMLHttpRequest();
            xhr.open('post', 'https://vrp.eu.ngrok.io/recognize', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showResult(xhr.responseText);
                    storeInCache(messageId, xhr.responseText);
                } else {
                    showResult('Проблемы с соединением. Попробуйте перезагрузить страницу.', true);
                }
            };
            xhr.send('{"url": "' + voiceUrl + '"}');
        }
    });
});