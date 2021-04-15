var app = require("express")(),
    fs = require("fs"),
    sslOptions = {},
    server =null,
    io = null,
    nodemailer = require('nodemailer'),
    najax = require("najax"),
    MongoClient = require("mongodb").MongoClient,
    mongoDBtelawireURL = "mongodb://localhost:27017/telawire",
    HTMLResponseHeader = {"Content-Type": "text/html", "Access-Control-Allow-Origin":"*"},
    JSONResponseHeader = {"Content-Type": "application/json", "Access-Control-Allow-Origin":"*"},
    mongoCleanupInterval = null,
    telawireDB = null,
    dateTimeEpoch = null,
    platform = process.env.PLATFORM;


// sslOptions = {
//     key : fs.readFileSync('/etc/httpd/conf/ssl.key/www_videopeers_net.key'),
//     cert : fs.readFileSync('/etc/httpd/conf/ssl.crt/www_videopeers_net.crt')
// };
// server = require("https").createServer(sslOptions, app);
server = require("http").createServer(app);
io = require("socket.io")(server);


// MongoClient.connect(mongoDBtelawireURL, {server: {poolSize: 1}}, function(err, db) {
//     if(err) {
//         console.log("Unable to connect to the mongoDB server. Error:", err);
//     } else {
//         telawireDB = db;
//         console.log("telawire DB is ready");
//     }
// });


server.listen(10913);
console.log("signaling server listening on port 10913");


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/images/favicons/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/images/favicons/favicon.ico");
  });

app.get("/images/favicons/favicon.png", function (req, res) {
  res.sendFile(__dirname + "/images/favicons/favicon.png");
});

app.get("/images/favicons/favicon-16x16.png", function (req, res) {
    res.sendFile(__dirname + "/images/favicons/favicon-16x16.png");
});

app.get("/images/favicons/favicon-32x32.png", function (req, res) {
    res.sendFile(__dirname + "/images/favicons/favicon-32x32.png");
});

app.get("/images/favicons/favicon-96x96.png", function (req, res) {
    res.sendFile(__dirname + "/images/favicons/favicon-96x96.png");
});
      
app.get("/images/promise.jpg", function (req, res) {
    res.sendFile(__dirname + "/images/promise.jpg");
});
      
app.get("/images/wheat.jpg", function (req, res) {
    res.sendFile(__dirname + "/images/wheat.jpg");
});
        
app.get("/images/splash.png", function (req, res) {
  res.sendFile(__dirname + "/images/splash.png");
});

app.get("/images/background.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/background.jpg");
});

app.get("/images/spinlogo.gif", function (req, res) {
  res.sendFile(__dirname + "/images/spinlogo.gif");
});

app.get("/images/profile_top.png", function (req, res) {
  res.sendFile(__dirname + "/images/profile_top.png");
});

app.get("/images/profile_deer.png", function (req, res) {
  res.sendFile(__dirname + "/images/profile_deer.png");
});

app.get("/images/profile_sail.png", function (req, res) {
  res.sendFile(__dirname + "/images/profile_sail.png");
});

app.get("/images/profile_hills.png", function (req, res) {
  res.sendFile(__dirname + "/images/profile_hills.png");
});

app.get("/images/webtouristextension.png", function (req, res) {
  res.sendFile(__dirname + "/images/webtouristextension.png");
});

app.get("/images/ads/footerAd1.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/ads/footerAd1.jpg");
});

app.get("/images/ads/footerAd2.png", function (req, res) {
  res.sendFile(__dirname + "/images/ads/footerAd2.png");
});

app.get("/images/ads/footerAd3.png", function (req, res) {
  res.sendFile(__dirname + "/images/ads/footerAd3.png");
});

app.get("/images/ads/footerAd4.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/ads/footerAd4.jpg");
});

app.get("/images/ads/footerAd5.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/ads/footerAd5.jpg");
});

app.get("/css/base.css", function (req, res) {
  res.sendFile(__dirname + "/css/base.css");
});

app.get("/css/project.css", function (req, res) {
  res.sendFile(__dirname + "/css/project.css");
});

// * @if NODE_ENV="net" */
app.get("/js/index.js", function (req, res) {
  res.sendFile(__dirname + "/js/index.js");
});
// * @endif */

// * @if NODE_ENV="debug" */
app.get("/js/base.js", function (req, res) {
  res.sendFile(__dirname + "/js/base.js");
});

app.get("/js/adapter.js", function (req, res) {
  res.sendFile(__dirname + "/js/adapter.js");
});

app.get("/js/global.js", function (req, res) {
  res.sendFile(__dirname + "/js/global.js");
});

app.get("/js/project.js", function (req, res) {
  res.sendFile(__dirname + "/js/project.js");
});

app.get("/js/webrtc.js", function (req, res) {
  res.sendFile(__dirname + "/js/webrtc.js");
});
// * @endif */

app.get("/images/hare-green-36.gif", function (req, res) {
  res.sendFile(__dirname + "/images/hare-green-36.gif");
});

app.get("/images/tortoise-red-36.gif", function (req, res) {
  res.sendFile(__dirname + "/images/tortoise-red-36.gif");
});

app.get("/images/users/avatar-001.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/users/avatar-001.jpg");
});

app.get("/images/samples/portrait.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/samples/portrait.jpg");
});

app.get("/images/samples/portrait.png", function (req, res) {
  res.sendFile(__dirname + "/images/samples/portrait.png");
});

app.get("/images/desktop_chrome_multimedia.png", function (req, res) {
  res.sendFile(__dirname + "/images/desktop_chrome_multimedia.png");
});

app.get("/images/desktop_firefox_multimedia.png", function (req, res) {
  res.sendFile(__dirname + "/images/desktop_firefox_multimedia.png");
});

app.get("/images/desktop_opera_multimedia.png", function (req, res) {
  res.sendFile(__dirname + "/images/desktop_opera_multimedia.png");
});

app.get("/images/mobile_chrome_multimedia.png", function (req, res) {
  res.sendFile(__dirname + "/images/mobile_chrome_multimedia.png");
});

app.get("/images/mobile_firefox_multimedia.png", function (req, res) {
  res.sendFile(__dirname + "/images/mobile_firefox_multimedia.png");
});

app.get("/images/mobile_opera_multimedia.png", function (req, res) {
  res.sendFile(__dirname + "/images/mobile_opera_multimedia.png");
});

app.get("/css/fonts/MaterialDesignIcon.woff", function (req, res) {
  res.sendFile(__dirname + "/css/fonts/MaterialDesignIcon.woff");
});

app.get("/css/fonts/MaterialDesignIcon.woff", function (req, res) {
  res.sendFile(__dirname + "/css/fonts/MaterialDesignIcon.ttf");
});

app.get("/images/samples/landscape.jpg", function (req, res) {
  res.sendFile(__dirname + "/images/samples/landscape.jpg");
});

app.get("/audio/chimes.mp3", function (req, res) {
  res.sendFile(__dirname + "/audio/chimes.mp3");
});

app.get("/audio/wand.wav", function (req, res) {
  res.sendFile(__dirname + "/audio/wand.wav");
});

app.get("/geti18nStuff", function (req, res) {
    var requestedLanguageCode = req.param("langcode");
    var languageSet = {};
    var i18nCollection = telawireDB.collection("i18n");
    i18nCollection.find({"langcode":requestedLanguageCode}).toArray(function (err, results) {
        if(err) {
            console.log(err);
        } else {
            if(results.length) {
                for(x = 0; x < results.length; x++) {
                    languageSet = results[x].data;
                }
            }
        }
        res.writeHead(200, JSONResponseHeader);
        res.write(JSON.stringify(languageSet));
        res.end();
    });
});

app.get("/getLegalInfo", function (req, res) {
    var legalInfo = {};
    var legalCollection = telawireDB.collection("legal");
    legalCollection.find({},{_id:0}).toArray(function (err, results) {
        if(err) {
            console.log(err);
        } else {
            if(results.length) {
                legalInfo.terms = results[0].terms;
                legalInfo.privacy = results[1].privacy;
            }
        }
        res.writeHead(200, JSONResponseHeader);
        res.write(JSON.stringify(legalInfo));
        res.end();
    });
});


app.post('/sitepost', function(req, res, next) {
    var msg = null,
        transporter = nodemailer.createTransport("SMTP", {  
        host: "smtp.emailsrvr.com",
        port: 587,
        secureConnection: false,                    
        auth: {
            user: "bxgirten@telawire.com",
            pass: "Sapphir30!"
        }
    });
    msg = req.body.message + "\n\n- " + req.body.name;
    transporter.sendMail({
        from: "bxgirten@telawire.com",
        to: "jharris@telawire.com",
        cc: "bxgirten@telawire.com",
        bcc: "sagirten@gmail.com",
        subject: "Comments from a videopeers.info visitor",
        generateTextFromHTML: false,
        text: msg,
    }, function(error, response){
           if(error){
                console.log(error);
           } else {
                console.log("Message sent: " + req.body.message);
           }
    });
    res.writeHead(200, HTMLResponseHeader);
    res.end();
});


app.get("/getVideoPeersStatsDaily", function (req, res) {
    var vpStatsData = "[";
    //var vpStatsData = [['English', 3],['French', 1],['German', 1],['Spanish', 2]];
    var vpStatsCollection = telawireDB.collection("videopeersstats");
    var chartDataSwitch = 0;
    if(req.param("sw")) chartDataSwitch = parseInt(req.param("sw"));

    switch(chartDataSwitch) {

        case 0:
            vpStatsCollection.aggregate([{"$group": {"_id": { "languages": { "languageCode": "$profile.languageCode" }}, count: { $sum: 1 }}},{$sort: {"_id.languages.languageCode":1}}]).toArray(function (err, results) {
                if(err) {
                    console.log(err);
                } else {
                    if(results.length) {
                        for(x = 0; x < results.length; x++) {
                            if(x === 0) {
                                vpStatsData += "[";
                            } else {
                                vpStatsData += ",[";
                            }
                            if(results[x]._id.languages.languageCode == "de") vpStatsData += '"German", ' + results[x].count + ']';
                            if(results[x]._id.languages.languageCode == "en") vpStatsData += '"English", ' + results[x].count + ']';
                            if(results[x]._id.languages.languageCode == "fr") vpStatsData += '"French", ' + results[x].count + ']';
                            if(results[x]._id.languages.languageCode == "sp") vpStatsData += '"Spanish", ' + results[x].count + ']';
                        }
                        vpStatsData += "]";
                        res.writeHead(200, JSONResponseHeader);
                        res.write(vpStatsData);
                        res.end();
                    }
                }
            });
            break;

        case 1:
            vpStatsCollection.aggregate([{$group : {_id : { "ageRange": "$profile.ageRange" }, count: { $sum: 1 }}},{$sort: {"_id.ageRange":1}}]).toArray(function (err, results) {
                if(err) {
                    console.log(err);
                } else {
                    if(results.length) {
                        for(x = 0; x < results.length; x++) {
                            if(x === 0) {
                                vpStatsData += "[";
                            } else {
                                vpStatsData += ",[";
                            }
                            if(null === results[x]._id.ageRange) vpStatsData += '"Unspecified", ' + results[x].count + ']';
                            if(results[x]._id.ageRange == "17") vpStatsData += '"< 18", ' + results[x].count + ']';
                            if(results[x]._id.ageRange == "25") vpStatsData += '"18 - 25", ' + results[x].count + ']';
                            if(results[x]._id.ageRange == "34") vpStatsData += '"26 - 34", ' + results[x].count + ']';
                            if(results[x]._id.ageRange == "50") vpStatsData += '"35 - 50", ' + results[x].count + ']';
                            if(results[x]._id.ageRange == "501") vpStatsData += '"> 50", ' + results[x].count + ']';
                        }
                        vpStatsData += "]";
console.log(vpStatsData);
                        res.writeHead(200, JSONResponseHeader);
                        res.write(vpStatsData);
                        res.end();
                    }
                }
            });
            break;
    }
});


io.sockets.on("connection", function(socket) {
    socket.on("create or join", function (room, profile) {
        var numClients = roomCount(io.sockets.adapter.rooms[room]);
                
        console.log("Room " + room + " has " + numClients + " client(s)");

        if(numClients === 0) {
console.log("Request to create room " + room);
            socket.join(room);
            console.log("room " + room + " has " + (numClients + 1) + " client");

            var videoPeersCollection = telawireDB.collection("videopeers");
console.log("inserting = " + profile.nickname);
            videoPeersCollection.find({"room":room, "profile.nickname":profile.nickname}).toArray(function (err, results) {
                if(err) {
                    console.log(err);
                } else if (results.length) {
                    // console.log("Document(s) found: ", results);
                    console.log("connection::Document(s) found");
                } else {
                    console.log("No document(s) found");
                    dateTimeEpoch = Math.floor(Date.now() / 1000);
console.log(">>> new socketID = " + socket.id + " started " + dateTimeEpoch);
                    videoPeersCollection.insert({"room":room, "socketID":socket.id,  "profile":profile, "beginStamp":dateTimeEpoch}, function (err, results) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("Document(s) inserted into videoPeersCollection:", results.result.n);
                        }
                    });
                    socket.emit("created", room, socket.id);
                }
            });
        } else {
console.log("Request to join room " + room);
            socket.join(room);
            console.log("room " + room + " has " + (numClients + 1) + " clients");
            socket.emit("joined", room, socket.id);
        }
    });


    socket.on("manifest", function(room) {
            var manifest = buildRoomManifest(io.sockets.adapter.rooms[room]);
            io.sockets.in(room).emit("manifest", JSON.stringify(manifest));
    });


    socket.on("find video peers", function(searchData) {
console.log(">>> INSIDE OF find video peers" + searchData);
        var searchObj = JSON.parse(searchData);
        var localNickname = searchObj.localNickname;
        var room = searchObj.room;

        var videoPeersCollection = telawireDB.collection("videopeers");
// CREATE A DYNAMIC, BUILDABLE STRING TO PERFORM A FIND
        var searchCriteria = '{';
        if(searchObj.remoteNickname) {
            //searchCriteria += '"profile.nickname":' + '\/\^' + searchObj.remoteNickname + '\$\/i';
            searchCriteria += '"profile.nickname":' + '"' + searchObj.remoteNickname + '"';
        }
        if(searchObj.language) {
            if(searchCriteria.length == 1) {
                searchCriteria += '"profile.nativeLanguage":' + '"' + searchObj.language + '"';
            } else {
                searchCriteria += ', "profile.nativeLanguage":' + '"' + searchObj.language + '"';
            }
        }
        searchCriteria += '}';
console.log(searchCriteria);
        var jsonSearchCriteria = JSON.parse(searchCriteria);
        videoPeersCollection.find(jsonSearchCriteria).sort({"profile.nickname":1}).toArray(function (err, results) {
            if(err) {
                console.log(err);
            } else {
                var leanPeersArray = [];
                if(results.length) {
                    console.log("find video peers::Document(s) found: ", results.length);
                    if(searchCriteria != "{}") {
                        for(x = 0; x < results.length; x++) {
console.log("*** POPULATE ***");
                            var leanPeers = {};
                            leanPeers.room = results[x].room;
                            leanPeers.socketID = results[x].socketID;
                            leanPeers.profile = results[x].profile;
                            leanPeersArray[x] = leanPeers;                                
                        }
                    } else {
console.log("*** BAILING ***");
                        //send back empty results array
                    }
                }
                socket.emit("find video peers results", leanPeersArray);
            }
        });

    });


    socket.on("video chat request", function(socketID, requestorNickname, requestorPhoto, requestorRoom, requestorSocketID) {
console.log(">>> ABOUT TO INVITE socketID " + socketID + " TO CHAT WITH socketID", requestorSocketID);
        var videoPeersCollection = telawireDB.collection("videopeers");
        videoPeersCollection.find({"room": requestorRoom, "profile.nickname":requestorNickname}).toArray(function (err, results) {
            if(err) {
                console.log(err);
            } else if (results.length) {
                console.log("Document(s) found");
            } else {
                console.log("No document(s) found");
            }
            var decoratedResults = results[0];
            decoratedResults.profile.photo = requestorPhoto;
            io.to(socketID).emit("video chat request", decoratedResults);
        });
    });


    socket.on("dismiss video chat request", function(socketID) {
console.log(">>> ABOUT TO DISMISS CHAT REQUEST FOR socketID", socketID);
            io.to(socketID).emit("dismiss video chat request");
    });


    socket.on("accept video chat request", function(socketID) {
console.log(">>> ABOUT TO ACCEPT VIDEO CHAT REQUEST FOR room", socketID);
        io.sockets.in(room).emit("accept join peer request");
    });


    socket.on("decline video chat request", function(socketID) {
console.log(">>> ABOUT TO DECLINE VIDEO CHAT REQUEST FOR socketID", socketID);
            io.to(socketID).emit("decline video chat request");
    });


    socket.on("connect incoming peer", function(room, incomingNickname, incomingPhoto, incomingSocketID, queuePosition) {
        console.log("room = " + room + ", incomingSocketID = " + incomingSocketID + ", queuePosition = " + queuePosition);
        var existingPeersInThisRoom = buildRoomManifest(io.sockets.adapter.rooms[room]);
console.log("existing peers in this room =", existingPeersInThisRoom);
        if(queuePosition < existingPeersInThisRoom.length) {
            if(existingPeersInThisRoom[queuePosition] !== incomingSocketID) {
                console.log("SOCKET " + existingPeersInThisRoom[queuePosition] + " TO INVITE INCOMING PEER " + incomingSocketID);
                io.to(existingPeersInThisRoom[queuePosition]).emit("connect incoming peer",
                                         JSON.stringify({"canOfferSocketID":existingPeersInThisRoom[queuePosition],
                                                         "canAnswerNickname":incomingNickname,
                                                         "canAnswerPhoto":incomingPhoto,
                                                         "canAnswerSocketID":incomingSocketID,
                                                         "queuePosition":queuePosition,
                                                         "currentNumberOfPeers":existingPeersInThisRoom.length}));
                io.to(incomingSocketID).emit("connect incoming peer",
                                         JSON.stringify({"canOfferSocketID":existingPeersInThisRoom[queuePosition],
                                                         "canAnswerNickname":incomingNickname,
                                                         "canAnswerPhoto":incomingPhoto,
                                                         "canAnswerSocketID":incomingSocketID,
                                                         "queuePosition":queuePosition,
                                                         "currentNumberOfPeers":existingPeersInThisRoom.length}));
            }
        }
    });


    socket.on("message", function(message) {
console.log(">>> GOT A PLAIN MESSAGE");
        socket.broadcast.emit("message", message);
    });


    socket.on("private socket message", function(socketID, message) {
console.log(">>> GOT A PRIVATE MESSAGE FOR SOCKET " + socketID);
            io.to(socketID).emit("message", message);
    });


    socket.on("WebTourist socket message", function(socketID, message) {
console.log(">>> GOT A WEB TOURIST MESSAGE FOR SOCKET " + socketID);
            io.to(socketID).emit("webtourist message", message);
    });


    socket.on("exit room", function(nickname, room) {
console.log(">>> " + nickname + " IS EXITING ROOM " + room);
        var videoPeersCollection = telawireDB.collection("videopeers");
        videoPeersCollection.find({"room":room, "profile.nickname":nickname}).toArray(function (err, results) {
            if(err) {
                console.log(err);
            } else if (results.length) {
                console.log("Document(s) found for removal");
                dateTimeEpoch = Math.floor(Date.now() / 1000);
                captureVideoPeersStats(results[0].socketID,
                                       results[0].beginStamp,
                                       dateTimeEpoch,
                                       results[0].profile);
                videoPeersCollection.remove({"room": room, "profile.nickname":nickname}, function (err, results) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("Document(s) removed from videoPeersCollection:", results.result.n);
                        // BEFORE - console.log(io.sockets.adapter.rooms);
                        socket.leave(room);
                        // AFTER - console.log(io.sockets.adapter.rooms);
                    }
                });
            }
        });
    });


    socket.on("exit room for remote", function(remoteSocketID) {
        if(null !== remoteSocketID) {
console.log(">>> forcing " + remoteSocketID + " TO EXIT ROOM");
            io.to(remoteSocketID).emit("force local hangup");
        }
    });


    clearInterval(mongoCleanupInterval);
    mongoCleanupInterval = setInterval(function() {
        mongoCleanup();
    }, 5000);


    function mongoCleanup() {
        var roomManifest = null;

        var videoPeersCollection = telawireDB.collection("videopeers");
        videoPeersCollection.find({}).toArray(function (err, results) {
            if(err) {
                console.log(err);
            } else {
                if(results.length) {
                    for(x = 0; x < results.length; x++) {
                        roomManifest = io.sockets.adapter.rooms[results[x].room];
                        if(roomManifest == undefined) {
console.log(">>> orphan(s) found");
                            dateTimeEpoch = Math.floor(Date.now() / 1000);
                            captureVideoPeersStats(results[0].socketID,
                                                   results[0].beginStamp,
                                                   dateTimeEpoch,
                                                   results[0].profile);
                            videoPeersCollection.remove({"room": results[x].room}, function (err, results) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log(">>> orphans(s) removed from videoPeersCollection:", results.result.n);
                                }
                            });
                        }
                    }
                }
            }
        });
    }

    function captureVideoPeersStats(socketID, beginStamp, endStamp, profile) {
        delete profile.nickname;
        delete profile.photo;
        var videoPeersStats = telawireDB.collection("videopeersstats");
console.log(">>> stats captured");
        videoPeersStats.insert({"logged":endStamp, "socketID":socketID,  "beginStamp":beginStamp, "endStamp":endStamp, "profile":profile}, function (err, results) {
            if(err) {
                console.log(err);
            } else {
                console.log("Document(s) inserted into videoPeersStats:", results.result.n);
            }
        });
    }

    function roomCount(room) {
        localCount = 0;
        if(room) {
            for(var id in room) {
                localCount ++;
            }
        }
        return localCount;
    }

    function buildRoomManifest(room) {
        var roomManifest = [];
        if(room) {
            for(var id in room) {
                roomManifest.push(id);
            }
        }
        return roomManifest;
    }

});