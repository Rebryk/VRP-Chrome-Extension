var MAX_STORAGE_BYTES = 1024;

document.arrive(".im_msg_audiomsg", function(newElem) {
    var messageId = newElem.id;
    console.log(messageId);

    var iconAndText = document.createElement("div");
    var loadingIcon = document.createElement("div");
    loadingIcon.className = "loader";

    iconAndText.appendChild(loadingIcon);
    iconAndText.appendChild(document.createTextNode("parsing..."));
    newElem.appendChild(iconAndText);

    console.log('voice');
    console.log(this);
});

