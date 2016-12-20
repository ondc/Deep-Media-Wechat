var Wechat = require("../api/wechat.js");
var User = require("../api/user.js");
var xml2js = require("xml2js");
var parseXml = xml2js.parseString;
var toXml = new xml2js.Builder().buildObject;

module.exports = {
    process: function (req, res) {
        
        var rawbody = "";
        
        req.on("data", function (data) {
            rawbody += data;
        });
        
        req.on("end", function () {
            
            if (req.method == "GET") {
                
                console.log("Verifying");
                
                if (Wechat.verify(req.query["signature"], req.query["timestamp"], req.query["nonce"])) {
                    res.write(req.query["echostr"]);
                }
                res.end();
            }
            else if (req.method == "POST") {
                
                console.log("RECEIVED MESSAGE!!!");
                console.log(rawbody);
                
                parseXml(rawbody, function (err, result) {
                    if (err) {
                        
                        console.log(err);
                        
                        res.end();
                    }
                    else {
                        
                        console.log(result);
                        
                        switch (result.MsgType) {
                        case "text":
                            var content = result.Content;
                            var openId = result.FromUserName;
                            var reply = {
                                "ToUserName": openId,
                                "FromUserName": config["wechat_id"],
                                "CreateTime": (new Date()).getTime(),
                                "MsgType": "text",
                                "Content": "你个傻逼"
                            }
                            var xml = toXml(reply);
                            res.write(xml);
                            res.end();
                            break;
                        case "event":
                            switch (result.Event) {
                            case "subscribe":
                                var openId = result.FromUserName;
                                User.newUser(openId, function (info) {
                                    if (info) {
                                        res.write(info["nickname"] + "，感谢您的关注～您可以点击下方的菜单查看我们的原创作品");
                                    }
                                    res.end();
                                });
                                break;
                            case "unsubscribe":
                                res.end();
                                break;
                            case "CLICK":
                                switch (result.EventKey) {
                                    case "": break;
                                }
                                break;
                            }
                            break;
                        }
                    }
                });
            }
            else {
                res.end();
            }
        })
        
    }
}
