const async = require('async');

var func1 = function(req,res,callback){

    setTimeout(function(){
        console.log('func1');
        callback(req,res,1);
    }, 800);
}

var func2 = function(req,res,callback){
    setTimeout(function(){
        console.log('func2');
        callback(req,res,2);
    }, 600);
}

var func3 = function(req,res,callback){
    setTimeout(function(){
        console.log('func3');
        callback(req,res,3);
    }, 400);
}

var req = null;
var res = null;
var callback = function(){};

/*
func1(req,res,callback);
func2(req,res,callback);
func3(req,res,callback);
*/

var req = null;
var res = null;
var callback = function(){};
async.series(
    [
        function(callback){
            func1(req,res,callback);
        },

        function(callback){
            func2(req,res,callback);
        },

       function(callback){
            func3(req,res,callback);
        }
    ]
);
