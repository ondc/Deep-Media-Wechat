var Project = require("../../api/project.js");

module.exports = function (req, res, callback) {
  var User = require("../../api/user.js");
  Project.getProjects(function (result) {
      callback({
          "projects": result
      });
  });
}
