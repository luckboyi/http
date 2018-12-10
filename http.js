//Ajax命令对象返回格式定义
function AjaxCmdResult() {
  this.Tag = ""; //引导标识
  this.Status = ""; //HTML状态标识
  this.Action = ""; //执行动作名
  this.ActObj = ""; //执行对象、计数、说明 …………
  this.Args = ""; //执行参数

}


//Ajax命令式函数
//Ajax('请求地址','请求方式','参数JSON')
//Ajax('index.jsp','POST',{arg1:'',arg2:''},true,func());
//强制为同步模式，返回AjaxCmdResult对象，可能的命令结果：
//1.ERROR,环境错误或非服务器错误，参看Status
//2.UNKNOW,引导标识不可识或返回不能解析的JSON，参看ActObj
//3.返回空值
//4.返回NO,无动作
//5.返回ER,服务器返回馈错误 
//6.返回OK,成功，另实现执行体
function AjaxCmd(url, method, args) {
  var rCmd = new AjaxCmdResult();
  var obj = null;
  var ajax = new AjaxObject();
  ajax.URL = url;
  ajax.Method = method;
  ajax.Async = false;
  ajax.Args = args;
  ajax.onSuccess = function (xhr) {
    var text = xhr.responseText;
    if (text.charCodeAt() == 65279) text = text.substring(1); //处理utf8引导字节
    rCmd.Status = xhr.status;
    if (text.trim() == "") {
      rCmd.Tag = "NULL";
    } else {
      try {
        eval("obj=" + text);
        rCmd.Tag = obj.Tag;
        rCmd.Action = obj.Action;
        rCmd.ActObj = obj.ActObj;
        rCmd.Args = obj.Args;
      } catch (e) {
        rCmd.Tag = "UNKNOW";
        rCmd.ActObj = text;
      }


    }
  };
  ajax.onFailure = function (xhr) {
    eval("obj={Tag:'ERROR',Status:'" + xhr.status + "'}");
    rCmd.Tag = obj.Tag;
    rCmd.Status = xhr.status;
  };
  ajax.Connect();
  return rCmd;
}


function getActiveURL(url) {
  var r = Math.random();
  if (url.indexOf("?") == -1) {
    return url + "?activetime=" + r;
  } else {
    return url + "&activetime=" + r;
  }

}


function AjaxJsonSmp(url, method, args) {
  var obj = null;
  var ajax = new AjaxObject();
  ajax.URL = getActiveURL(url);
  ajax.Method = method;
  ajax.Async = false;
  ajax.Args = args;
  ajax.onSuccess = function (xhr) {
    var text = xhr.responseText;
    if (text.charCodeAt() == 65279) text = text.substring(1); //处理utf8引导字节
    eval("obj=" + text);
  };
  ajax.onFailure = function (xhr) {
    eval("obj={Tag:'ERROR',Status:'" + xhr.status + "'}");
  };
  ajax.Connect();
  return obj;
}

//Ajax-JSON函数
//强制为同步模式
function AjaxJson(url, method, args, fn, dataType) {
  var obj = null;
  var ajax = new AjaxObject();
  ajax.URL = url;
  ajax.dataType = dataType;
  ajax.Method = method;
  ajax.Async = true;
  ajax.Args = args;
  ajax.onSuccess = function (xhr) {
    var text = xhr.responseText;
    if (text.charCodeAt() == 65279) text = text.substring(1); //处理utf8引导字节
    eval("obj=" + text);
    fn(obj)
  };
  ajax.onFailure = function (xhr) {
    eval("obj={Tag:'ERROR',Status:'" + xhr.status + "'}");
    fn(obj)
  };
  ajax.Connect();
  return obj;
}

//Ajax简单化函数
//Ajax('请求地址','请求方式','参数JSON',true异步|false同步,成功时函数)
//Ajax('index.jsp','POST',{arg1:'',arg2:''},true,func());
function AjaxSmp(url, method, args, async, callback) {
  Ajax(url, method, args, async, callback, function (xhr) {
    alert("Ajax Error(" + xhr.status + "):\n" + xhr.responseText);
  }, function () {}, function () {});
}

//Ajax标准函数 
//Ajax('请求地址','请求方式','参数JSON',true异步|false同步,成功时函数,失败时函数,请求前函数,返回后函数)
//Ajax('index.jsp','POST',{arg1:'',arg2:''},true,func(),func(),func(),func());
function Ajax(url, method, args, async, success, failure) {
  var ajax = new AjaxObject();
  ajax.URL = url;
  ajax.Method = method;
  ajax.Async = async;
  ajax.Args = args;
  ajax.onSuccess = success;
  ajax.onFailure = failure;
  ajax.Connect();
  return ajax.Request;
}

//Ajax标准类模块
function AjaxObject() {
  this.URL = "";
  this.Method = "GET";
  this.Async = true;
  this.Args = null;
  this.onSuccess = function (x) {};
  this.onFailure = function (x) {};
  this.Request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  this.Connect = function () {
    this.Method = this.Method.toUpperCase();
    if (this.Method == 'GET' && this.Args) {
      var args = "";
      if (typeof this.Args == 'object') {
        var arr = new Array();
        for (var k in this.Args) {
          var v = this.Args[k];
          arr.push(k + "=" + v);
        }
        args = arr.join("&");
      } else {
        args = data; //alert("string");
      }
      this.URL += (this.URL.indexOf('?') == -1 ? '?' : '&') + args;
      this.Args = null;
    }
    var q = this.Request;
    var evt1 = this.onSuccess;
    var evt2 = this.onFailure;
    var evt3 = this.onLoadend;
    this.Request.onreadystatechange = function () {
      _onStateChange(q, evt1, evt2, evt3);
    };

    this.Request.open(this.Method, this.URL, this.Async);
    if (this.Method == 'POST') {
      if (this.dataType == 'json') {
        this.Request.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
      } else {
        this.Request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;');
      }
      var args = "";
      if (typeof this.Args == 'string') {
        args = this.Args;
      } else if (typeof this.Args == 'object') {
        if (this.dataType == 'json') {
          this.Args = JSON.stringify(this.Args)
        } else {
          var arr = new Array();
          for (var k in this.Args) {
            var v = this.Args[k];
            arr.push(k + "=" + v);
          }
          args = arr.join("&");
          this.Args = encodeURI(args);
        }
      }
    }
    try {
      this.Request.send(this.Args);
    } catch (e) {
      console.log("connect exception.");
    }

  };

  function _onStateChange(xhr, success, failure) {
    if (xhr.readyState == 4) {
      var s = xhr.status;
      if (s == 0) {
        console.log("connect to url failure.");
      } else if (s >= 200 && s < 400) {
        success(xhr);
      } else {
        failure(xhr);
      }
    }
  }
}

class http {
  constructor() {}

  originPost(obj, fn) {
    if (obj.json !== undefined) {
      AjaxJson(obj.url, 'post', obj.json, fn, 'json')
    } else {
      AjaxJson(obj.url, 'post', obj.data, fn)
    }
  }
  originGet(obj, fn) {
    if (obj.json !== undefined) {
      AjaxJson(obj.url, 'get', obj.json, fn, 'json')
    } else {
      AjaxJson(obj.url, 'get', obj.data, fn)
    }
  }
  post(obj) {
    return new Promise((resolve, reject) => {
      this.originPost(obj, (res) => {
        resolve(res)
      })
    })
  }
  get(obj) {
    return new Promise((resolve, reject) => {
      this.originGet(obj, (res) => {
        resolve(res)
      })
    })
  }
}