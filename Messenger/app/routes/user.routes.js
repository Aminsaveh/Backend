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



  app.post("/api/v1/connection_requests"         ,[authJwt.verifyToken],controller.sendConnectionRequest);
  app.get("/api/v1/connection_requests"          ,[authJwt.verifyToken],controller.getConnectionRequests);
  app.post("/api/v1/connection_requests/accept"  ,[authJwt.verifyToken],controller.acceptConnectionRequest);

  app.get("/api/v1/chats" ,    [authJwt.verifyToken] ,controller.getChats);
  app.get("/api/v1/chats/:user_id",   [authJwt.verifyToken],controller.getMessages);
  app.post("/api/v1/chats/:user_id" ,    [authJwt.verifyToken] ,controller.sendMessage);



};