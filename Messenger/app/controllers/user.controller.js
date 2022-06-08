const res = require("express/lib/response");
const { user, group } = require("../models");
const db = require("../models");
const { Chat } = require("../models/chat.model");
const { Connection } = require("../models/connection.model");
const { ConnectionRequest } = require("../models/connectionRequest.model");
const { JoinRequest } = require("../models/joinRequest.model");
const { Member } = require("../models/member.model");
const { Message } = require("../models/message.model");
const _ = require("lodash");
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
        allGroups.sort(function(a, b){return parseInt(b.id)-parseInt(a.id)}).forEach(group => {
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
                    var resp = _.pick(group,['name','description','members','']);
                    var tmp = [];
                    resp.members.map(m=>{
                     tmp.push(_.pick(m,['id','name','email','rule']));
                    });
                    resp.members = tmp;
                    res.status(200).send({
                     "group" :  resp
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
                      date    : Date.now()
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
      var resp = [];
      user.joinRequests.sort(function(a, b){return b.date-a.date})?.map(j=>{
        resp.push(_.pick(j,['id','groupId','userId','date']));
      })
      res.status(200).send({
        joinRequests :  resp
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
                      var resp = [];
                      group.joinRequests.sort(function(a, b){return b.date-a.date})?.map(j=>{
                        resp.push(_.pick(j,['id','groupId','userId','date']));
                      })
                      res.status(200).send({
                        joinRequests : resp
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


exports.getConnectionRequests = (req,res) => {
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
                var resp = [];
                group.connectionRequests.sort(function(a, b){return b.sent-a.sent})?.map(c=>{
                    resp.push(_.pick(c,['connectionRequestId','groupId','sent']))
                });
                res.status(200).send({
                  requests :  resp
                });
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
    }else{
      res.status(400).send({
        error: {
            message : "Bad request!"
        }});
        return;
    }



  });
}


exports.sendConnectionRequest = (req,res) => {
  User.User.findOne({id : req.userId}).exec(function (err,user){
    if(user){
      if(user.groupId === req.body.groupId.toString()){
        res.status(400).send({
          error: {
              message : "Bad request!"
          }});
          return;
      }


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
                  Group.findOne({id : req.body.groupId}).exec(function (err,group2){
                  if(group2){
                  var connectionRequest = group2.connectionRequests.find(c=>c.groupId === group.id.toString());
                  if(connectionRequest){
                  res.status(400).send({
                    error: {
                        message : "Bad request!"
                    }});
                    return;
                  }else{
                    getNextSequence("connectionRequestId", function(err, result){
                      if(err){
                        res.status(400).send({
                          error: {
                              message : "Bad request!"
                          }});
                          return;
                      }
                      var request = new ConnectionRequest({
                        connectionRequestId  : result,
                        groupId              : group.id,
                        sent    : Date.now()
                      });
                      group2.connectionRequests.push(request);
                      group2.updateOne({connectionRequests : group2.connectionRequests }, (err,result)=>{
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
    }else{
      res.status(400).send({
        error: {
            message : "Bad request!"
        }});
        return;
    }



  });
}

exports.acceptConnectionRequest = (req,res)=>{
  User.User.findOne({id : req.userId}).exec(function (err,user){
   
    if(user){
      if(user.groupId){
        Group.findOne({id : user.groupId}).exec(function (err,group){
          if(group){
            groupConnections = [];
            groupConnections = groupConnections.concat(group.connections);
            var member = group.members.find(m => m.id === user.id);
            if(member){
              if(member.rule === "normal"){
                res.status(400).send({
                  error: {
                      message : "Bad request!"
                  }});
                  return;
              }else{
                    var request = group.connectionRequests.find(c=>c.connectionRequestId=== req.body.connectionRequestId);
                    console.log(req.body.connectionRequestId);
                    if(request){
                      var connection = group.connections.find(c=>c.groupId == request.groupId)
                      if(connection){
                        group.connectionRequests = group.connectionRequests.filter(item => item.connectionRequestId!==req.body.connectionRequestId);
                        group.updateOne({connectionRequests : group.connectionRequests},(err, result) => {
                              res.status(400).send({
                                error: {
                                    message : "Bad request!"
                                }});
                                return;
                        });
                      }else{
                          Group.findOne({id : request.groupId}).exec(function (err,group2){
                              if(group2){
                                group2Connections = [];
                                 group2Connections = group2Connections.concat(group2.connections);
                                var connected = new Connection({
                                  groupId : group2.id
                                });
                                var connected2 = new Connection({
                                  groupId : group.id
                                })
                                group2.connections?.map(g=>{
                                    Group.findOne({id : g.groupId}).exec(function(err,group3){
                                      if(group3){
                                        if(!group3.connections.includes(group.id)){
                                            group3.connections.push(connected2);
                                            group3.connections = group3.connections.concat(groupConnections);
                                            group3.connectionRequests = group3.connectionRequests.filter(item => item.groupId!==group.id);
                                            group3.updateOne({connections:group3.connections,connectionRequests : group3.connectionRequests},(err, result) => {
                                              if(err){
                                                res.status(400).send({
                                                  error: {
                                                      message :"Bad request!"
                                                  }});
                                                  return;
                                              }
                                        });
                                      }
                                      }else{
                                        res.status(400).send({
                                          error: {
                                              message :"Bad request!"
                                          }});
                                          return;
                                      }});
                                    });
                                console.log("4");
                                group.connections?.map(g1=>{
                                      Group.findOne({id : g1.groupId}).exec(function(err,group4){
                                        console.log("5");
                                        if(group4){
                                          if(!group4.connections.includes(group2.id)){
                                              group4.connections.push(connected);
                                              group4.connections = group4.connections.concat(group2Connections);
                                              group4.connectionRequests = group4.connectionRequests.filter(item => item.groupId!==group2.id);
                                              group4.updateOne({connections:group4.connections,connectionRequests : group4.connectionRequests},(err, result) => {
                                                if(err){
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
                                                message :"Bad request!"
                                            }});
                                            return;
                                        }
                                      });
                                });
                              
                                group2.connections.push(connected2);
                                group2.connections = group2.connections.concat(groupConnections);
                                group2.connectionRequests = group2.connectionRequests.filter(item => item.groupId!==group.id.toString());
                                group.connections.push(connected);
                                console.log(group.connections);
                                group.connections = group.connections.concat(group2Connections);
                                console.log(group.connections);
                                group.connectionRequests = group.connectionRequests.filter(item => item.connectionRequestId!==req.body.connectionRequestId);
                                group.updateOne({connections:group.connections, connectionRequests : group.connectionRequests},(err, result) => {
                                    if(err){
                                      res.status(400).send({
                                        error: {
                                            message : "Bad request!"
                                        }});
                                        return;
                                    }
                                    group2.updateOne({connections:group2.connections,connectionRequests : group2.connectionRequests},(err, result) => {
                                      if(err){
                                        res.status(400).send({
                                          error: {
                                              message : "Bad request!"
                                          }});
                                          return;
                                      }else{
                                        res.status(200).send({
                                          message : "successful"
                                        });
                                        return;
                                      }
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
    }else{
      res.status(400).send({
        error: {
            message : "Bad request!"
        }});
        return;
    }



  });
}


exports.getChats = (req,res)=>{
  User.User.findOne({id : req.userId}).exec(function (err,user){
      if(user){
            var resp = [];
            if(user.chats){
              user.chats.sort(function(a, b){return b.date-a.date})?.map(c=>{
                resp.push(_.pick(c,['userId','name']));
            });
            res.status(200).send({
              chats : resp
            });
            return;
            }else{
              res.status(200).send({
                chats : resp
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


exports.getMessages = (req,res)=>{
  User.User.findOne({id : req.userId}).exec(function (err,user){
      if(user){
        User.User.findOne({ id: req.params.user_id }).exec(function (err,user1){
            if(user1){
              var chat = user.chats.find(c=>c.userId == req.params.user_id);
              if(chat){
                var resp = [];
                chat.messages.sort(function(a, b){return b.date-a.date})?.map(c=>{
                  resp.push( _.pick(c,['message','date','sentby']));
                });
                res.status(200).send({
                    messages : resp
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


        });
       
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

exports.sendMessage = (req,res)=>{

  User.User.findOne({id : req.userId}).exec(function (err,user){
    if(user){
      User.User.findOne({ id: req.params.user_id }).exec(function (err,user1){
          if(user1){
            Group.findOne({id : user.groupId}).exec(function (err,group){
                  if(group){
                    if(user1.groupId!=null){
                      if(group.connections.filter(g => g.groupId.toString() === user1.groupId).length > 0 || user.groupId === user1.groupId){
                        var chat = user.chats.find(c=>c.userId == user1.id);
                        var msg = new Message({
                          message : req.body.message,
                          sentby  : user.id,
                          date    : Date.now()
                        });
                        if(chat){
                          var chat2 = user1.chats.find(c=>c.userId == user.id);
                          chat.messages.push(msg);
                          chat.date = msg.date;
                          chat2.messages.push(msg);
                          chat2.date = msg.date;
                        }else{
                          var chat3 = new Chat({
                              userId : user.id,
                              name   : user.name,
                              messages : [],
                              date    : Date.now()
                          });

                          var chat4 = new Chat({
                            userId : user1.id,
                            name   : user1.name,
                            messages : [],
                            date    : Date.now()
                          });
                          chat3.messages.push(msg);
                          chat4.messages.push(msg);
                          user.chats.push(chat4);
                          user1.chats.push(chat3);
                        }
                        user.updateOne({chats: user.chats},(err, result) => {
                            if(err){
                              res.status(400).send({
                                error: {
                                    message : "Bad request!"
                                }});
                                return;
                            }
                            user1.updateOne({chats: user1.chats},(err, result) => {
                                if(err){
                                  res.status(400).send({
                                    error: {
                                        message : "Bad request!"
                                    }});
                                    return;
                                }else{
                                res.status(200).send({
                                  message : "successful"
                                });
                                return;
                              }
                            });
                        });

                      }
                      else{
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
      });
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