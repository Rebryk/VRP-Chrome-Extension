var CACHE_SIZE = 100; // maximum stored voices
var chstorage = chrome.storage.local; // or sync
//chstorage.clear();
var query = [];

chstorage.get('query', function(res) {
    query = res.query === undefined ? [] : res.query;
});

function storeInCache(key, val) {
    //console.log('Found query size is ' + res.query.length);
    if (!(val in query)) query.push(val);
    if (query.length > CACHE_SIZE) {
        console.log('Cache is exceeded. Removing oldest element');
        expiredKey = query.shift();
        console.log('Removing ' + expiredKey);
        chstorage.remove([expiredKey], function() {
            var error = chrome.runtime.lastError;
            if (error) console.error(error);
        });
    }
    var obj = {};
    obj[key] = val;
    chstorage.set(obj);
    
    // updating query
    obj = {};
    obj['query'] = query;
    chstorage.set(obj);
    console.log('saving query with len ' + query.length);
    console.log(obj);
}

function retrieveFromCache(key, callback) {
    chstorage.get(key, function(res) {
        console.log('retrieved value for key ' + key);
        callback(res[key]);
    });
}

document.arrive(".im_msg_audiomsg", {existing: true}, function() {
    //this.style = "background-color: red;";
    var messageId = this.id;
    var voiceUrl = this.getElementsByClassName("audio-msg-track")[0].getAttribute('data-mp3');
    
    console.log('Message id is ' + messageId);
    console.log('Voice url is ' + voiceUrl);

    // GUI
    var loadingIcon;
    var textNode;
    if (this.getElementsByClassName("loading_text").length === 0) {
        var iconAndText = document.createElement("div");
        loadingIcon = document.createElement("div");
        loadingIcon.className = "loading_icon";
        textNode = document.createElement("span");
        textNode.className = "loading_text";
        textNode.appendChild(document.createTextNode("Войс обрабатывается. Подождите..."));
        console.log(messageId);
        iconAndText.appendChild(loadingIcon);
        iconAndText.appendChild(textNode);
        this.appendChild(iconAndText);
    } else {
        loadingIcon = this.getElementsByClassName("loading_icon")[0];
        loadingIcon.removeAttribute("hidden");
        textNode = this.getElementsByClassName("loading_text")[0];
    }
    
    function showResult(resultText, isError) {
        loadingIcon.hidden = "hidden";
        textNode.innerHTML = '';
        textNode.appendChild(document.createTextNode(resultText));
        textNode.className = isError ? "loading_text error_text" : "loading_text";
    }
    
    retrieveFromCache(messageId, function (storedMessage) {
        if (storedMessage) {
            console.log(messageId + ' is found in cache');
            showResult(storedMessage, false);
        } else {
            console.log(messageId + ' is not found in cache. Sending request.')
            var xhr = new XMLHttpRequest();
            xhr.open('post', 'https://vrp.eu.ngrok.io/recognize', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showResult(xhr.responseText, false);
                    storeInCache(messageId, xhr.responseText);
                    if (document.hidden) {
                        new Notification('Распознавание голоса', {
                            icon: '48.png',
                            body: xhr.responseText
                        });
                    }
                } else {
                    var errorDesc = xhr.status === 400 || xhr.status === 503 ? xhr.responseText : 'сервер недоступен';
                    showResult('Ошибка на сервере (' + errorDesc + '). Попробуйте перезагрузить страницу.', true);
                }
            };
            xhr.send('{"url": "' + voiceUrl + '"}');
        }
    });
});