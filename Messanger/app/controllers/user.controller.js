const res = require("express/lib/response");
const { user, group } = require("../models");
const db = require("../models");
const { JoinRequest } = require("../models/joinRequest.model");
const { Member } = require("../models/member.model");
const User = db.user;
const Group = db.group;
const Counters = db.counters;


function getNextSequence(name, callback) {
  Counters.Counters.findOneAndUpdate({ id: name },  { $inc: { seq: 1 } }, function(err, result){
          if(err) callback(err, result);
          if(result){
            callback(err, result.seq);
          }else{
            var counter = new Counters.Counters({
                id: name,
                seq : 2,
            });
            counter.save(err,res => {
              if(err)callback(err, result);
              callback(err, 1);
            });
          }
       
  });

 
}
  
  exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
  };
  exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
  };
  exports.getGroups = (req,res) =>{
      Group.find({},function(err,allGroups){
        if(err){
          res.status(400).send({
            error: {
                message : "Bad request!"
            }});
            return;
        }
        var groups=[];
        allGroups.forEach(group => {
          var group = { id: group.id.toString(), name: group.name, description:group.description};
          groups.push(group);
        });
        res.status(200).send({
          groups
        });
      });

  }



  exports.createGroup = (req,res) =>{
    var currentUser = null;
    User.User.findOne({id:req.userId}).exec(function (err, user) {
      currentUser = user;
      if (user){
        if(user.groupId){
          res.status(400).send({
          error: {
              message : "Bad request!"
          }});
         return;
        }else{
          Group.findOne({
            name: req.body.name
          }).exec((err, group) => {
              if(group){
                res.status(400).send({
                  error: {
                      message : "Bad request!"
                  }});
              }
              else{
                getNextSequence("groupId", function(err, result){
                  if(!err){
                    const group = new Group({
                      id : result,
                      name: req.body.name,
                      description: req.body.description,
                    });
                    const member = new Member({
                      id : currentUser.id.toString(),
                      name : currentUser.name,
                      email : currentUser.email,
                      rule : "owner"
                    })
                    group.members.push(member);
    
                    group.save((err, result) => {
                      var groupResult = result;
                      if (err) {
                          res.status(400).send({
                              error: {
                                  message : "Bad request!"
                              }});
                        return;
                      }
                      user.updateOne({groupId:result.id.toString()},(err, result) => {
                        if (err) {
                            res.status(400).send({
                                error: {
                                    message : "Bad request!"
                                }});
                          return;
                        }
                        res.status(200).send({
                          group : {
                              id : groupResult.id.toString()
                          },
                          message : "successful"
                        });
                      });
                  });
                  }else{
                    res.status(400).send({
                      error: {
                          message : "Bad request!"
                      }});
                return;
                  }
                });
               
            }
          });
        }
      }
      else
       res.status(400).send({
          error: {
              message : "Bad request!"
          }});
    });
  }



  exports.getMyGroup = (req,res) =>{
    User.User.findOne({id:req.userId}).exec(function (err, user) {
        if(user){
            if(user.groupId){
                Group.findOne({id:user.groupId}).exec(function(err,group)
                {
                  if(group){
                    res.status(200).send({
                      group
                    });
                    return;

                  }else{
                    res.status(400).send({
                      error: {
                          message : "Bad request!"
                      }});
      
                  }
                  return;
                });

            }else{
              res.status(400).send({
                error: {
                    message : "Bad request!"
                }});
                return;

            }
        }else{
          res.status(400).send({
            error: {
                message : "Bad request!"
            }});
            return;
        }
    });
}


exports.sendJoinRequest= (req,res) =>{
  User.User.findOne({id:req.userId}).exec(function (err, user) {
      if(user){
          if(user.groupId){
            res.status(400).send({
              error: {
                  message : "Bad request!"
              }});
              return;

          }else{
            Group.findOne({id : req.body.groupId}).exec(function(err,group){
              if(group){
                  if(group.joinRequests.filter(r => r.id === user.id.toString()).length > 0){
                    res.status(400).send({
                      error: {
                          message : "Bad request!"
                      }});
                      return;
                  }
                  getNextSequence("joinRequestId", function(err, result){
                  const joinRequest = new JoinRequest({
                      id      : result,
                      groupId : group.id,
                      userId  : user.id,
                      date    : Date.now
                  });
                  group.joinRequests.push(joinRequest);
                  group.save((err, result) => {  
                      if(err){
                        res.status(400).send({
                          error: {
                              message : "Bad request!"
                          }});
                        return;
                      }
                      user.joinRequests.push(joinRequest);
                      user.updateOne({joinRequests : user.joinRequests},(err,result) => {
                        if(err){
                          res.status(400).send({
                            error: {
                                message : "Bad request!"
                            }});
                          return;
                        }
                        res.status(200).send({
                          message : "successful"
                        });
                        return;
                      });



                     
                   });
                });
              }else{
                res.status(400).send({
                  error: {
                      message : "Bad request!"
                  }});
                  return;
              }
          });
          }
      }else{
        res.status(400).send({
          error: {
              message : "Bad request!"
          }});
          return;
      }
  });
}


exports.getMyJoinRequests  = (req,res) => {
  User.User.findOne({id:req.userId}).exec(function (err, user) {
    if(user){
      res.status(200).send({
        joinRequests :  user.joinRequests
      });
        return;
      }else{
        res.status(400).send({
          error: {
              message : "Bad request!"
          }});
          return;
      }
    });
}

exports.getGroupJoinRequests = (req,res) =>{
  User.User.findOne({id : req.userId}).exec(function (err,user){
    if(user){
        if(user.groupId){
            Group.findOne({id : user.groupId}).exec(function (err,group){
                if(group){
                  var member = group.members.find(m => m.id === user.id);
                  if(member){
                    if(member.rule === "owner"){
                      res.status(200).send({
                        joinRequests : group.joinRequests
                      });
                        return;
                    }else{
                      res.status(400).send({
                        error: {
                            message : "Bad request!"
                        }});
                        return;
                    }
                  }else{
                    res.status(400).send({
                      error: {
                          message : "Bad request!"
                      }});
                      return;
                  }
                }else{
                  res.status(400).send({
                    error: {
                        message : "Bad request!"
                    }});
                    return;

                }
            });
        }else{
          res.status(400).send({
            error: {
                message : "Bad request!"
            }});
            return;
        }
    }
    else{
        res.status(400).send({
          error: {
              message : "Bad request!"
          }});
          return;
      }



  });
}


exports.acceptJoinRequest = (req,res) =>{
  User.User.findOne({id : req.userId}).exec(function (err,user){
      if(user){
        if(user.groupId){
          Group.findOne({id : user.groupId}).exec(function (err,group){
              if(group){
                var member = group.members.find(m => m.id === user.id);
                if(member){
                  if(member.rule === "normal"){
                    res.status(400).send({
                      error: {
                          message : "Bad request!"
                      }});
                      return;
                  }else{
                   var request =  group.joinRequests.find(r=>r.id === req.body.joinRequestId);
                   group.joinRequests = group.joinRequests.filter(item => item.id!==req.body.joinRequestId);
                   if(request){
                        User.User.findOne({id : request.userId}).exec(function (err,reqUser){
                            if(reqUser){
                                if(reqUser.groupId){
                                  res.status(400).send({
                                    error: {
                                        message : "Bad request!"
                                    }});
                                    return;
                                }else{
                                  const member = new Member({
                                    id : reqUser.id.toString(),
                                    name : reqUser.name,
                                    email : reqUser.email,
                                    rule : "normal"
                                  })
                                  group.members.push(member);
                                  group.updateOne({members :group.members, joinRequests :group.joinRequests }, (err, result) => {
                                    if (err) {
                                        res.status(400).send({
                                            error: {
                                                message : "Bad request!"
                                            }});
                                      return;
                                    }
                                    reqUser.joinRequests = group.joinRequests.filter(item => item.id!==req.body.joinRequestId);
                                    reqUser.updateOne({groupId:group.id, joinRequests : reqUser.joinRequests},(err, result) => {
                                      if (err) {
                                          res.status(400).send({
                                              error: {
                                                  message : "Bad request!"
                                              }});
                                        return;
                                      }
                                      res.status(200).send({
                                        message : "successful"
                                      });
                                      return;
                                    });
                                });
                                }


                            }else{
                              res.status(400).send({
                                error: {
                                    message : "Bad request!"
                                }});
                                return;
                            }


                        });
                   }else{
                    res.status(400).send({
                      error: {
                          message : "Bad request!"
                      }});
                      return;
                   }
                  }
                }else{
                  res.status(400).send({
                    error: {
                        message : "Bad request!"
                    }});
                    return;
                }
              }else{
                res.status(400).send({
                  error: {
                      message : "Bad request!"
                  }});
                  return;

              }
          });
      }else{
        res.status(400).send({
          error: {
              message : "Bad request!"
          }});
          return;
      }



      }
      else{
        res.status(400).send({
          error: {
              message : "Bad request!"
          }});
          return;
      }
  });


}