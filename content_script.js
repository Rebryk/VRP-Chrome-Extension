var MAX_STORAGE_BYTES = 1024;

document.arrive(".im_msg_audiomsg", {existing: true}, function() {
    var messageId = this.id;

    var iconAndText = document.createElement("div");
    var loadingIcon = document.createElement("div");
    loadingIcon.className = "loader";
	var text = document.createElement("span");
	text.className = "loading_text";
	text.appendChild(document.createTextNode("Войс обрабатывается. Подождите..."));
	console.log(messageId);
	iconAndText.appendChild(loadingIcon);
    iconAndText.appendChild(text);
    this.appendChild(iconAndText);
	var that = this;
    chrome.storage.local.get(messageId, function (storedMessage) {
    	if (Object.keys(storedMessage).length !== 0) {
			console.log("Found " + storedMessage);
            loadingIcon.remove();
            text.innerHTML = '';
            text.appendChild(document.createTextNode(storedMessage[messageId]));
        } else {
            var trackNode = that.getElementsByClassName("audio-msg-track")[0];
            var voiceUrl = trackNode.getAttribute('data-ogg');

            var xhr = new XMLHttpRequest();
            xhr.open('post', 'https://vrp.eu.ngrok.io/recognize', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            var so = that;
            // send the collected data as JSON
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    //so.appendChild(document.createTextNode(xhr.responseText));
                    loadingIcon.remove();
                    text.innerHTML = '';
                    text.appendChild(document.createTextNode(xhr.responseText));
                    console.log(messageId);
                    var objToSave = {};
                    objToSave[messageId] = xhr.responseText;
                    chrome.storage.local.set(objToSave);
                }
            };

            xhr.send('{"url": "' + voiceUrl + '"}');
        }
    });

	//xhr.onloadend = function () {
	//	this.appendChild(document.createTextNode(xhr.responseText));
	//};
});