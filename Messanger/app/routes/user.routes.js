const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get( "/api/test/all"    , controller.allAccess);
  app.get( "/api/test/user"   , [authJwt.verifyToken], controller.userBoard);
  app.get( "/api/v1/groups"   , [authJwt.verifyToken], controller.getGroups);
  app.get( "/api/v1/groups/my", [authJwt.verifyToken], controller.getMyGroup);
  app.post("/api/v1/groups"   , [authJwt.verifyToken], controller.createGroup);

  app.post("/api/v1/join_requests"        ,[authJwt.verifyToken],controller.sendJoinRequest);
  app.get("/api/v1/join_requests"         ,[authJwt.verifyToken],controller.getMyJoinRequests);
  app.get("/api/v1/join_requests/group"   ,[authJwt.verifyToken],controller.getGroupJoinRequests);
  app.post("/api/v1/join_requests/accept" ,[authJwt.verifyToken],controller.acceptJoinRequest);
};