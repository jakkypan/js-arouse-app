function launchAppNow(androidScheme, iosScheme, androidInstallURL, iosInstallURL, packageName ,by, source, appname) {
  if((androidScheme && androidInstallURL) &&(iosScheme && iosInstallURL)) {
    var ua = navigator.userAgent;
    var obj = this;
    obj.packageName = packageName;

    obj.config = {
      delay: 1e3,
      nonSupport: "暂时不支持"
    };
    obj.platform = {
      isAndroid: /Android;?[\s\/]+([\d.]+)?/.test(ua),
      isIOS: /(iPad|iPod|iPhone).*OS/.test(ua),
      isWeixin: /MicroMessenger/i.test(ua),
      isMobileQQ: /QQ\//i.test(ua),
      isQzone: /Qzone\//i.test(ua)
    };
    //  用于数据上报的 参数
    obj.by = by;
    obj.source = source;
    if(androidInstallURL.indexOf("tu.qq.com") != -1){
      obj.func = "homepage";
    }else{
      obj.func = "download";  
    }
    obj.appname = appname;


    if(obj.platform.isAndroid) 
      obj.scheme = androidScheme,
        obj.install = androidInstallURL;
    else {
      if (!obj.platform.isIOS) 
        return void alert("您的系统不支持跳转!");
      obj.scheme = iosScheme;
      obj.install = iosInstallURL;
    }
    if(obj.platform.isAndroid && obj.platform.isWeixin){
    	launchAndroidWx.call(obj);
    }
    else if(obj.platform.isAndroid && obj.platform.isQzone){
    	launchAndroidQzone.call(obj);
    }
    else if(obj.platform.isAndroid && obj.platform.isMobileQQ){
      qqLaunch.call(obj);
    }
    else if(obj.platform.isAndroid){
      launchAndroid.call(obj);
    }
    else if(obj.platform.isIOS && obj.platform.isWeixin){
      launchiOSWx.call(obj);
    }
    else if(obj.platform.isIOS && obj.platform.isMobileQQ){
      launchiOSQQ.call(obj);
    }
    else if(obj.platform.isIOS && obj.platform.isQzone){
      launchiOSQzone.call(obj);
    }
    else{
      launchiOS.call(obj);
    }
  }else{
    alert("hehehey一定是我打开的方式不对");
  }
}
/* ios 使用时间戳差值判断： 可能不可用
 * Android 采用时间戳差值和qbrowserVisibilityChange事件进行判断
 */
function check(obj,startTime,platform , appName){
  var _hasAddEvent = false,
      pageVisibility = true,
      checkTime = 1600;
  setTimeout(function(){
      var c = new Date - startTime;
      if(c > checkTime+100){
        pageRecord(obj.by ,  obj.source, platform+"-"+appName , "app" ,obj.appname); 
        return;
      }
      if( platform == 'ios' && document.hidden == false){
        pageRecord(obj.by , obj.source, platform+"-"+appName , obj.func , obj.appname); 
        location = obj.install;
      }else if(pageVisibility){
        pageRecord(obj.by , obj.source, platform+"-"+appName , obj.func, obj.appname); 
        location = obj.install; 
       }
  },checkTime);
  if(platform != 'ios' && !_hasAddEvent){
    _hasAddEvent = true;
    document.addEventListener("qbrowserVisibilityChange", function(e) {
       if(e.hidden){
       pageVisibility = false;
      }
    });
  }

}
/*
function pageLoadScript(filepath, onloadCallback) {
  var scriptDom = document.createElement("script");
  scriptDom.onload = scriptDom.onreadystatechange = onloadCallback;
  scriptDom.type = "text/javascript";
  scriptDom.src = filepath;
  document.body.appendChild(scriptDom);
}
*/
function launchSchema(obj){
	var iframe = document.createElement("iframe");
	iframe.style.display = "none";
	iframe.src = obj.scheme;
	document.body.appendChild(iframe);
  window.setTimeout(function() {
    document.body.removeChild(iframe);
  }, 0);
}

function wxJsBridgeReady(readyCallback) {
if (readyCallback && typeof readyCallback == 'function') {
    var Api = this;
    var wxReadyFunc = function() {
        readyCallback(Api);
    };
    if (typeof window.WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', wxReadyFunc, false);
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', wxReadyFunc);
            document.attachEvent('onWeixinJSBridgeReady', wxReadyFunc);
        }
    } else {
        wxReadyFunc();
    }
  }
};
var biggerThanIos9 = function() {
    var result = false,
        ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('like mac os x') > 0) {
        var verinfo = ua.match(/os [\d._]*/gi);
        verinfo = (verinfo + '').replace(/[^0-9|_.]/ig, "").replace(/_/ig, ".");
        var version_str = verinfo + '';
        var version;
        if (version_str !== 'undefined' && version_str.length > 0) {
            var version_arr = version_str.split('.');
            if (version_arr && version_arr.length) {
                version = version_arr[0] * 1;
                if (version >= 9) {
                    result = true;
                }
            }
        }
    }
    return result;
}
launchiOSWx = function(){
  console.log('into launchiOSWx!');
  var obj = this;
  var isCheck = true;
  // Get the version of wechat
  var wechat = navigator.userAgent.toLowerCase().match(/micromessenger\/([\d\.]+)/);
  var wxVersion = wechat[1] || '0';
  var compare = wxVersionCompare(wxVersion, '6.5.5');
  if(compare){
    console.log('into compare');
    wxJsBridgeReady(function() {
      if (window.WeixinJSBridge) {
          console.log('into wx js bridge');
          WeixinJSBridge.invoke('launchApplication', {
              "schemeUrl":obj.scheme
          }, function(e) {
            console.log(e.err_msg);
            if((e.err_msg).indexOf('ok') == -1){
              pageRecord(obj.by , obj.source, "ios-wx" , obj.func, obj.appname); 
              window.location = obj.install; 
            }else{
              pageRecord(obj.by , obj.source, "ios-wx" , "app", obj.appname); 
            }
          });
      } else {
         pageRecord(obj.by , obj.source, "ios-wx" , obj.func, obj.appname); 
         window.location = obj.install; 
      }
    });
  }else{
    if(biggerThanIos9()) {
      window.location = obj.scheme;
      if (isCheck) {
          setTimeout(function() {
              location = obj.install;
          }, 2000);
        }
    }else{
      var compare = wxVersionCompare(wxVersion, '4.0.0');
      if (compare) {
          wxJsBridgeReady(function() {
              if (window.WeixinJSBridge) {
                  WeixinJSBridge.invoke('getInstallState', {
                      'packageName': obj.packageName,
                      'packageUrl': obj.scheme
                  }, function(e) {
                      if (e && e.err_msg && e.err_msg.indexOf('get_install_state:yes') > -1) {
                          pageRecord(obj.by , obj.source, "ios-wx" , "app", obj.appname); 
                          window.location = obj.scheme;
                      } else if (isCheck) {
                        pageRecord(obj.by , obj.source, "ios-wx" , obj.func, obj.appname); 
                        location = obj.install;
                      }
                  });
              } else {
                  window.location = obj.scheme;
                  if (isCheck) {
                      pageRecord(obj.by , obj.source, "ios-wx" , obj.func, obj.appname); 
                      location = obj.install;
                  }
              }
          });
      } else {
          window.location = obj.scheme;
          if (isCheck) {
            pageRecord(obj.by , obj.source, "ios-wx" , obj.func, obj.appname); 
            location = obj.install;
          }
      }
    
    }
  }
}

launchiOS = function() {
  var obj = this;
  var b = new Date;
  window.location = obj.scheme;
  window.setTimeout(function() {
      var c = new Date - b;
  		if(c < 2100){
          pageRecord(obj.by , obj.source, "ios-browser" , obj.func, obj.appname); 
      		window.location.replace(obj.install);
      }else{
          pageRecord(obj.by , obj.source, "ios-browser" , "app", obj.appname); 
      }
  }, 1800);
} 
launchiOSQQ = function() {
  var obj = this;
  var b = new Date;
  window.location = obj.scheme;
  window.setTimeout(function() {
      var c = new Date - b;
  		if(c < 2100){
          pageRecord(obj.by , obj.source, "ios-qq" , obj.func, obj.appname); 
      		window.location.replace(obj.install);
      }else{
          pageRecord(obj.by , obj.source,  "ios-qq" , "app", obj.appname); 
      }
  }, 1800);
} 
launchiOSQzone = function() {
	var obj = this;
	var b = new Date;
	window.setTimeout(function(){
		mqq.invoke("ui","openUrl",{url:obj.scheme,target:2});	
	},300);
  	window.setTimeout(function() {
  		if(new Date - b < 2300){
        pageRecord(obj.by , obj.source, "ios-qzone" , obj.func, obj.appname); 
      	window.location.replace(obj.install);
      }else{
        pageRecord(obj.by , obj.source, "ios-qzone" , "app", obj.appname); 
      }
    }, 1800);
}
launchAndroid = function() {
  var obj = this;
  var startTime = new Date;
  launchSchema(obj);
  check(obj,startTime,"android" ,"browser");
}

launchAndroidQzone = function(){
  var obj = this;
  var startTime = new Date;
  launchSchema(obj);
  check(obj,startTime,"android" , "qzone");
}

launchAndroidWx = function(){
	var obj = this;
  var isCheck = true
  // Get the version of wechat
  var wechat = navigator.userAgent.toLowerCase().match(/micromessenger\/([\d\.]+)/);
  var wxVersion = wechat[1] || '0';
  var compare = wxVersionCompare(wxVersion, '6.5.5');
  if(compare){
         /* 
    pageLoadScript("//res.wx.qq.com/open/js/jweixin-1.0.0.js", function(){ 
        pageLoadScript("//test.tu.qq.com/websites/wxBridge.php", function(){
          wx.ready(function(){  
               wx.invoke('launchApplication', 
                 //{"appID":"wx6ed88e3698dd4318", "schemeUrl":obj.scheme  },
                 {"appID":"wxf208c347bd522269", "schemeUrl":obj.scheme  },
                 function(res) {
                  if( res.err_msg == "launchApplication:fail"){
                    window.location = obj.install;
                  }else{
                    ;
                  }
                 });
            });
          });
        });
    
    */
    pageLoadScript("//res.wx.qq.com/open/js/jweixin-1.0.0.js", function(){ 
      wxJsBridgeReady(function() {
        if (window.WeixinJSBridge) {
            WeixinJSBridge.invoke('launchApplication', {
                "schemeUrl":obj.scheme
            }, function(e) {
              if((e.err_msg).indexOf('ok') == -1){
                pageRecord(obj.by , obj.source, "android-wx" , obj.func, obj.appname); 
                window.location =  obj.install;
              }else{
                pageRecord(obj.by , obj.source, "android-wx" , "app", obj.appname); 
              }
            });
        } else {
           pageRecord(obj.by , obj.source, "android-wx" ,obj.func, obj.appname); 
           window.location = obj.install; 
        }
      });
      });
    
        
  }else{
    var compare = wxVersionCompare(wxVersion, '4.0.0');
    if (compare) {
        wxJsBridgeReady(function() {
            if (window.WeixinJSBridge) {
                WeixinJSBridge.invoke('getInstallState', {
                    'packageName': obj.packageName,
                    'packageUrl': obj.scheme
                }, function(e) {
                    if (e && e.err_msg && e.err_msg.indexOf('get_install_state:yes') > -1) {
                        launchSchema(obj);
                    } else if (isCheck) {
                      location = obj.install;
                    }
                });
            } else {
                launchSchema(obj);
                if (isCheck) {
                    location = obj.install;
                }
            }
        });
    } else {
        window.location = obj.scheme;
        if (isCheck) {
          location = obj.install;
        }
    }
  }
}

qqLaunch = function() {
  var scheme, obj = this,
  scheme = obj.packageName;
  mqq.app.isAppInstalled(scheme, // 此处需要引入qqapi.js
      function(installed) {
        installed ? pageRecord(obj.by , obj.source, "android-qq" , "app" , obj.appname ) :pageRecord(obj.by , obj.source, "android-qq" , obj.func , obj.appname );
        installed ? (window.location = obj.scheme) : (window.location = obj.install);

      })
}
function pageRecord(by ,source, platform , func ,app_name){
  // platform :分为 浏览器(browser) 、安卓(android) 、 IOS(ios)
  // func :分为 跳主页(homepage)、拉起app(app)、跳下载(download)
  var url_prefix = app_name + "_downloading.php";
  var url = url_prefix + "_" + by + "_"+ source + "_" + platform + "_" + func;
  pageRecordPV(url);
}
function wxVersionCompare(versionNow, versionBase){
  nowArray = versionNow.split(".");
  baseArray = versionBase.split(".");
  if(nowArray.length >  baseArray.length){
    return true;
  }

  if(nowArray.length <  baseArray.length){
    return true;
  }
  var i = 0;
  for( i = 0; i < nowArray.length && i < baseArray.length; ++i){
    var now = parseInt(nowArray[i]);
    var base = parseInt(baseArray[i]);
    if(now > base){
      return true;
    }else if(now < base){
      return false;
    }
  }
  return true;
}
