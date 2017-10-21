var MAX_STORAGE_BYTES = 1024;

document.arrive(".im_msg_audiomsg", {existing: true}, function() {
    var messageId = this.id;
    var voiceUrl = this.getElementsByClassName("audio-msg-track")[0].getAttribute('data-ogg');

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
    
    chrome.storage.local.get(messageId, function (storedMessage) {
        if (Object.keys(storedMessage).length !== 0) {
            console.log("Found " + storedMessage);
            showResult(storedMessage[messageId]);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('post', 'https://vrp.eu.ngrok.io/recognize', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showResult(xhr.responseText);
                    console.log(messageId);
                    var objToSave = {};
                    objToSave[messageId] = xhr.responseText;
                    chrome.storage.local.set(objToSave);
                } else {
                    showResult('Проблемы с соединением. Попробуйте перезагрузить страницу.', true);
                }
            };
            xhr.send('{"url": "' + voiceUrl + '"}');
        }
    });
});