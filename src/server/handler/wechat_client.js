var request = require("request");
var config = require("../data/config.json");
var Wechat = require("../api/wechat.js");
var User = require("../api/user.js");
var Actor = require("../api/actor.js");
var Project = require("../api/project.js");

module.exports = {
    grant_credential: function (req, res) {
        if (req.body["code"]) {
            var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + config["wechat_appid"] + "&secret=" + config["wechat_appsecret"] + "&code=" + req.body["code"] + "&grant_type=authorization_code";
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if (!data["errcode"]) {
                        res.success(data);
                    }
                    else {
                        res.error(data["errcode"], data["errmsg"]);
                    }
                }
                else {
                    res.error(2, "Weixin API Error");
                }
            });
        }
        else {
            res.error(1, "Must Specify CODE");
        }
    },
    get_uuid: function (req, res) {
        if (req.body["open_id"]) {
            User.getUUID(req.body["open_id"], function (UUID) {
                if (UUID) {
                    res.success({
                        "UUID": UUID
                    })
                }
                else {
                    res.error(2, "This open_id does not exists");
                }
            });
        }
        else {
            res.error(1, "Must Specify openid");
        }
    },
    get_user_info: function (req, res) {
        if (req.body["open_id"]) {
            User.existOpenId(req.body["open_id"], function (exists) {
                if (exists) {
                    User.getUserInfoByOpenId(req.body["open_id"], function (info) {
                        if (info) {
                            User.hasActorInfo(info["UUID"], function (has) {
                                if (has) {
                                    Actor.getInfo(info["UUID"], function (actor) {
                                        if (actor) {
                                            for (var i in actor) {
                                                info[i] = actor[i];
                                            }
                                            res.success(info);
                                        }
                                        else {
                                            res.error(4, "Database error on actor info");
                                        }
                                    })
                                }
                                else {
                                    res.error(-1, "No Actor Information");
                                }
                            })
                        }
                        else {
                            res.error(3, "Database error on UUID");
                        }
                    })
                }
                else {
                    res.error(2, "User does not exist");
                }
            })
        }
        else {
            res.error(1, "Must Specify open_id");
        }
    },
    update_user_info: function (req, res) {
        if (req.body["open_id"]) {
            User.existOpenId(req.body["open_id"], function (exists) {
                if (exists) {
                    User.getUUID(req.body["open_id"], function (UUID) {
                        if (UUID) {
                            User.hasActorInfo(UUID, function (has) {
                                if (has) {
                                    Actor.updateActor(UUID, req.body["name"], req.body["sex"], req.body["email"], req.body["phone"], req.body["role"], req.body["recommender"], req.body["intro"], req.body["image"], function (success) {
                                        if (success) {
                                            console.log("yeah^2")
                                            res.success({});
                                        }
                                        else {
                                            console.log("5")
                                            res.error(4, "Database error when inserting actor info");
                                        }
                                    });
                                }
                                else {
                                    Actor.newActor(UUID, req.body["name"], req.body["sex"], req.body["email"], req.body["phone"], req.body["role"], req.body["recommender"], req.body["intro"], req.body["image"], function (success) {
                                        if (success) {
                                            console.log("yeah")
                                            res.success({});
                                        }
                                        else {
                                            console.log("4")
                                            res.error(4, "Database error when inserting actor info");
                                        }
                                    });
                                }
                            })
                        }
                        else {
                            console.log("3")
                            res.error(3, "Database error on UUID");
                        }
                    });
                }
                else {
                    console.log("2")
                    res.error(2, "User does not exist")
                }
            });
        }
        else {
            console.log("1")
            res.error(1, "Must Specify OPEN_ID");
        }
    },
    get_user_info_uri: function (req, res) {
        res.success({
            "uri": Wechat.menu.button[2].sub_button[0].url
        });
    },
    get_apply_uri: function (req, res) {
        res.success({
            "uri": Wechat.menu.button[2].sub_button[1].url
        });
    },
    get_project_uri: function (req, res) {
        res.success({
            "uri": Wechat.menu.button[2].sub_button[2].url
        });
    },
    get_client_project: function (req, res) {
        if (req.body["UUID"]) {
            Project.getClientProject(req.body["UUID"], function (projects) {
                if (projects) {
                    if (projects.length > 0) {
                        res.success(projects);
                    }
                    else {
                        res.error(3, "您当前没有任何正在进行的项目");
                    }
                }
                else {
                    res.error(2, "Database Error");
                }
            })
        }
        else {
            res.error(1, "Must specify UUID");
        }
    },
    get_project: function (req, res) {
        if (req.body["PUID"]) {
            Project.getProjectInfo(req.body["PUID"], function (project) {
                Project.getProgress(req.body["PUID"], function (progress) {
                    if (project && progress) {
                        project["start_date_time"] = project["start_date_time"].toDateString();
                        for (var i = 0; i < progress.length; i++) {
                            progress[i]["date_time"] = progress[i]["date_time"].toDateString();
                        }
                        res.success({
                            "project": project,
                            "progress": progress
                        });
                    }
                    else {
                        res.error(2, "Database Error");
                    }
                });
            })
        }
        else {
            res.error(1, "Must specify PUID");
        }
    }
}
