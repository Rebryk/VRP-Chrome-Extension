var MAX_STORAGE_BYTES = 1024;

document.arrive(".im_msg_audiomsg", {existing: true}, function() {
    console.log('voice');
    console.log(this);

    var messageId = this.id;
    console.log(messageId);

    var iconAndText = document.createElement("div");
    var loadingIcon = document.createElement("div");
    loadingIcon.className = "loader";

    iconAndText.appendChild(loadingIcon);
    iconAndText.appendChild(document.createTextNode("parsing..."));
    this.appendChild(iconAndText);

	var trackNode = this.getElementsByClassName("audio-msg-track")[0]
	//this.appendChild(document.createTextNode(trackNode.getAttribute('data-ogg')));
});

