"use strict";

var isMediaPermissionGranted = false,
    localStream = null,
    webTouristStream = null,
    socket = null,

    photo = document.querySelector("#connection-local-photo"),
    photoContext = photo.getContext("2d"),
    photoContextW = 320,
    photoContextH = 160,
    photoDataURL = null,

    peerConnection,
// bxg - replace with XirSys
    peerConnectionConfig = {"iceServers": [{"urls": "stun:stun.services.mozilla.com"}, {"urls": "stun:stun.l.google.com:19302"}]},
    peerConnectionState = null,

    screenPeerConnection,
// bxg - replace with XirSys
    screenPeerConnectionConfig = {"iceServers": [{"urls": "stun:stun.services.mozilla.com"}, {"urls": "stun:stun.l.google.com:19302"}]},
    screenPeerConnectionState = null,

    room = null,

    myRoom = null,
    mySocketID = null,
    isReady = false,
    isInitiator = null,
    canMakeAnOffer = false,
    currentNumberOfPeers = 0,
    remotePeerConnection = {},
    remotePeerConnections = [],
    receiverSocketID = null,
    queuePosition = 0,
    queuedIncomingPeer = null,

    shareStuffTransferFileName = null,
    shareStuffTransferFileSize = 0,
    shareStuffReceiveBuffer = [],
    shareStuffReceivedSize = 0,

    constraints = {
        video: {
            mandatory: {
                maxWidth: 320,
                maxHeight: 240
            }
        },
        audio:true, optional:[{RtpDataChannels:true}],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    },
    isWebTouristOffered = false,
    webtourist_constraints = {
        video: {
            mandatory: {
                chromeMediaSource: "screen",
                maxWidth: screen.width,
                maxHeight: screen.height,
                minFrameRate: 1,
                maxFrameRate: 5
            },
            optional: []
        }
    },
    playPromise = null;


/*
// The ID of the extension we want to talk to.
var editorExtensionId = "mkfckbinleooepkhcpmiooillihedgak";

// Make a simple request:
window.chrome.runtime.sendMessage(editorExtensionId, {"message": "I'm from WebRTC"},
  function(response) {
    alert(JSON.stringify(response));
});
*/


/******************************************
 * Signaling server and related callbacks *
 ******************************************/

function initConnection() {
    room = randomToken();
    socket = io.connect("//localhost:10913", {path:"/socket.io", secure:true});

    socket.on("created", function(newRoom, socketID) {
        myRoom = newRoom;
        console.log("CREATED room", room, "- my socket ID is", socketID);
        mySocketID = socketID;
        isInitiator = true;
        if(isInvitedPeer) {
            setTimeout(function() {
                flashPhoto();
                findVideoFriends();
            }, 2400);
            //document.querySelector("#requesting-peer-socketID").innerText = remotePeerSocketID;
            //acceptRequestingPeer(true);
        }
    });

    socket.on("joined", function(newRoom, socketID) {
        myRoom = newRoom;
        console.log("JOINED room", room, "- my socket ID is", socketID);
        mySocketID = socketID;
        isInitiator = false;
    });

    socket.on("find video friends results", function(data) {
        showAvailableMatchingPeerCards(data);
    });

    socket.on("video chat request", function(requestorData) {
        remotePeerSocketID = requestorData.socketID;
        remotePeerNickname = requestorData.profile.nickname;
        remotePeerPhoto = requestorData.profile.photo;
        remotePeerRoom = requestorData.profile.room;
        videoChatRequested(requestorData);
    });

    socket.on("dismiss video chat request", function() {
        currentProcess = null;
        waitState();
    });

    socket.on("decline video chat request", function() {
        isJoinRequestDeclined = true;
        isJoinRequestAccepted = false;
        document.querySelector('#modal-available-peers-link-dismiss').click();
    });

    socket.on("accept join peer request", function() {
        isJoinRequestAccepted = true;
        isJoinRequestDeclined = false;
        document.querySelector("#modal-available-peers-link-dismiss").click();
    });

    socket.on("connect incoming peer", function (peerPairingObject) {
        var peerPair = JSON.parse(peerPairingObject);
        console.log("$$$ CONNECT INCOMING PEER " + peerPair.canOfferSocketID, peerPair.canAnswerNickname);
        queuePosition = peerPair.queuePosition;
        console.log("++++++++++++++++++++++++ queuePosition sent from SERVER is " + queuePosition);
        if(!isInvitedPeer) {
console.log("Peer is NOT invited");
            if(null == remotePeerNickname) {
console.log("Peer's nickname is null");
                remotePeerNickname = peerPair.canAnswerNickname;
                remotePeerPhoto = peerPair.canAnswerPhoto;
            }
        }
console.log("about to check peerPair OFFER");
        queuedIncomingPeer = peerPair.canAnswerSocketID;
        currentNumberOfPeers = peerPair.currentNumberOfPeers;
        receiverSocketID = peerPair.canAnswerSocketID;
        if(peerPair.canOfferSocketID == mySocketID) {
console.log("peerPair (me) CAN make OFFER");
            canMakeAnOffer = true;
            ready();
        }
console.log("about to check peerPair ANSWER");
        if(peerPair.canAnswerSocketID == mySocketID) {
console.log("peerPair (me) CANNNOT make OFFER - but CAN ANSWER");
            canMakeAnOffer = false;
            ready();
        }
console.log("peerPair process done - wait for incoming connection");
        currentProcess = null;
        waitState();
    });
  
    socket.on("force local hangup", function() {
        disconnectFromNetwork();
    });

    socket.on("log", function(array) {
        console.log.apply(console, array);
    });

    socket.on("message", function(message) {
        gotMessageFromServer(message);
    });

    socket.on("webtourist message", function(message) {
console.log(">>> got webtourist message")
        gotWebTouristMessageFromServer(message);
    });

    socket.on("screen iceCandidate", function(message) {
        gotWebTouristStreamFromServer(message);
    });

    socket.on("full", function (room) {
        alert("Room " + room + " is full. We will create a new room for you.");
        window.location.hash = "";
        window.location.reload();
    });
}



function poseForSnapshot() {
    if(navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, getUserMediaError);
        if(null == room) initConnection();
    } else {
        alert("Your browser does not support getUserMedia API");
    }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(getUserMediaSuccess)
        .catch(function(e) {
            alert('getUserMedia() error: ' + e.name);
        });
    if(null == room) initConnection();
}

function takeSnapshot() {
    if(null == localStream) {
        poseForSnapshot();
    }
}


function flashPhoto() {
    console.log(">>> smile!");
    photoContext.drawImage(localVideo, 0, 0, photoContextW, photoContextH);
    photoDataURL = photo.toDataURL("image/png");
    photoDataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}


function getUserMediaSuccess(stream) {
    console.log('got a stream');
    localStream = stream;
    meConnectedLocalVideo.srcObject = stream;
    meConnectedLocalVideo.muted = true;
    document.querySelector("#connection-button-presence").innerText = contextLanguageSettings.unavailable;
    if(currentPanel == "connection") {
        document.querySelector("#connection-button-find-peers").disabled = false;
        document.querySelector("#connection-button-invite-peer").disabled = false;
        document.querySelector("#connection-local-unconnected").style.display = "none";   
        document.querySelector("#connection-local-connected").style.display = "block";
        document.querySelector("#connection-remote-nickname-label").innerText = contextLanguageSettings.nickname;
        socket.emit("create or join", room, localProfile);
    }
}


function ready() {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotAnICECandidate;
    peerConnection.onaddstream = gotARemoteStream;
    peerConnection.addStream(localStream);
    peerConnection.onsignalingstatechange = function() {
        peerConnectionState = peerConnection.signalingState;
    }
    peerConnection.oniceconnectionstatechange = function() {
        if(null != peerConnection.iceConnectionState && peerConnection.iceConnectionState == "disconnected") {
            console.log("peerConnection detected a DISCONNECT");
        }
    }
    if(canMakeAnOffer) {
        console.log(">>> CREATING DATA CHANNEL");
        dataChannel = peerConnection.createDataChannel(room, {reliable: true});
        gotADataChannel();
        peerConnection.createOffer(gotDescription, createOfferError);
    } else {
        peerConnection.ondatachannel = function(event) {
            dataChannel = event.channel;
            gotADataChannel();
        };
    }
}


function prepWebTouristSharing(screenStream) {
    console.log("Creating SCREEN peer connection");
    screenPeerConnection = new RTCPeerConnection(screenPeerConnectionConfig);
    screenPeerConnection.onicecandidate = gotAWebTouristICECandidate;
    screenPeerConnection.ontrack = gotAWebTouristStream;
    screenPeerConnection.addStream(screenStream);
    screenPeerConnection.onsignalingstatechange = function() {
        screenPeerConnectionState = screenPeerConnection.signalingState;
    }
    screenPeerConnection.oniceconnectionstatechange = function() {
        if(null != screenPeerConnection.iceConnectionState && screenPeerConnection.iceConnectionState == "disconnected") {
            console.log("screenPeerConnection detected a DISCONNECT");
        }
    }
    screenPeerConnection.createOffer(gotWebTouristDescription, createOfferError);
}


function gotAnICECandidate(event) {
    if(event.candidate != null) {
        socket.emit("message", JSON.stringify({"type":"ice", "ice":event.candidate}))
    } else {
        console.log("ICE Candidates complete!");
    }
}


function gotAWebTouristICECandidate(event) {
    if(event.candidate != null) {
console.log("==> emit message for WebTourist ice candidate");      
        socket.emit("WebTourist socket message", receiverSocketID, JSON.stringify({"type":"WebTourist ice", "ice":event.candidate}));
    } else {
        console.log("WebTourist ICE Candidates complete!");
    }
}


function gotDescription(description) {
    peerConnection.setLocalDescription(description,
        function() {
console.log("=-=-=-=-=-=-=-=> about to send SDP message FROM " + mySocketID + " TO " + receiverSocketID);
            socket.emit("private socket message", receiverSocketID, JSON.stringify({
                "type":"sdp", "senderSocketID":mySocketID, "receiverSocketID":receiverSocketID, "sdp":description}));
        },
        setDescriptionError
    );
}


function gotWebTouristDescription(description) {
    screenPeerConnection.setLocalDescription(description,
        function() {
console.log("=-=-=-=-=-=-=-=> about to send WebTourist SDP message FROM " + mySocketID + " TO " + receiverSocketID);
            socket.emit("WebTourist socket message", receiverSocketID, JSON.stringify({
                "type":"sdp", "senderSocketID":mySocketID, "receiverSocketID":receiverSocketID, "sdp":description}));
        },
        setDescriptionError
    );
}


function gotARemoteStream(event) {
    isRemoteConnected = true;
console.log("&&&&&&& GOT A REMOTE STREAM FROM OTHER PEER - THERE ARE NOW " + currentNumberOfPeers + " PEERS");
    remoteVideo.srcObject = event.stream;
    remoteVideoSmall.srcObject = event.stream;
    remoteVideoSmall.muted = true;
    remoteVideoSmall.removeAttribute("controls");
    remoteChatVideoSmall.srcObject = event.stream;
    remoteChatVideoSmall.muted = true;
    remoteChatVideoSmall.removeAttribute("controls");
    remoteShareVideoSmall.srcObject = event.stream;
    remoteShareVideoSmall.muted = true;
    remoteShareVideoSmall.removeAttribute("controls");
    if(!meConnectedLocalVideo.hasAttribute("controls")) meConnectedLocalVideo.setAttribute("controls", "controls");
    if(!remoteVideo.hasAttribute("controls")) remoteVideo.setAttribute("controls", "controls");
    document.querySelector("#connection-remote-peer-heading").innerText = remotePeerNickname;
    document.querySelector("#connection-remote-peer-selection-section").style.display = "none";
    document.querySelector("#connection-remote-peer-connected-section").style.display = "block";
    document.querySelector("#modal-text-chat-remote-video-label").innerText = remotePeerNickname;
    document.querySelector("#modal-web-tourist-remote-video-label").innerText = remotePeerNickname;
    document.querySelector("#modal-share-stuff-remote-video-label").innerText = remotePeerNickname;
    document.querySelector("#connection-button-presence").innerText = contextLanguageSettings.mediapause;
    document.querySelector("#footer-button").style.display = "block";
}


function gotAWebTouristStream(event) {
console.log("&&&&&&& GOT A WEB TOURIST STREAM FROM OTHER PEER");
    isWebTouring = true;
    webTouristStream = event.stream;
    document.querySelector("#modal-web-tourist-extension-section").style.display = "none";
    document.querySelector("#modal-web-tourist-extension-text").style.display = "none";
    document.querySelector("#modal-web-tourist-screenshare").style.display = "block";
    document.querySelector("#modal-web-tourist-screenshare").srcObject = event.streams[0];
//    document.querySelector("#modal-web-tourist-screenshare").pause();
//    document.querySelector("#modal-web-tourist-screenshare").play();
    playPromise = document.querySelector("#modal-web-tourist-screenshare").play();
    if(playPromise !== undefined) {
        playPromise.then(_ => {
        }) .catch(error => {
          document.querySelector("#modal-web-tourist-screenshare").pause();
        });
    }
    document.querySelector("#modal-web-tourist-share-button").disabled = true;
}


function gotMessageFromServer(message) {
    var signal = JSON.parse(message);
    if(signal.type === "sdp") {
        if(signal.senderSocketID != mySocketID) {
console.log(">>> message sent FROM " + signal.senderSocketID + " TO " + signal.receiverSocketID);
            if(signal.sdp.type == "offer") {
//console.log("OFFER:\n" + message);
                receiverSocketID = signal.senderSocketID;
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
console.log("$$$$$$$$$$$$$$$$ CREATING ANSWER to INITIATOR");
//console.log("ANSWER:\n" + message);
                    peerConnection.createAnswer(gotDescription, createAnswerError);
                }, setDescriptionError);
            } else {
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
                }, setDescriptionError);
            }
        }
    } else if(signal.type === "ice") {
console.log(">>>>>>>>>>>>>>>>>>>>>>> peerConnectionState = " + peerConnectionState);
        if(peerConnectionState != "have-local-offer") {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice), addICECandidateSuccess, addICECandidateError);
        }
    } else if(signal.type === "WebTourist ice") {
console.log(">>>>>>>>>>>>>>>>>>>>>>> WebTourist peerConnectionState0 = " + screenPeerConnectionState);
        if(screenPeerConnectionState != "have-local-offer") {
            screenPeerConnection.addIceCandidate(new RTCIceCandidate(signal.ice), addICECandidateSuccess, addICECandidateError);
        }
    }
}

function gotWebTouristMessageFromServer(message) {
    var signal = JSON.parse(message);
console.log("==> WebTourist message ", signal);  
    if(signal.type === "sdp") {
        if(signal.senderSocketID != mySocketID) {
console.log(">>> WebTourist message sent FROM " + signal.senderSocketID + " TO " + signal.receiverSocketID);
            if((screenPeerConnection === undefined) || (null === screenPeerConnection)) {
console.log("==> instantiating screenPeerConnection");
                screenPeerConnection = new RTCPeerConnection(screenPeerConnectionConfig);
                screenPeerConnection.onicecandidate = gotAWebTouristICECandidate;
                screenPeerConnection.ontrack = gotAWebTouristStream;
                screenPeerConnection.onsignalingstatechange = function() {
                    screenPeerConnectionState = screenPeerConnection.signalingState;
                }
                screenPeerConnection.oniceconnectionstatechange = function() {
                    if(null != screenPeerConnection.iceConnectionState && screenPeerConnection.iceConnectionState == "disconnected") {
                        console.log("screenPeerConnection detected a DISCONNECT");
                    }
                }
            }
console.log("==> setting screenPeerConnection remoteDescription");
            if(signal.sdp.type == "offer") {
console.log("OFFER:\n" + message);
                receiverSocketID = signal.senderSocketID;
                screenPeerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
console.log("==> CREATING WEBRTC ANSWER to INITIATOR");
console.log("ANSWER:\n" + message);
                    screenPeerConnection.createAnswer(gotWebTouristDescription, createAnswerError);
                }, setDescriptionError);
            } else {
                screenPeerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
                }, setDescriptionError);
            }
        }
    } else if(signal.type === "WebTourist ice") {
console.log(">>>>>>>>>>>>>>>>>>>>>>> WebTourist peerConnectionState1 = " + screenPeerConnectionState);
console.log(">>>>>>>>>>>>>>>>>>>>>>> WebTourist peerConnection = ", screenPeerConnection);
        if(screenPeerConnectionState != "have-local-offer") {
            screenPeerConnection.addIceCandidate(new RTCIceCandidate(signal.ice), addICECandidateSuccess, addICECandidateError);
        }
    }
}

function gotADataChannel() {
    console.log(">>> DATA CHANNEL:", dataChannel);
    dataChannel.onopen = handleDataChannelStateChange;
    dataChannel.onclose = handleDataChannelStateChange;
    dataChannel.onmessage = handleDataChannelMessage;
    dataChannel.binaryType = "arraybuffer";
}

function handleDataChannelMessage(event) {
console.log("==> DETECTED SOMETHING! ", event);
    if(typeof event.data === "string") {

        var addOn = JSON.parse(event.data);        

        if(addOn.action == "open text chat") {
            if(document.querySelector("#modal-text-chat").offsetWidth > 0
                    && document.querySelector("#modal-text-chat").offsetHeight > 0) {
            } else {
                document.querySelector("#connection-modal-launch-text-chat").click();
            }
        }
        if(addOn.action == "chat msg") {
            postChatMsg(addOn.peerType, addOn.msg);
        }
        if(addOn.action == "close text chat") {
            isRemoteModalDismiss = true;
            document.querySelector("#modal-text-chat-link-dismiss").click();
        }

        if(addOn.action == "open web tourist") {
            if(document.querySelector("#modal-web-tourist").offsetWidth > 0
                    && document.querySelector("#modal-web-tourist").offsetHeight > 0) {
            } else {
                document.querySelector("#connection-modal-launch-web-tourist").click();
            }
        }
        if(addOn.action == "stream web tourist") {
            startWebTourist(addOn.stream.streamId);
        }
        if(addOn.action == "close web tourist") {
            isRemoteModalDismiss = true;
            document.querySelector("#modal-web-tourist-link-dismiss").click();
//            webTouristStream.getTracks().forEach(function(track) {
//                track.stop();
//            });
//            webTouristStream.getTracks()[0].stop();

            isWebTouring = false;
            webTouristStream = null;
            screenPeerConnection = null;
            document.querySelector("#modal-web-tourist-share-button").disabled = false;
            document.querySelector("#modal-web-tourist-screenshare").style.display = "none";
            document.querySelector("#modal-web-tourist-extension-section").style.display = "block";
            document.querySelector("#modal-web-tourist-extension-text").style.display = "block";
        }

        if(addOn.action == "open share stuff") {
            if(document.querySelector("#modal-share-stuff").offsetWidth > 0
                    && document.querySelector("#modal-share-stuff").offsetHeight > 0) {
            } else {
                document.querySelector("#connection-modal-launch-share-stuff").click();
            }
        }
        if(addOn.action == "transfer share stuff") {
            shareStuffTransferFileName = addOn.fileName;
            shareStuffTransferFileSize = addOn.fileSize;
        }
        if(addOn.action == "close share stuff") {
            isRemoteModalDismiss = true;
            document.querySelector("#modal-share-stuff-link-dismiss").click();
        }

        if(addOn.action == "pause" || addOn.action == "resume") {
            showRemotePause(addOn.action, true);
        }

    } else {
        receiveIncomingShareStuff(event);
    }

}

function handleDataChannelStateChange(event) {
    var readyState = dataChannel.readyState;
console.log(">>> DATA CHANNEL readyState: " + readyState);
    if(readyState == "open") {
    } else {
    }
}


function getUserMediaError(error) {
    if(error.name.indexOf("PermissionDeniedError") > -1) {
        isMediaPermissionGranted = false;
        //switchToAvatar();
            var ua = navigator.userAgent;
            if(ua.toLowerCase().indexOf("chrome") > -1) {
                if(ua.toLowerCase().indexOf("android") > -1) {
                    document.querySelector("#modal-getUserMedia-image").src = contextLanguageSettings.getusermedia_image_file_chrome_mobile;
                    document.querySelector("#modal-getUserMedia-instruction1").innerText = contextLanguageSettings.getusermedia_instruction_1_chrome_mobile;
                    document.querySelector("#modal-getUserMedia-instruction2").innerText = contextLanguageSettings.getusermedia_instruction_2_chrome_mobile;
                    document.querySelector("#modal-getUserMedia-instruction3").innerText = contextLanguageSettings.getusermedia_instruction_3_chrome_mobile;
                } else {
                    document.querySelector("#modal-getUserMedia-image").src = contextLanguageSettings.getusermedia_image_file_chrome_desktop;
                    document.querySelector("#modal-getUserMedia-instruction1").innerText = contextLanguageSettings.getusermedia_instruction_1_chrome_desktop;
                    document.querySelector("#modal-getUserMedia-instruction2").innerText = contextLanguageSettings.getusermedia_instruction_2_chrome_desktop;
                    document.querySelector("#modal-getUserMedia-instruction3").innerText = contextLanguageSettings.getusermedia_instruction_3_chrome_desktop;
                }
            }
            if(ua.toLowerCase().indexOf("firefox") > -1) {
                if(ua.toLowerCase().indexOf("android") > -1) {
                    document.querySelector("#modal-getUserMedia-image").src = contextLanguageSettings.getusermedia_image_file_firefox_mobile;
                    document.querySelector("#modal-getUserMedia-instruction1").innerText = contextLanguageSettings.getusermedia_instruction_1_firefox_mobile;
                    document.querySelector("#modal-getUserMedia-instruction2").innerText = contextLanguageSettings.getusermedia_instruction_2_firefox_mobile;
                    document.querySelector("#modal-getUserMedia-instruction3").innerText = contextLanguageSettings.getusermedia_instruction_3_firefox_mobile;
                } else {
                    document.querySelector("#modal-getUserMedia-image").src = contextLanguageSettings.getusermedia_image_file_firefox_desktop;
                    document.querySelector("#modal-getUserMedia-instruction1").innerText = contextLanguageSettings.getusermedia_instruction_1_firefox_desktop;
                    document.querySelector("#modal-getUserMedia-instruction2").innerText = contextLanguageSettings.getusermedia_instruction_2_firefox_desktop;
                    document.querySelector("#modal-getUserMedia-instruction3").innerText = contextLanguageSettings.getusermedia_instruction_3_firefox_desktop;
                }
            }
            if(ua.toLowerCase().indexOf("opr") > -1) {
                if(ua.toLowerCase().indexOf("android") > -1) {
                    document.querySelector("#modal-getUserMedia-image").src = contextLanguageSettings.getusermedia_image_file_opera_mobile;
                    document.querySelector("#modal-getUserMedia-instruction1").innerText = contextLanguageSettings.getusermedia_instruction_1_opera_mobile;
                    document.querySelector("#modal-getUserMedia-instruction2").innerText = contextLanguageSettings.getusermedia_instruction_2_opera_mobile;
                    document.querySelector("#modal-getUserMedia-instruction3").innerText = contextLanguageSettings.getusermedia_instruction_3_opera_mobile;
                } else {
                    document.querySelector("#modal-getUserMedia-image").src = contextLanguageSettings.getusermedia_image_file_firefox_desktop;
                    document.querySelector("#modal-getUserMedia-instruction1").innerText = contextLanguageSettings.getusermedia_instruction_1_opera_desktop;
                    document.querySelector("#modal-getUserMedia-instruction2").innerText = contextLanguageSettings.getusermedia_instruction_2_opera_desktop;
                    document.querySelector("#modal-getUserMedia-instruction3").innerText = contextLanguageSettings.getusermedia_instruction_3_opera_desktop;
                }
            }




        if(currentPanel == "connection") {
            document.querySelector("#profile-hidden-modal-getUserMedia").click();
        } else {
            if(localProfile.photo) {
                document.querySelector("#menu-thumbnail-photo").src = localProfile.photo;
                document.querySelector("#menu-thumbnail-nickname").innerText = localProfile.nickname;
            } else {
                document.querySelector("#menu-thumbnail-photo").src = "../images/users/avatar-001.jpg";
                document.querySelector("#menu-thumbnail-nickname").innerText = "Video Peer";
            }
            if(document.querySelector("#connection-local-connected").style.display == "block") {
                disconnectFromNetwork();
            }
        }
    }
}


function checkMediaPermissions() {
    isMediaPermissionGranted = true;
}

function stopMediaStream() {
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localStream = null;
    isRemoteConnected = false;
}

function addICECandidateSuccess() {
    console.log("==> ICE candidate added success <==");
}

function addICECandidateError(error) {
    console.log(error);
}

function createOfferError(error) {
    console.log(error);
}

function createAnswerError(error) {
    console.log(error);
}

function setDescriptionError(error) {
    console.log(error);
}


function updateRemotePeerConnections() {
    remotePeerConnections.forEach(function(remotePeerConnectionObject) {
        if(remotePeerConnectionObject.socketID == mySocketID) {
            remotePeerConnectionObject.peerConnection = peerConnection;
            remotePeerConnectionObject.isConnected = true;
            remotePeerConnectionObject.canMakeAnOffer = true;
        }
    });
console.log("@@@@@@@@ UPDATED REMOTE PEER CONNECTIONS ARRAY: " + JSON.stringify(remotePeerConnections));
}

function isExistingInRemotePeerConnections(socketID) {
    var isExisting = false;
    remotePeerConnections.forEach(function(remotePeerConnectionObject) {
        if(remotePeerConnectionObject.socketID == socketID) isExisting = true;
    });
    return isExisting;
}



function sendOutgoingShareStuff(file) {
    if(file.size === 0) return;
    var chunkSize = 16384;
    var sliceFile = function(offset) {
        var reader = new window.FileReader();
        reader.onload = (function() {
            return function(e) {
                dataChannel.send(e.target.result);
                if(file.size > offset + e.target.result.byteLength) {
                    window.setTimeout(sliceFile, 0, offset + chunkSize);
                }
            };
        })(file);
        var slice = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
}

function receiveIncomingShareStuff(event) {
    shareStuffReceivedSize += event.data.byteLength;
    shareStuffReceiveBuffer.push(event.data);
    if(shareStuffReceivedSize == shareStuffTransferFileSize) {
        var shareStuffFile = new window.Blob(shareStuffReceiveBuffer);
        shareStuffFile.lastModifiedDate = new Date();
        shareStuffFile.name = shareStuffTransferFileName;
        buildShareStuffList(shareStuffFile, true);
        shareStuffTransferFileName = null;
        shareStuffTransferFileSize = 0;
        shareStuffReceivedSize = 0;
        shareStuffReceiveBuffer = [];
    }
}



function sendOutgoingWebTourist(event) {
    dataChannel.send(event);
}



function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function determineObjectType(fileName) {
console.log("fileName in = " + fileName);
    var ext = determineObjectExtension(fileName.toLowerCase());
    if(ext == "bmp") return "img";
    if(ext == "gif") return "img";
    if(ext == "ico") return "img";
    if(ext == "jpg") return "img";
    if(ext == "jpeg") return "img";
    if(ext == "png") return "img";
    if(ext == "svg") return "img";
    if(ext == "tiff") return "img";
    if(ext == "doc") return "object";
    if(ext == "docx") return "object";
    if(ext == "xls") return "object";
    if(ext == "xlsx") return "object";
    if(ext == "ppt") return "object";
    if(ext == "pptx") return "object";
    if(ext == "csv") return "object";
    if(ext == "js") return "object";
    if(ext == "txt") return "object";
    if(ext == "pdf") return "object";
    if(ext == "mov") return "video";
    if(ext == "mp4") return "video";
    if(ext == "mp3") return "audio";
    if(ext == "ogg") return "audio";
    if(ext == "wav") return "audio";
    if(ext == "unknown") return "object";
}

function determineObjectExtension(fileName) {
    var ptr = fileName.lastIndexOf(".");
    if(ptr < fileName.length) {
        return fileName.substr(++ptr, fileName.length);
    } else {
        return "unknown";
    }    
}