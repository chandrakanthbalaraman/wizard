var fs = require('fs');
var async = require('async');
var path = require('path');
var mkdirp = require('mkdirp');
var nunjucks = require("nunjucks");


var appData = require('../assets/const/new-app');
var configData = require('../assets/config/app-config');
var dirConfigData = require('../assets/config/directory-config');



exports.generateCode = function(req, res) {
    // var dir = '/home/hmspl/Documents/myproj';
    var dir = 'D:/\dev/\projects';
    let reqObj = req.body;
    async.forEach(appData.appInfo,function(item,loopCb){
        if(makeDir(dir,item,reqObj)==undefined){
            loopCb();
        }
    },function(err,resp){
        if(err){
            let respData = {
                code:400,
                message:'Bad request'
            }
            res.json(respData);
        }else{
            let respData = {
                code:200,
                message:'Success'
            }
            res.json(respData);
        }
    });
    
}

exports.generateLayout = function(req, res) {
    // var dir = '/home/hmspl/Documents/myproj';
    let reqObj = req.body;
    var dir = 'D:/\dev/\projects';
    let layoutDir = dir+'/'+reqObj.project+dirConfigData.layout.parentSrc;
    async.waterfall([function(callback){
        if (fs.existsSync(layoutDir)) { 
            async.forEach(appData.basicLayout,function(item,loopCb){
                item.name = dirConfigData.layout.parentDirName;
                if(makeDir(layoutDir,item,reqObj)==undefined){
                    loopCb();
                }
            },function(err,resp){
                callback(err,resp);    
            });
        }else{
            callback(true)
        }
    }],function(err,resp){
        if(err){
            let respData = {
                code:400,
                message:'Bad request'
            }
            res.json(respData);
        }else{
            let respData = {
                code:200,
                message:'Success'
            }
            res.json(respData);
        }
    })
 
    
}



var makeDir = function(dir,data,reqObj){
    if (typeof data == typeof {} && Array.isArray(data) == true) {
        for(let obj of data){
            makeDir(dir, obj,reqObj)   
        }
        
    }else if(typeof data == typeof {} && Array.isArray(data) == false){
        createIt(dir,data,reqObj,function(err,resp){
            if(resp.hasOwnProperty('dir')){
                makeDir(dir+'/'+resp.name, resp.dir,reqObj)   
            }
        })
    }
    
}

var createIt = function(dir,obj,reqObj,fbCb){
    var dirData = dir+'/'+obj.name;
    console.log("dirData",dirData);
    async.waterfall([
        function(callback){
            mkdirp(dirData, function (err,resp) {
                if (err) return callback(err);
                else{
                    callback(null,obj)    
                }
            });
        },
        function(obj,callback){
            if(obj.hasOwnProperty('file')){
                nunjucks.configure({ autoescape: true });
                async.eachSeries(obj.file, function iterator(item, loopCb) {
                    if(item.name){
                        if(item.hasOwnProperty('type')){
                            let content = nunjucks.render(path.resolve(__dirname,configData[item.type]['template']),reqObj);
                            fs.writeFile(dirData+"/"+item.name, content, function(err,resp){
                                loopCb();
                                
                            });
                        }else{
                            let content = ''
                            fs.writeFile(dirData+"/"+item.name, content, function(err,resp){
                                loopCb();
                            });
                        }
                    }else{
                        loopCb();
                    }
                    
                  }, function(err,resp) {
                    if(err){
                        return callback(err);
                    }else{
                        return callback(null,obj);
                    }
                  });
            }else{
                callback(null,obj);
            }
        }
    ], function (err, result) {
        fbCb(err,result);
    });
    
    
    
}
