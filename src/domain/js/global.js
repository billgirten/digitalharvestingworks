"use strict";

var localProfile = {},
    currentPanel = "start",
    currentProcess = null,
    languageCode = "en",
    contextLanguageSettings = null,
    isRemoteConnected = false,
    isWebTouring = false,
    isJoinRequestAccepted = false,
    isJoinRequestDeclined = false,
    isRemoteHangup = false,
    isRemoteModalDismiss = false,
    isInvitedPeer = false,
    invitationNickname = null,
    remotePeerSocketID = null,
    remotePeerNickname = null,
    remotePeerPhoto = null,
    remotePeerRoom = null,
    remoteVideo = document.querySelector("#connection-remote-video"),
    meConnectedLocalVideo = document.querySelector("#connection-local-video"),
    remoteVideoSmall = document.querySelector("#modal-web-tourist-remote-video"),
    localVideoSmall = document.querySelector("#modal-web-tourist-local-video"),
    remoteChatVideoSmall = document.querySelector("#modal-text-chat-remote-video"),
    localChatVideoSmall = document.querySelector("#modal-text-chat-local-video"),
    remoteShareVideoSmall = document.querySelector("#modal-share-stuff-remote-video"),
    localShareVideoSmall = document.querySelector("#modal-share-stuff-local-video"),
    dataChannel = null;