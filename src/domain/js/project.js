var localProfile = {},
    currentPanel = "start",
    currentProcess = null,
    langArray = [],
    langlevelArray = [],
    adRotationPtr = 0,
    refreshIntervalAd = null,
    refreshIntervalID = null,
    refreshIntervalNetSpeed = null,
    maxChimes = 5,
    numberOfChimes = 0,
    audioContext = null,
    sound = null,
    soundSource = null,
    drop = document.getElementById('modal-share-stuff-drop'),
    findResultsList = document.querySelector("#modal-find-results-list-section"),
    shareStuffList = document.querySelector("#modal-share-stuff-list-section");


isInvitedPeer = getParameter("invite");

document.querySelector('#modal-share-stuff-fileBox').addEventListener('change', handleFileSelect, false);

var nicknameEntry = document.querySelector("#start-nickname");
nicknameEntry.onkeyup = function(evt) {
    var tempNickname = document.querySelector("#start-nickname").value.trim();
    if(tempNickname.length > 0) {
        document.querySelector("#start-txt-button-next").disabled = false;
        document.querySelector("#start-video-button-next").disabled = false;
        document.querySelector("#connection-local-nickname").value = document.querySelector("#start-nickname").value;
    } else {
        document.querySelector("#start-txt-button-next").disabled = true;
        document.querySelector("#start-video-button-next").disabled = true;
    }
};

function getParameter(name, url) {
    if(!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if(!results) return null;
    if(!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function handleFileSelect(evt) {
console.log(">>> handleFileSelect");
    var files = evt.target.files;
    readChosenFiles(files);
}

window.addEventListener("dragover", function(e) {
    e = e || event;
    e.preventDefault();
}, false);

window.addEventListener("drop", function(e) {
    e = e || event;
    e.preventDefault();
}, false);

function addEventHandler(obj, evt, handler) {
    if(obj.addEventListener) {
        obj.addEventListener(evt, handler, false);
    } else {
        obj["on" + evt] = handler;
    }
}

if(window.FileReader) {
    addEventHandler(window, 'load', function () {
        function cancel(e) {
            if(e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }

        // Tells the browser that we *can* drop on this target
        addEventHandler(drop, 'dragover', cancel);
        addEventHandler(drop, 'dragenter', cancel);

        addEventHandler(drop, 'drop', function(e) {
            e = e || window.event;
            if(e.preventDefault) {
                e.preventDefault();
            }

            var dt = e.dataTransfer;
            var files = dt.files;
            readChosenFiles(files);
            return false;
        });
        Function.prototype.bindToEventHandler = function bindToEventHandler() {
            var handler = this;
            var boundParameters = Array.prototype.slice.call(arguments);
            //create closure
            return function(e) {
                e = e || window.event;
                boundParameters.unshift(e);
                handler.apply(this, boundParameters);
            };
        };
    });
}

function readChosenFiles(files) {
    for(var i = 0; i < files.length; i++) {
        var file = files[i];
        buildShareStuffList(file, false);
        shareStuffTransferPrep(file);
    }
}

function buildShareStuffList(file, canDownload) {
    var reader = new FileReader();
    var dynaToken = randomToken();
    reader.readAsDataURL(file);
    addEventHandler(reader, 'loadend', function(e, file) {
        var bin = this.result;

        var tileWrap = document.createElement('div');
        tileWrap.className = "tile-wrap";

        var tileCollapse = document.createElement('div');
        tileCollapse.className = "tile tile-collapse";

        var tileToggle = document.createElement('div');
        tileToggle.className = "tile-toggle";
        var dataParent = document.createAttribute('data-parent');
        dataParent.value = ".content";
        tileToggle.setAttributeNode(dataParent);
        var dataTarget = document.createAttribute('data-target');
        dataTarget.value = "#tile-collapse-" + dynaToken;
        tileToggle.setAttributeNode(dataTarget);
        var dataToggle = document.createAttribute('data-toggle');
        dataToggle.value = "tile";
        tileToggle.setAttributeNode(dataToggle);

        var tileSide = document.createElement('div');
        tileSide.className = "tile-side";

        var fileSide = document.createElement('div');
        fileSide.style.width = "100%";
        var fileCont = document.createElement('div');
        fileCont.className = "modal-share-stuff-fileCont";
        var fileContAlign = document.createAttribute('align');
        fileContAlign.value = "center";
        fileCont.setAttributeNode(fileContAlign);
        fileSide.insertBefore(fileCont, fileSide.firstChild);

        var fileIcon = document.createElement('i');
        fileIcon.innerHTML = "insert_drive_file";
        fileIcon.className = "modal-share-stuff-thumb material-icons";
        fileCont.appendChild(fileIcon);

        var newFile = document.createElement('div');
        newFile.innerHTML = file.name;
        newFile.className = "modal-share-stuff-fileName";
        fileCont.appendChild(newFile);
        
        var fileSize = document.createElement('div');
        fileSize.className = "modal-share-stuff-fileSize";
        fileSize.innerHTML = Math.round(file.size/1024) + ' KB';
        fileCont.appendChild(fileSize);
        
        var progress = document.createElement('div');
        progress.className = "modal-share-stuff-progress";
        progress.innerHTML = '<div aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" class="modal-share-stuff-progress-bar modal-share-stuff-progress-bar-success" role="progressbar" style="width: 100%"></div>';
        fileCont.appendChild(progress);
            tileSide.appendChild(fileSide);

        var tileActiveShow = document.createElement('div');
        tileActiveShow.setAttribute("id", "tile-collapse-" + dynaToken);
        tileActiveShow.className = "tile-active-show tile-active-show-still collapse";

        var tileSub = document.createElement('div');
        tileSub.className = "tile-sub";


        var stuffObject = null;
        var stuffObjectType = determineObjectType(file.name);
        stuffObject = document.createElement(stuffObjectType);
        if(stuffObjectType == "img") {
            fileIcon.innerHTML = "image";
            stuffObject.file = file;
            stuffObject.src = e.target.result;
        } else if(stuffObjectType == "object") {
            stuffObject.width = "600";
            stuffObject.height = "800";
            var ext = determineObjectExtension((file.name).toLowerCase());
            if(ext == "doc") stuffObject.type = "application/msword";
            if(ext == "docx") stuffObject.type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if(ext == "xls") stuffObject.type = "application/vnd.ms-excel";
            if(ext == "xlsx") stuffObject.type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            if(ext == "ppt") stuffObject.type = "application/vnd.ms-powerpoint";
            if(ext == "csv") stuffObject.type = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            if(ext == "pptx") stuffObject.type = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            if(ext == "pdf") stuffObject.type = "application/pdf";
            stuffObject.data = window.URL.createObjectURL(file);
        } else if(stuffObjectType == "audio") {
            fileIcon.innerHTML = "music_note";
            stuffObject.src = window.URL.createObjectURL(file);
            stuffObject.preload = "auto";
            stuffObject.controls = "controls";
            stuffObject.autoplay = false;
        } else if(stuffObjectType == "video") {
            fileIcon.innerHTML = "ondemand_video";
            stuffObject.src = window.URL.createObjectURL(file);
            stuffObject.width = "600";
            stuffObject.height = "400";
            stuffObject.preload = "auto";
            stuffObject.controls = "controls";
            stuffObject.autobuffer = true;
            stuffObject.autoplay = false;
        } else {
            // ********* PREVIEW NOT AVAILABLE *********
        }


        tileSub.appendChild(stuffObject);
        tileActiveShow.appendChild(tileSub);

        var tileFooter = document.createElement('div');
        tileFooter.className = "tile-footer";

        var tileFooterNav = document.createElement('ul');
        tileFooterNav.className = "nav nav-list pull-left";

        if(canDownload) {
            var tileFooterListItem1 = document.createElement('li');
            var tileFooterListItem1Anchor = document.createElement('a');
            tileFooterListItem1Anchor.setAttribute("href", window.URL.createObjectURL(file));
            tileFooterListItem1Anchor.setAttribute("download", file.name);
            var tileFooterListItem1AnchorSpan = document.createElement('span');
            tileFooterListItem1AnchorSpan.className = "icon icon-check";
            tileFooterListItem1AnchorSpan.innerHTML = "&nbsp;";
            tileFooterListItem1Anchor.innerText = "Download";

            tileFooterListItem1Anchor.insertBefore(tileFooterListItem1AnchorSpan, tileFooterListItem1Anchor.firstChild);
            tileFooterListItem1.appendChild(tileFooterListItem1Anchor);
            tileFooterNav.appendChild(tileFooterListItem1);
        }

        var tileFooterListItem2 = document.createElement('li');
        var tileFooterListItem2Anchor = document.createElement('a');
        var dataDismiss = document.createAttribute('data-dismiss');
        dataDismiss.value = "tile";
        tileFooterListItem2Anchor.setAttributeNode(dataDismiss);
        tileFooterListItem2Anchor.setAttribute("href", "#");
        var tileFooterListItem2AnchorSpan = document.createElement('span');
        tileFooterListItem2AnchorSpan.className = "icon icon-close";
        tileFooterListItem2AnchorSpan.innerHTML = "&nbsp;";
        tileFooterListItem2Anchor.innerText = "Close";

        tileFooterListItem2Anchor.insertBefore(tileFooterListItem2AnchorSpan, tileFooterListItem2Anchor.firstChild);
        tileFooterListItem2.appendChild(tileFooterListItem2Anchor);
        tileFooterNav.appendChild(tileFooterListItem2);

        tileFooter.appendChild(tileFooterNav);

        tileActiveShow.appendChild(tileSub);
        tileActiveShow.appendChild(tileFooter);

        tileToggle.appendChild(tileSide);

        tileCollapse.appendChild(tileToggle);
        tileCollapse.appendChild(tileActiveShow);

        tileWrap.appendChild(tileCollapse);

        shareStuffList.insertBefore(tileWrap, shareStuffList.firstChild);

    }.bindToEventHandler(file));
}



$(document).ready(function() {

    $('#header-menu-hamburger').click(function() {
        if($('#tc_section').is(":visible")) $('#tc').click();
        if($('#pp_section').is(":visible")) $('#pp').click();
    });

    $('#langde').click(function() {
        languageCode = "de";
        localProfile.languageCode = languageCode;
        saveLocalProfile();
        establishContextLanguage();
    });

    $('#langen').click(function() {
        languageCode = "en";
        localProfile.languageCode = languageCode;
        saveLocalProfile();
        establishContextLanguage();
    });

    $('#langfr').click(function() {
        languageCode = "fr";
        localProfile.languageCode = languageCode;
        saveLocalProfile();
        establishContextLanguage();
    });

    $('#langsp').click(function() {
        languageCode = "sp";
        localProfile.languageCode = languageCode;
        saveLocalProfile();
        establishContextLanguage();
    });

    $('#menu-about').click(function() {
        document.querySelector("#connection-modal-about").click();
    });

    $('#menu-helpful-tips').click(function() {
        document.querySelector("#connection-modal-helpful-tips").click();
    });

    $('#start-txt-button-next').click(function() {
        startTxtJump();
    });

    $('#start-video-button-next').click(function() {
        startVideoJump();
    });

    $('#menu-link-clear-profile-settings').click(function() {
        clearSettings();
        wipeClean();
        nextCard("start");
        closeSettingsAside();
    });

    $('#menu-link-exit').click(function() {
        closeSettingsAside();
        if(null !== socket && null !== room) socket.emit("exit room", localProfile.nickname, room);
        wipeClean();
        nextCard("start");
    });
 
    $('#profile-link-snapshot').click(function() {
        takeSnapshot();
    });

    $('#profile-button-save').click(function() {
        var isProfileComplete = checkMinimalProfile();
        if(isProfileComplete) {
            nextCard("connection");
        }
    });

    $('#connection-button-available').click(function() {
        connectToNetwork();
    });

    $('#connection-button-presence').click(function() {
        if(isRemoteConnected) {
            //localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
            localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
            if(document.querySelector("#connection-button-presence").innerText.toLowerCase() == contextLanguageSettings.mediapause.toLowerCase()) {
                document.querySelector("#connection-button-presence").innerText = contextLanguageSettings.mediaresume;
                remotePause("pause", false);
            } else {
                document.querySelector("#connection-button-presence").innerText = contextLanguageSettings.mediapause;
                remotePause("resume", false);
            }
        } else {
            $('#connection-button-disconnect').click();
            document.querySelector("#connection-button-presence").innerText = contextLanguageSettings.unavailable;
        }
    });

    $('#connection-button-disconnect').click(function() {
        isRemoteHangup = true;
        disconnectFromNetwork();
    });

    $('#connection-button-find-peers').click(function() {
        findVideoFriends();
    });

    $('#connection-button-invite-peer').click(function() {
        inviteVideoFriend();
    });

    $('#modal-button-check-media-permission').click(function() {
        checkMediaPermissions();
    });

    $('#modal-available-peers-link-dismiss').click(function() {
        isJoinRequestDeclined = true;
        dismissPeerConnectionRequest(false);
    });

    $('#modal-button-call-available-peer').click(function() {
        callToPeer();
    });

    $('#modal-button-hangup-available-peer').click(function() {
        dismissPeerConnectionRequest(true);
    });

    $('#modal-chat-request-button-accept').click(function() {
        acceptRequestingPeer(true);
    });

    $('#modal-chat-request-link-dismiss').click(function() {
        acceptRequestingPeer(false);
    });

    $('#modal-chat-request-button-decline').click(function() {
        acceptRequestingPeer(false);
    });

    $('#invite-peer-copy').click(function() {
        var copyTarget = document.querySelector("#invite-peer-link").dataset.copytarget;
        document.querySelector("#invite-peer-link").select();
        try {
            document.execCommand("copy");
            document.querySelector("#invite-peer-link-copy-msg").innerHTML = "link copied";
            $("#invite-peer-link-copy-msg").stop().fadeIn(400).delay(1200).fadeOut(400);
        } catch(err) {
            alert("Please press Ctrl/Cmd+C to copy");
        }
    });

    $('#footer-button-launch-text-chat').click(function() {
        document.querySelector("#connection-modal-launch-text-chat").click();
        var textChat = {};
        textChat.action = "open text chat";
        dataChannel.send(JSON.stringify(textChat));
    });

    $("#modal-text-chat-message").keyup(function(evt) {
        if(evt.keyCode == 13) sendLocalChatMessage();
    });

    $('#modal-text-chat-send-button').click(function() {
        sendLocalChatMessage();
    });

    $('#modal-text-chat-link-dismiss').click(function() {
        if(isRemoteModalDismiss) {
            isRemoteModalDismiss = false;
        } else {
            var textChat = {};
            textChat.action = "close text chat";
            dataChannel.send(JSON.stringify(textChat));
        }
    });

    $('#footer-button-launch-web-tourist').click(function() {
        document.querySelector("#connection-modal-launch-web-tourist").click();
        var webTourist = {};
        webTourist.action = "open web tourist";
        dataChannel.send(JSON.stringify(webTourist));
    });

    $('#modal-web-tourist-link-dismiss').click(function() {
        if(isRemoteModalDismiss) {
            isRemoteModalDismiss = false;
        } else {
            var webTourist = {};
            webTourist.action = "close web tourist";
            dataChannel.send(JSON.stringify(webTourist));
        }
    });

    $('#modal-web-tourist-share-button').click(function() {
        if(isWebTouring) {
console.log("==> STOPPING SCREEN SHARING");
//            webTouristStream.getTracks().forEach(function(track) {
//                track.stop();
//            });
//            webTouristStream.getTracks()[0].stop();
            isWebTouring = false;
            webTouristStream = null;
            screenPeerConnection = null;
            document.querySelector('#modal-web-tourist-share-button').innerText = "Start Screen Sharing"
            document.querySelector("#modal-web-tourist-share-button").disabled = false;
            document.querySelector("#modal-web-tourist-screenshare").style.display = "none";
            document.querySelector("#modal-web-tourist-extension-section").style.display = "block";
            document.querySelector("#modal-web-tourist-extension-text").style.display = "block";
            $('#modal-web-tourist-link-dismiss').click();
        } else {
          var ua = navigator.userAgent;
          if(ua.toLowerCase().indexOf("chrome") > -1) {
console.log("about to postMessage");
              window.postMessage({type:'SS_UI_REQUEST', text:'start', url: location.origin}, '*');
          }
        }
    });  

    $('#footer-button-launch-share-stuff').click(function() {
        document.querySelector("#connection-modal-launch-share-stuff").click();
        var shareStuff = {};
        shareStuff.action = "open share stuff";
        dataChannel.send(JSON.stringify(shareStuff));
    });

    $('#modal-share-stuff-link-dismiss').click(function() {
        if(isRemoteModalDismiss) {
            isRemoteModalDismiss = false;
        } else {
            var shareStuff = {};
            shareStuff.action = "close share stuff";
            dataChannel.send(JSON.stringify(shareStuff));
        }
    });

    $('#modal-share-stuff-drop').click(function(){
        console.log(">>> click <<<");
        $('#modal-share-stuff-fileBox').trigger('click');
    });

    $('.modal-share-stuff-fileCont span').click(function(){
        $(this).remove();
    });

    $('#tc').click(function() {
        if($('#pp_section').is(":visible")) $('#pp_section').slideDown("fast");
        if(currentPanel == "start") {
            $('#tc_section').slideToggle("fast");
            if($('#start-view').is(":visible")) {
                $('#start-view').hide();
            } else {
                $('#start-view').show();
            }
        }
        if(currentPanel == "profile") {
            $('#tc_section').slideToggle("fast");
            if($('#profile-view').is(":visible")) {
                $('#profile-view').hide();
            } else {
                $('#profile-view').show();
            }
        }
        if(currentPanel == "connection") {
            $('#tc_section').slideToggle("fast");
            if($('#connection-view').is(":visible")) {
                $('#connection-view').hide();
            } else {
                $('#connection-view').show();
            }
        }
        return false;
    });

    $('#pp').click(function() {
        if($('#tc_section').is(":visible")) $('#tc_section').slideToggle("fast");
        if(currentPanel == "start") {
            $('#pp_section').slideToggle("fast");
            if($('#start-view').is(":visible")) {
                $('#start-view').hide();
            } else {
                $('#start-view').show();
            }
        }
        if(currentPanel == "profile") {
            $('#pp_section').slideToggle("fast");
            if($('#profile-view').is(":visible")) {
                $('#profile-view').hide();
            } else {
                $('#profile-view').show();
            }
        }
        if(currentPanel == "connection") {
            $('#pp_section').slideToggle("fast");
            if($('#connection-view').is(":visible")) {
                $('#connection-view').hide();
            } else {
                $('#connection-view').show();
            }
        }
        return false;
    });

    establishAudioContext();
    fetchLegalInfo();
    
    if(isInvitedPeer) {
        languageCode = getParameter("lcode");
        invitationNickname = getParameter("invname");
        remotePeerNickname = getParameter("rpnname");
        remotePeerRoom = getParameter("rproom");
        remotePeerSocketID = getParameter("rpsid");
        localProfile.languageCode = languageCode;
        localProfile.nativeLanguage = languageCode;
        localProfile.nickname = invitationNickname;
        saveLocalProfile();
        document.querySelector("#connection-remote-nickname").value = remotePeerNickname;
    }

    establishContextLanguage();
    startReset();

    clearInterval(refreshIntervalNetSpeed);
    refreshIntervalNetSpeed = setInterval(function() {
        clockNetSpeed();
    }, 5000);

    if(isInvitedPeer) {
        document.querySelector("#connection-local-nickname").value = localProfile.nickname;
        if(localStream) stopMediaStream();
        document.querySelector("#start-view").style.display = "none"; 
        document.querySelector("#profile-view").style.display = "none";
        document.querySelector("#connection-view").style.display = "block";
        document.querySelector("#footer-button").style.display = "none";
        document.querySelector("#-settings").style.display = "block";
        currentPanel = "connection";
        poseForSnapshot();
    }
  
    window.addEventListener('message', function(event) {
        if(event.origin != window.location.origin) return;
        if(event.data.type && (event.data.type === 'SS_PING')) extensionInstalled = true;
        if(event.data.type && (event.data.type === 'SS_DIALOG_SUCCESS')) {
            startWebTourist(event.data.streamId);
        }
        if(event.data.type && (event.data.type === 'SS_DIALOG_CANCEL')) console.log('User bailed Web Tourist!');
    });

});


function establishAudioContext() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch(e) {
        throw new Error('Web Audio API not supported.');
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "//localhost:10913/audio/wand.wav", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        audioContext.decodeAudioData(xhr.response, function(buffer) {
            sound = buffer;
        }, function(err) {
            throw new Error(err);
        });
    };
    xhr.send();
}



function establishContextLanguage() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            contextLanguageSettings = JSON.parse(xhr.responseText);
            langArray = contextLanguageSettings.languages.split(",");
            document.querySelector("#start-view-welcome").innerText = contextLanguageSettings.welcome;
            document.querySelector("#start-nickname-label").innerText = contextLanguageSettings.nickname;
            document.querySelector("#connection-local-nickname-label").innerText = contextLanguageSettings.nickname;
            document.querySelector("#connection-local-peer-heading").innerText = contextLanguageSettings.me;
            document.querySelector("#connection-button-available").innerText = contextLanguageSettings.available;
            document.querySelector("#connection-button-presence").innerText = contextLanguageSettings.unavailable;
            // if(localProfile.nickname) {
            //     document.querySelector("#start-video-button-next").innerText = contextLanguageSettings.start;
            //     document.querySelector("#start-video-button-next").innerText = contextLanguageSettings.start;
            // } else {
            //     document.querySelector("#start-video-button-next").innerText = contextLanguageSettings.next;
            // }
            document.querySelector("#connection-remote-language-label").innerText = contextLanguageSettings.findpeerlanguage;
            document.querySelector("#connection-remote-nickname-label").innerText = contextLanguageSettings.nickname;
            document.querySelector("#connection-button-find-peers").innerText = contextLanguageSettings.findpeers;
            document.querySelector("#menu-language").innerHTML = "<span class='icon icon-language'></span>" + contextLanguageSettings.language;
            document.querySelector("#modal-about-h2").innerText = contextLanguageSettings.about + " Video Friends";
            document.querySelector("#menu-about").innerHTML = "<span class='icon icon-info-outline'></span>" + contextLanguageSettings.about;
            document.querySelector("#menu-helpful-tips").innerHTML = "<span class='icon icon-help'></span>" + contextLanguageSettings.tips;
            document.querySelector("#menu-link-exit").innerHTML =  "<span class='icon icon-exit-to-app'></span>" + contextLanguageSettings.exit;
            document.querySelector("#modal-about-credits").innerHTML = contextLanguageSettings.credits;
            document.querySelector("#modal-about-ok").innerText = contextLanguageSettings.ok;
            document.querySelector("#modal-helpful-tips-h2").innerText = contextLanguageSettings.tips;
            document.querySelector("#modal-helpful-tips-netspeed").innerText = contextLanguageSettings.netspeed;
            document.querySelector("#modal-helpful-tips-fastnetspeed").innerText = contextLanguageSettings.fastnetspeed;
            document.querySelector("#modal-helpful-tips-slownetspeed").innerText = contextLanguageSettings.slownetspeed;
            document.querySelector("#modal-helpful-tips-close-speed").innerHTML = "<span class='icon icon-close'></span>&nbsp;" + contextLanguageSettings.close;
            document.querySelector("#modal-helpful-tips-pause").innerText = contextLanguageSettings.pause;
            document.querySelector("#modal-helpful-tips-pause-blurb").innerHTML = contextLanguageSettings.tipspause;
            document.querySelector("#modal-helpful-tips-close-pause").innerHTML = "<span class='icon icon-close'></span>&nbsp;" + contextLanguageSettings.close;
            document.querySelector("#modal-helpful-tips-private").innerText = contextLanguageSettings.keep;
            document.querySelector("#modal-helpful-tips-keep-blurb").innerHTML = contextLanguageSettings.tipskeep;
            document.querySelector("#modal-helpful-tips-close-keep").innerHTML = "<span class='icon icon-close'></span>&nbsp;" + contextLanguageSettings.close;
            document.querySelector("#modal-helpful-tips-ok").innerText = contextLanguageSettings.ok;
            //document.querySelector("#modal-web-tourist-experimental").innerText = "(" + contextLanguageSettings.experimental + ")";
            // document.querySelector("#modal-web-tourist-site-back-button").innerText = contextLanguageSettings.back;
            // document.querySelector("#modal-web-tourist-site-go-button").innerText = contextLanguageSettings.go;
            document.querySelector("#modal-share-stuff-dropfiles").innerText = contextLanguageSettings.dropfiles;
            document.querySelector("#footer-span-addons").innerText = contextLanguageSettings.addons;
            document.querySelector("#footer-span-textchat").innerText = contextLanguageSettings.textchat;
            document.querySelector("#footer-span-webtourist").innerText = contextLanguageSettings.webtourist;
            document.querySelector("#footer-span-sharestuff").innerText = contextLanguageSettings.sharestuff;
            document.querySelector("#connection-button-disconnect").innerText = contextLanguageSettings.hangup;
            document.querySelector("#modal-button-hangup-available-peer").innerText = contextLanguageSettings.hangup;
            document.querySelector("#modal-available-peers-heading").innerText = contextLanguageSettings.wantstochat;
            document.querySelector("#modal-peer-invitation-heading").innerText = contextLanguageSettings.nowcalling;
            document.querySelector("#modal-chat-request-button-accept").innerText = contextLanguageSettings.accept;
            document.querySelector("#modal-chat-request-button-decline").innerText = contextLanguageSettings.decline;
            //if(null != remotePeerNickname && document.querySelector("#connection-remote-peer-heading").innerText != remotePeerNickname) {
            //    document.querySelector("#connection-remote-peer-heading").innerText = remotePeerNickname + " " + contextLanguageSettings.returnsoon;
            //}
            document.querySelector("#modal-getUserMedia-heading").innerText = contextLanguageSettings.getusermedia_title;
            document.querySelector("#modal-getUserMedia-advisory").innerText = contextLanguageSettings.getusermedia_advisory;
            document.querySelector("#connection-remote-peer-native-language").selectedIndex = -1;
        }
    };    
    xhr.open("GET", "//localhost:10913/geti18nStuff?langcode=" + languageCode, true);
    xhr.send();
}



function fetchLegalInfo() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var legalInfo = JSON.parse(xhr.responseText);
            $('#tc_section').append(legalInfo.terms);
            $('#pp_section').append(legalInfo.privacy);
        }
    };
    xhr.open("GET", "//localhost:10913/getLegalInfo", true);
    xhr.send();    
}



function remotePause(pauseMode, isInvokedRemotely) {
    var remotePause = {};
    remotePause.action = pauseMode;
    dataChannel.send(JSON.stringify(remotePause));
    showRemotePause(pauseMode);
}


function sendLocalChatMessage() {
    var textChat = {};
    textChat.action = "chat msg";
    textChat.peerType = "remote";
    textChat.msg = $('#modal-text-chat-message').val();
    dataChannel.send(JSON.stringify(textChat));
    postChatMsg("local", textChat.msg);
    $('#modal-text-chat-message').val("");
}


function shareStuffTransferPrep(file) {
    var shareStuff = {};
    shareStuff.action = "transfer share stuff";
    shareStuff.fileName = file.name;
    shareStuff.fileSize = file.size;
    dataChannel.send(JSON.stringify(shareStuff));
    window.setTimeout(function() { 
        sendOutgoingShareStuff(file);
    }, 1000);
}


function startReset() {
    if(localProfile.nickname) {
        document.querySelector("#menu-thumbnail-nickname").innerText = localProfile.nickname;
        document.querySelector("#start-nickname").value = localProfile.nickname;
        document.querySelector("#start-nickname").setAttribute("disabled", true);
        document.querySelector("#start-nickname-label").setAttribute("style", "display:none");
        document.querySelector("#start-txt-button-next").disabled = false;
        document.querySelector("#start-video-button-next").disabled = false;
    }
}


function saveLocalProfile() {
    localProfile.time = new Date().getTime();
    localStorage.localProfile = JSON.stringify(localProfile);
}


function loadLocalProfile() {
    localProfile = JSON.parse(localStorage.localProfile || null) || {};
}


function renderLocalPhoto() {
    document.querySelector("#menu-thumbnail-photo").src = localProfile.photo;
    document.querySelector("#start-photo").src = localProfile.photo;
    document.querySelector("#connection-avatar-local-photo").src = localProfile.photo;
}


function startVideoJump() {
    nextCard("connection");
}


function nextCard(requestedCard) {
    currentPanel = requestedCard;
    if(requestedCard == "start") {
        startReset();
        document.querySelector("#connection-view").style.display = "none";
        document.querySelector("#profile-view").style.display = "none";
        document.querySelector("#footer-button").style.display = "none";
        document.querySelector("#start-view").style.display = "block"; 
        if(localStream) stopMediaStream();
    }
    // if(requestedCard == "profile") {
    //     localProfile.nickname = document.querySelector("#start-nickname").value;
    //     saveLocalProfile();
    //     document.querySelector("#start-view").style.display = "none"; 
    //     document.querySelector("#connection-view").style.display = "none";
    //     document.querySelector("#profile-view").style.display = "block";
    //     document.querySelector("#footer-button").style.display = "none";
    //     if(localStream) stopMediaStream();
    //     poseForSnapshot();

    // }
    if(requestedCard == "connection") {
        localProfile.nickname = document.querySelector("#start-nickname").value;
        takeSnapshot();
        if(localStream) stopMediaStream();
        document.querySelector("#start-view").style.display = "none"; 
        document.querySelector("#connection-view").style.display = "block";
        document.querySelector("#footer-button").style.display = "none";
    }
}


function connectToNetwork() {
    poseForSnapshot();
}


function inviteVideoFriend() {
    if(document.querySelector("#connection-remote-nickname").value.length < 2) {
        document.querySelector("#find-available-peers-msg").innerHTML = document.querySelector("#connection-remote-nickname-label").innerText + "?";
        $("#find-available-peers-msg").stop().fadeIn(400).delay(1200).fadeOut(400);
    } else {
        if(document.querySelector("#connection-remote-peer-native-language").selectedIndex < 0) {
            document.querySelector("#find-available-peers-msg").innerHTML = document.querySelector("#connection-remote-language-label").innerText + "?";
            $("#find-available-peers-msg").stop().fadeIn(400).delay(1200).fadeOut(400);
        } else {
            var quickInvitation = window.location.href + "?invite=true" + "&invname=" + encodeURIComponent(document.querySelector("#connection-remote-nickname").value) + "&lcode=" + document.querySelector("#connection-remote-peer-native-language")[document.querySelector("#connection-remote-peer-native-language").selectedIndex].value + "&rpnname=" + encodeURIComponent(document.querySelector("#connection-local-nickname").value) + "&rproom=" + myRoom + "&rpsid=" + encodeURIComponent(mySocketID);
            document.querySelector("#invite-peer-link").value = quickInvitation;
            $('#connection-modal-invite-peer').click();
        }
    }
}


function findVideoFriends() {
    flashPhoto();
    // create matching Object here and pass to emit to socket
    var searchObj = {};
    searchObj.localNickname = localProfile.nickname;
    searchObj.room = room;
    if(document.querySelector("#connection-remote-nickname")) {
        searchObj.remoteNickname = document.querySelector("#connection-remote-nickname").value;
    }
    if(document.querySelector("#connection-remote-peer-native-language").selectedIndex > -1) {
        if(document.querySelector("#connection-remote-peer-native-language")[document.querySelector("#connection-remote-peer-native-language").selectedIndex].value != " ") {
            searchObj.language = document.querySelector("#connection-remote-peer-native-language")[document.querySelector("#connection-remote-peer-native-language").selectedIndex].value;
        }
    }
    searchObj.languageLevel = 3; //fluent
    socket.emit("find video friends", JSON.stringify(searchObj));
}


function showAvailableMatchingPeerCards(data) {
    if(data.length === 0) {
        document.querySelector("#find-available-peers-msg").innerHTML = contextLanguageSettings.sorry;
        $("#find-available-peers-msg").stop().fadeIn(400).delay(3000).fadeOut(400);
    } else {
        var dynaToken = null;
        var availablePeer = {};
        var availablePeerRoom = null;
        var availablePeerSocketID = null;
        if(isInvitedPeer) {
            var isImmediateMatch = false;
            for(var x = 0; x < data.length; x++) {
                availablePeer = data[x].profile;
                availablePeer.nickname = data[x].profile.nickname;
                availablePeerRoom = data[x].room;
                availablePeerSocketID = data[x].socketID;
                if(availablePeer.nickname === remotePeerNickname && availablePeerRoom === remotePeerRoom && availablePeerSocketID === remotePeerSocketID) {
                    isImmediateMatch = true;
                    remotePeerPhoto = availablePeer.photo;
                    document.querySelector("#requesting-peer-socketID").innerText = remotePeerSocketID;
                    acceptRequestingPeer(true);
                }
            }
            if(!isImmediateMatch) {
                document.querySelector("#find-available-peers-msg").innerHTML = contextLanguageSettings.sorry;
                $("#find-available-peers-msg").stop().fadeIn(400).delay(3000).fadeOut(400);
            }
        } else {
            document.querySelector("#modal-find-results-list-section").innerHTML = "";
            for(var x = 0; x < data.length; x++) {
                dynaToken = randomToken();
                availablePeer = data[x].profile;
                availablePeer.nickname = data[x].profile.nickname;
                availablePeerRoom = data[x].room;
                availablePeerSocketID = data[x].socketID;

                var tileWrap = document.createElement('div');
                tileWrap.className = "tile-wrap";

                var tileCollapse = document.createElement('div');
                tileCollapse.className = "tile tile-collapse";

                var tileToggle = document.createElement('div');
                tileToggle.className = "tile-toggle";
                var dataParent = document.createAttribute('data-parent');
                dataParent.value = ".content";
                tileToggle.setAttributeNode(dataParent);
                var dataTarget = document.createAttribute('data-target');
                dataTarget.value = "#tile-collapse-" + dynaToken;
                tileToggle.setAttributeNode(dataTarget);
                var dataToggle = document.createAttribute('data-toggle');
                dataToggle.value = "tile";
                tileToggle.setAttributeNode(dataToggle);

                var tileSide = document.createElement('div');
                tileSide.className = "tile-side";

                var fileSide = document.createElement('div');
                var fileSideStyle = document.createAttribute('style');
                fileSideStyle.value = "width: 100%";
                fileSide.setAttributeNode(fileSideStyle);
                var resultRow = document.createElement('div');
                resultRow.className = "modal-share-stuff-fileSide";
                var resultRowAlign = document.createAttribute('align');
                resultRowAlign.value = "center";
                resultRow.setAttributeNode(resultRowAlign);
                var resultRowStyle = document.createAttribute('style');
                resultRowStyle.value = "height: 50px; width: 100%; padding-left:12px";
                resultRow.setAttributeNode(resultRowStyle);
                                    
                var thumbNail = document.createElement("img");
                thumbNail.src = availablePeer.photo;
                thumbNail.className = "modal-share-stuff-avatar";
                resultRow.appendChild(thumbNail);
                
                var profileOverview = document.createElement('div');
                var profileOverviewStyle = document.createAttribute('style');
                profileOverviewStyle.value = "padding-top: 2.5%";
                profileOverview.setAttributeNode(profileOverviewStyle);

                var peerOverview = "";
                var peerOverviewLanguage = null;
    // >>>>>> refactor this in mongo and index by language code BEGIN <<<<<<
                if(availablePeer.nativeLanguage) {
                    if(availablePeer.nativeLanguage == "en") peerOverviewLanguage = langArray[0];                    
                    if(availablePeer.nativeLanguage == "fr") peerOverviewLanguage = langArray[1];                    
                    if(availablePeer.nativeLanguage == "de") peerOverviewLanguage = langArray[2];                    
                    if(availablePeer.nativeLanguage == "sp") peerOverviewLanguage = langArray[3];                    
                    peerOverview = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + peerOverviewLanguage;
                }
                if(availablePeer.ageRange) {
                    if(availablePeer.ageRange == 17) peerOverview += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.agerange + ": < 18";                    
                    if(availablePeer.ageRange == 25) peerOverview += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.agerange + ": 18 - 25";                    
                    if(availablePeer.ageRange == 34) peerOverview += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.agerange + ": 26 - 34";                    
                    if(availablePeer.ageRange == 50) peerOverview += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.agerange + ": 35 - 50";                    
                    if(availablePeer.ageRange == 501) peerOverview += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.agerange + ": > 50";                    
                }
                profileOverview.innerHTML = availablePeer.nickname + peerOverview;
                
                profileOverview.className = "modal-share-stuff-fileName";
                resultRow.appendChild(profileOverview);
                fileSide.appendChild(resultRow);
                tileSide.appendChild(fileSide);

                var tileActiveShow = document.createElement('div');
                tileActiveShow.setAttribute("id", "tile-collapse-" + dynaToken);
                tileActiveShow.className = "tile-active-show tile-active-show-still collapse";

                var tileSub = document.createElement('div');
                tileSub.className = "tile-sub";
                var tileSubStyle = document.createAttribute('style');
                tileSubStyle.value = "width: 100%; padding 10%";
                tileSub.setAttributeNode(tileSubStyle);

                var availablePeerBlurb = "";
                if(availablePeer.myGeneralLocation) availablePeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.mylocation + ": <b>" + availablePeer.myGeneralLocation + "</b><br/>";
                if(availablePeer.interestingPlacesNearMe) availablePeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.interesting + ": <b>" + availablePeer.interestingPlacesNearMe + "</b><br/>";
                if(availablePeer.myHobbies) availablePeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.myhobbies + ": <b>" + availablePeer.myHobbies + "</b><br/>";
                if(availablePeer.interestingPlacesNearMe) availablePeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.things + ": <b>" + availablePeer.myInterests + "</b><br/>";
                if(availablePeerBlurb === "") {
                    availablePeerBlurb = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + contextLanguageSettings.noprofile + ")";
                } else {
                    availablePeerBlurb = availablePeerBlurb.substr(0, (availablePeerBlurb.length -5));
                }
    /* ==> */ tileSub.innerHTML = availablePeerBlurb;
    // >>>>>> refactor this in mongo and index by language code END <<<<<<
                tileActiveShow.appendChild(tileSub);

                var tileFooter = document.createElement('div');
                tileFooter.className = "tile-footer";

                var tileFooterNav = document.createElement('ul');
                tileFooterNav.className = "nav nav-list pull-left";

                var tileFooterListItem1 = document.createElement('li');
                var tileFooterListItem1Anchor = document.createElement('a');

                // JS fake-out goes here BEGIN
                tileFooterListItem1Anchor.setAttribute("href", "javascript:fakeOut()");
                remotePeerSocketID = availablePeerSocketID;
                remotePeerNickname = availablePeer.nickname;
                remotePeerPhoto = availablePeer.photo;
                remotePeerRoom = availablePeerRoom;
                document.querySelector("#modal-available-peers-room").value = availablePeerRoom;
                document.querySelector("#modal-available-peers-nickname").innerText = availablePeer.nickname;
                document.querySelector("#modal-available-peers-photo").src = availablePeer.photo;
                document.querySelector("#modal-available-peers-socketID").value = availablePeerSocketID;
                // JS fake-out goes here END


                var tileFooterListItem1AnchorSpan = document.createElement('span');
                tileFooterListItem1AnchorSpan.className = "icon icon-check";
                tileFooterListItem1AnchorSpan.innerHTML = "&nbsp;";
                tileFooterListItem1Anchor.innerText = contextLanguageSettings.call;

                tileFooterListItem1Anchor.insertBefore(tileFooterListItem1AnchorSpan, tileFooterListItem1Anchor.firstChild);
                tileFooterListItem1.appendChild(tileFooterListItem1Anchor);
                tileFooterNav.appendChild(tileFooterListItem1);


                var tileFooterListItem2 = document.createElement('li');
                var tileFooterListItem2Anchor = document.createElement('a');
                var dataDismiss = document.createAttribute('data-dismiss');
                dataDismiss.value = "tile";

                tileFooterListItem2Anchor.setAttributeNode(dataDismiss);
                tileFooterListItem2Anchor.setAttribute("href", "#");
                var tileFooterListItem2AnchorSpan = document.createElement('span');
                tileFooterListItem2AnchorSpan.className = "icon icon-close";
                tileFooterListItem2AnchorSpan.innerHTML = "&nbsp;";
                tileFooterListItem2Anchor.innerText = contextLanguageSettings.close;

                tileFooterListItem2Anchor.insertBefore(tileFooterListItem2AnchorSpan, tileFooterListItem2Anchor.firstChild);
                tileFooterListItem2.appendChild(tileFooterListItem2Anchor);
                tileFooterNav.appendChild(tileFooterListItem2);

                tileFooter.appendChild(tileFooterNav);

                tileActiveShow.appendChild(tileSub);
                tileActiveShow.appendChild(tileFooter);

                tileToggle.appendChild(tileSide);

                tileCollapse.appendChild(tileToggle);
                tileCollapse.appendChild(tileActiveShow);

                tileWrap.appendChild(tileCollapse);

                findResultsList.appendChild(tileWrap);
            }
            document.querySelector("#connection-modal-find-results").click();
        }
    }
}

function fakeOut() {
    document.querySelector("#modal-find-results-link-dismiss").click();
    document.querySelector("#modal-button-call-available-peer").click();
    document.querySelector("#connection-modal-available-peers").click();
}


function callToPeer() {
    document.querySelector("#modal-call-available-peer").style.display = "none";
    document.querySelector("#modal-hangup-available-peer").style.display = "block";
    socket.emit("video chat request",
                document.querySelector("#modal-available-peers-socketID").value,
                localProfile.nickname,
                localProfile.photo,
                myRoom,
                mySocketID);

}


function videoChatRequested(requestorPeer) {
    document.querySelector("#requesting-peer-photo").src = remotePeerPhoto;
    document.querySelector("#requesting-peer-room").innerText = remotePeerRoom;
    document.querySelector("#requesting-peer-socketID").innerText = remotePeerSocketID;

    var peerOverview = "";
    var peerOverviewLanguage = null;
// >>>>>> refactor this in mongo and index by language code BEGIN <<<<<<
    if(requestorPeer.profile.nativeLanguage) {
        if(requestorPeer.profile.nativeLanguage == "en") peerOverviewLanguage = langArray[0];                    
        if(requestorPeer.profile.nativeLanguage == "fr") peerOverviewLanguage = langArray[1];                    
        if(requestorPeer.profile.nativeLanguage == "de") peerOverviewLanguage = langArray[2];                    
        if(requestorPeer.profile.nativeLanguage == "sp") peerOverviewLanguage = langArray[3];                    
        peerOverview = "&nbsp;/&nbsp;" + peerOverviewLanguage;
    }
    if(requestorPeer.profile.ageRange) {
        if(requestorPeer.profile.ageRange == 17) peerOverview += "&nbsp;/&nbsp;" + contextLanguageSettings.agerange + ": < 18";                    
        if(requestorPeer.profile.ageRange == 25) peerOverview += "&nbsp;/&nbsp;" + contextLanguageSettings.agerange + ": 18 - 25";                    
        if(requestorPeer.profile.ageRange == 34) peerOverview += "&nbsp;/&nbsp;" + contextLanguageSettings.agerange + ": 26 - 34";                    
        if(requestorPeer.profile.ageRange == 50) peerOverview += "&nbsp;/&nbsp;" + contextLanguageSettings.agerange + ": 35 - 50";                    
        if(requestorPeer.profile.ageRange == 501) peerOverview += "&nbsp;/&nbsp;" + contextLanguageSettings.agerange + ": > 50";                    
    }

    var requestorPeerBlurb = "<b>" + requestorPeer.profile.nickname + peerOverview + "</b><br/>";
    if(requestorPeer.profile.myGeneralLocation) requestorPeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.mylocation + ": <b>" + requestorPeer.profile.myGeneralLocation + "</b><br/>";
    if(requestorPeer.profile.interestingPlacesNearMe) requestorPeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.interesting + ": <b>" + requestorPeer.profile.interestingPlacesNearMe + "</b><br/>";
    if(requestorPeer.profile.myHobbies) requestorPeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.myhobbies + ": <b>" + requestorPeer.profile.myHobbies + "</b><br/>";
    if(requestorPeer.profile.interestingPlacesNearMe) requestorPeerBlurb += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + contextLanguageSettings.things + ": <b>" + requestorPeer.profile.myInterests + "</b><br/>";
    if(requestorPeerBlurb === "") {
        requestorPeerBlurb = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + contextLanguageSettings.noprofile + ")";
    } else {
        requestorPeerBlurb = requestorPeerBlurb.substr(0, (requestorPeerBlurb.length -5));
    }
/* ==> */ document.querySelector("#requesting-peer-profile").innerHTML = requestorPeerBlurb;
// >>>>>> refactor this in mongo and index by language code END <<<<<<

    document.querySelector("#connection-modal-chat-request").click();
    soundSource = audioContext.createBufferSource();
    soundSource.buffer = sound;
    soundSource.connect(audioContext.destination);
    soundSource.start(0);
    numberOfChimes = 0;
    awaitJoinRequestResponse();
}


function acceptRequestingPeer(isPeerAccepted) {
    currentProcess = null;
    if(isPeerAccepted) {
        socket.emit("connect incoming peer",
            myRoom,
            localProfile.nickname,
            localProfile.photo,
            document.querySelector("#requesting-peer-socketID").innerText,
            0);
    } else {
        socket.emit("decline video chat request", document.querySelector("#requesting-peer-socketID").innerText);            
    }
}


function awaitJoinRequestResponse() {
    currentProcess = "awaitJoinRequestResponse";
    refreshIntervalID = setInterval(function() {
        waitState();
    }, 5000);
}

function waitState() {
    if(null === currentProcess || numberOfChimes === maxChimes) {
        clearInterval(refreshIntervalID);
        document.querySelector("#modal-chat-request-link-dismiss").click();
    } else {
        soundSource = audioContext.createBufferSource();
        soundSource.buffer = sound;
        soundSource.connect(audioContext.destination);
        soundSource.start(0);
        numberOfChimes++;
    }
}


function showRemotePause(pauseMode, isInvokedRemotely) {
    if(isInvokedRemotely) {
        if(pauseMode == "pause") {
            document.querySelector("#connection-remote-pause-heading").innerText = contextLanguageSettings.returnsoon;
            document.querySelector("#connection-remote-pause-photo").src = remotePeerPhoto;
            document.querySelector("#connection-remote-peer-connected-videosection").style.display = "none";
            document.querySelector("#connection-remote-peer-connected-pausesection").style.display = "block";
        } else {
            document.querySelector("#connection-remote-peer-heading").innerText = remotePeerNickname;
            document.querySelector("#connection-remote-peer-connected-pausesection").style.display = "none";
            document.querySelector("#connection-remote-peer-connected-videosection").style.display = "block";
        }
    } else {
        if(pauseMode == "pause") {
            document.querySelector("#connection-local-pause-heading").innerText = contextLanguageSettings.returnsoon;
            document.querySelector("#connection-local-pause-photo").src = localProfile.photo;
            document.querySelector("#connection-local-peer-connected-videosection").style.display = "none";
            document.querySelector("#connection-local-peer-connected-pausesection").style.display = "block";
        } else {
            document.querySelector("#connection-local-peer-heading").innerText = contextLanguageSettings.me;
            document.querySelector("#connection-local-peer-connected-pausesection").style.display = "none";
            document.querySelector("#connection-local-peer-connected-videosection").style.display = "block";
        }
    }
}


function postChatMsg(peerType, msg) {
    var div = document.createElement("div");
    if(peerType == "local") {
        div.className = "bubble me";
    } else {
        div.className = "bubble you";
    }
    div.innerHTML = msg;
    document.querySelector("#modal-text-chat-board").appendChild(div);
    document.querySelector("#modal-text-chat-board").scrollTop = document.querySelector("#modal-text-chat-board").scrollHeight;
}



function dismissPeerConnectionRequest(isDismissed) {
    document.querySelector("#modal-call-available-peer").style.display = "block";
    document.querySelector("#modal-hangup-available-peer").style.display = "none";
    if(!isDismissed) {
        if(!isJoinRequestAccepted && !isJoinRequestDeclined) {
            socket.emit("dismiss video chat request",
                    document.querySelector("#modal-available-peers-socketID").value);
        }
    } else {
            socket.emit("dismiss video chat request",
                    document.querySelector("#modal-available-peers-socketID").value);
    }
    isJoinRequestAccepted = false;
    isJoinRequestDeclined = false;
}


function clockNetSpeed() {
    if(document.querySelector("#header-netspeed").style.display == "none") {
        document.querySelector("#header-netspeed").style.display = "block"; 
    }
    $.ajax({
        beforeSend: function(){
            window.startTime = new Date();
        },
        url: '/',
        success: function(){
            window.endTime = new Date();
            //document.querySelector("#header-netspeed").innerText = (window.endTime - window.startTime + " ms");
            var netSpeed = window.endTime - window.startTime;
            if(netSpeed <= 400) {
                document.querySelector("#header-netspeed").src = "images/hare-green-36.gif";
            } else {
                document.querySelector("#header-netspeed").src = "images/tortoise-red-36.gif";
            }
        }
    });
}


function checkMinimalProfile() {
    if(document.querySelector('#profile-native-language').selectedIndex == -1
            || document.querySelector('#profile-native-language').selectedIndex == 0) {
        //alert("pick a native language");
        document.querySelector("#profile-button-save-msg").innerHTML = contextLanguageSettings.nativelanguage + "?";
        $("#profile-button-save-msg").stop().fadeIn(400).delay(3000).fadeOut(400);
        return false;
    } else {
        return true;
    }
}


function disconnectFromNetwork() {
console.log(">>> disconnectFromNetwork");
    clearInterval(refreshIntervalNetSpeed);
    if(localStream) stopMediaStream();
    socket.emit("exit room", localProfile.nickname, room);
    if(isRemoteHangup) {
        isRemoteHangup = false;
        socket.emit("exit room for remote", remotePeerSocketID);
    }
    wipeClean();
    document.querySelector("#connection-local-connected").style.display = "none";   
    document.querySelector("#connection-local-unconnected").style.display = "block";
    document.querySelector("#connection-remote-peer-connected-section").style.display = "none"; 
    document.querySelector("#connection-remote-peer-selection-section").style.display = "block";
    document.querySelector("#connection-button-find-peers").disabled = true;
    document.querySelector("#connection-button-invite-peer").disabled = true;
    document.querySelector("#footer-button").style.display = "none";
}

function startWebTourist(streamId) {
console.log(">>> INSIDE startWebTourist");
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                maxWidth: window.screen.width,
                maxHeight: window.screen.height
            }
        }
    },
    function(webtouristStream) {
        isWebTouring = true;
        webTouristStream = webtouristStream;
        document.querySelector("#modal-web-tourist-extension-section").style.display = "none";
        document.querySelector("#modal-web-tourist-extension-text").style.display = "none";
        document.querySelector("#modal-web-tourist-screenshare").style.display = "block";          
        document.querySelector("#modal-web-tourist-screenshare").srcObject = webtouristStream;
//        document.querySelector("#modal-web-tourist-screenshare").pause();
//        document.querySelector("#modal-web-tourist-screenshare").play();
          playPromise = document.querySelector("#modal-web-tourist-screenshare").play();
          if(playPromise !== undefined) {
              playPromise.then(_ => {
              }) .catch(error => {
                document.querySelector("#modal-web-tourist-screenshare").pause();
              });
          }
        document.querySelector("#modal-web-tourist-share-button").innerText = "Stop Screen Sharing";
        prepWebTouristSharing(webtouristStream);
    },
    function(err) {
        console.log('getUserMedia failed!: ' + err);
    });
}

function closeMenuAside() {
    document.querySelector("#menu-aside").click();
}

function closeSettingsAside() {
    document.querySelector("#menu-aside").click();
}

function clearSettings() {
    if(localStream) stopMediaStream();
    localProfile = {};
    localStorage.localProfile = JSON.stringify(localProfile);
    document.querySelector("#menu-thumbnail-photo").src = "../images/users/avatar-001.jpg";
    document.querySelector("#start-photo").src = "../images/users/avatar-001.jpg";
    document.querySelector("#connection-avatar-local-photo").src = "../images/users/avatar-001.jpg";
    document.querySelector("#start-nickname").value = "";
    document.querySelector("#start-nickname").disabled = false;
    document.querySelector("#start-nickname-label").setAttribute("style", "display:block");
    document.querySelector("#start-txt-button-next").innerText = "Send a Gospel txt";
    document.querySelector("#start-txt-button-next").disabled = true;
    document.querySelector("#start-video-button-next").innerText = "Be a Video Friend";
    document.querySelector("#start-video-button-next").disabled = true;
    document.querySelector("#profile-nickname").value = " ";
    document.querySelector("#connection-remote-peer-native-language").value = " ";
}

function cleanExit(isClean) {
    if(isClean) clearSettings();
    nextCard("start");
    closeMenuAside();
}

function wipeClean() {
    currentProcess = null;
    refreshIntervalID = null;
    numberOfChimes = 0;
    isMediaPermissionGranted = false;
    localStream = null;
    peerConnection = null;
    isReady = false;
    isInitiator = null;
    isRemoteConnected = false;
    canMakeAnOffer = false;
    currentNumberOfPeers = 0;
    remotePeerConnection = {};
    remotePeerConnections = [];
    receiverSocketID = null;
    dataChannel = null;
    queuePosition = 0;
    queuedIncomingPeer = null;
    isJoinRequestAccepted = false;
    isJoinRequestDeclined = false;
    isRemoteModalDismiss = false;
    remotePeerSocketID = null;
    remotePeerNickname = null;
    isRemoteHangup = false;
    remoteVideo.srcObject = null;
    remoteChatVideoSmall.srcObject = null;
    localChatVideoSmall.srcObject = null;
    remoteShareVideoSmall.srcObject = null;
    localShareVideoSmall.srcObject = null;
    remoteVideoSmall.srcObject = null;
    localVideoSmall.srcObject = null;
    document.querySelector("#connection-remote-peer-heading").innerText = "Video Peer";
    meConnectedLocalVideo.removeAttribute("controls");
    remoteVideo.removeAttribute("controls");
}