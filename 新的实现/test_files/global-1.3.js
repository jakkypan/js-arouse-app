function pageReady(callback, resizeCallback) {
    var supportTouch = ("createTouch" in document);
    window.supportTouch = supportTouch;

    var ua = navigator.userAgent;

    var isWebkit = false;
    if (/AppleWebKit\/\d+\.\d+/.test(ua)) {
        isWebkit = true;
    }
    window.isWebkit = isWebkit;

    var isAndroid = false;
    if (/Android (\d+\.\d+)/.test(ua)){
        isAndroid = true;
    }
    window.isAndroid = isAndroid;

    var isInWechat = false;
    var isInMqzone = false;
    var isInMqq = false;
    var isInPitu = false;
    if (/MicroMessenger/.test(ua)) {
        isInWechat = true;
    } else if (/Qzone/.test(ua)) {
        isInMqzone = true;
    } else if (/QQ\/\d+\.\d+\.\d+\.\d+/.test(ua)) {
        isInMqq = true;
    } else if (/PITU\/[\w-\.]+/.test(ua)) {
        isInPitu = true;
    }
    window.isInWechat = isInWechat;
    window.isInMqzone = isInMqzone;
    window.isInMqq = isInMqq;
    window.isInPitu = isInPitu;

    if(document.location.protocol == "https:")
    {
      window.baseUrl = ["https://", location.host, location.pathname.substring(0, location.pathname.lastIndexOf("/")+1)].join("");
    }
    else
    {
      window.baseUrl = ["http://", location.host, location.pathname.substring(0, location.pathname.lastIndexOf("/")+1)].join("");
    }

    window.onorientationchange = function(){pageResize(resizeCallback);};
    window.onresize = function(){pageResize(resizeCallback);};
    pageResize(resizeCallback);
    if (callback) {
        callback();
    }
}

function pageResize(callback) {
    if (window.supportTouch || window.isWebkit) {
        var $wrapperOuter = $("#wrapperOuter");
        var phoneWidth = $wrapperOuter.width();
        var phoneHeight = $wrapperOuter.height();
        var phoneRatio = phoneWidth / phoneHeight;

        var viewWidth = phoneWidth;
        var $wrapperInner = $(".wrapper-inner");

        var $upcontent = $(".up-content");
        var $downcontent = $(".down-content");
        if (phoneRatio > 0) { // 640 x 888
            viewWidth = phoneHeight * 0.622; // 640 x 888
            var viewWidthRatio = Math.round(viewWidth * 100 / phoneWidth).toFixed(2);
            $wrapperInner.css("width", [viewWidthRatio, "%"].join(""));
            $wrapperInner.css("left", [(100-viewWidthRatio)*0.5, "%"].join(""));

            $upcontent.css("width", [viewWidthRatio, "%"].join(""));
            $upcontent.css("left", [(100-viewWidthRatio)*0.5, "%"].join(""));

            $downcontent.css("width", [viewWidthRatio, "%"].join(""));
            $downcontent.css("left", [(100-viewWidthRatio)*0.5, "%"].join(""));
        } else {
            $wrapperInner.css("width", "100%");
            $wrapperInner.css("left", "0");
        }
    
        window.phoneScale = viewWidth / 320;
        document.body.style.fontSize = [16 * window.phoneScale, "px"].join("");
    } else {
        document.getElementById("wrapperOuter").style.width = "640px";
        document.getElementById("wrapperOuter").style.left = "50%";
        document.getElementById("wrapperOuter").style.marginLeft = "-320px";

        document.getElementById("up-content").style.width = "640px";
        document.getElementById("up-content").style.left = "50%";
        document.getElementById("up-content").style.marginLeft = "-320px";


        document.getElementById("down-content").style.width = "640px";
        document.getElementById("down-content").style.left = "50%";
        document.getElementById("down-content").style.marginLeft = "-320px";

        window.phoneScale = 2;
        document.body.style.fontSize = [16 * window.phoneScale, "px"].join("");
    }

    if (callback) {
        window.setTimeout(callback, 0);
    }
}

function pageGetParam(pKey) {
    var queryStr = window.location.search;
    if (queryStr.length > 0) {
        var qMark = queryStr.indexOf("?");
        if (qMark >= 0) {
            queryStr = queryStr.substr(qMark+1);
            var queryList = queryStr.split("&");
            for (var queryIndex in queryList) {
                var queryRow = queryList[queryIndex];
                var queryPair = queryRow.split("=");
                if (queryPair.length >= 2) {
                    var queryKey = queryPair[0];
                    if (queryKey == pKey) {
                        var queryVal = decodeURIComponent(queryPair[1]);
                        return queryVal;
                    }
                }
            }
        }
    }
    return "";
}

function pageGetCookie(c_name) {
    if (document.cookie.length > 0) {
        var mCookies = document.cookie.split(";");
        for (var i in mCookies) {
            var mCookie = mCookies[i];
            var mCookiePair = mCookie.split("=");
            if (mCookiePair.length >= 2) {
                var mCookieName = mCookiePair[0].trim();
                if (mCookieName == c_name) {
                    return decodeURIComponent(mCookiePair[1]);
                }
            }
        }
    }
    return "";
}

function pageSetCookie(c_name, c_value, c_domain) {
    if (c_domain) {
        document.cookie = c_name + "=" + encodeURIComponent(c_value) + "; domain=" + c_domain + "; path=/";
    } else {
        document.cookie = c_name + "=" + encodeURIComponent(c_value);
    }
}


function pageLoadScript(filepath, onloadCallback) {
    var scriptDom = document.createElement("script");
    scriptDom.onload = scriptDom.onreadystatechange = onloadCallback;
    scriptDom.type = "text/javascript";
    scriptDom.src = filepath;
    document.body.appendChild(scriptDom);
}

function pageRecordPV(vUrl) {
    if (!vUrl) {
        vUrl = location.pathname;
    }
    if (typeof(pgvMain) == 'function') {
        pgvMain({virtualDomain:"tu.qq.com", virtualURL:vUrl});
    } else {
        pageLoadScript("//pingjs.qq.com/tcss.ping.https.js", function(){
            if(typeof(pgvMain) == 'function') {
                pgvMain({virtualDomain:"tu.qq.com", virtualURL:vUrl});
            }
        });
    }
}

function pageRecordClick(hottag) {
    if (typeof(pgvSendClick) == 'function') {
        pgvSendClick({virtualDomain:"tu.qq.com", hottag:hottag});
    } else {
        pageLoadScript("//pingjs.qq.com/tcss.ping.https.js", function(){
            if(typeof(pgvSendClick) == 'function') {
                pgvSendClick({virtualDomain:"tu.qq.com", hottag:hottag});
            }
        });
    }
}

function haboReport(ret, costtime)
{
  if(ret == -99) ret = 0; //人脸识别失败上报0
  var commandid = "pitu.act." + gProjectName;
  var habourl = "//tu.qq.com/wspeed.qq.com/w.cgi?appid=1000322&commandid=" + commandid + "&releaseversion=1.1&touin=553470283&frequency=1&resultcode=" + ret + "&tmcost=" + costtime;
  $.ajax({
      type:"GET",
      url:habourl,
      dataType:"jsonp",
      timeout:30000,
      success:function(data, status, xhr){
      },
      error:function(xhr, errorType, error){
      }
  });

}

function preventEventPropagation(evt) {
    var e = evt || window.event;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    return false;
}

function authorizeByPtlogin() {
    var logoUrl = encodeURIComponent(window.baseUrl + 'res/logo.png');
    var redirectUrl = encodeURIComponent(window.baseUrl + "ptCallback.php");
    var authUrl = ["//ui.ptlogin2.qq.com/cgi-bin/login?style=8&appid=549000930&hln_css=", logoUrl, "&s_url=", redirectUrl].join("");
    location.href = authUrl;
}

function authorizeByWechatRecirect() {
    var wechatState = Math.random();
    pageSetCookie("wechatState", wechatState, "qq.com");

    var redirectUrl = encodeURIComponent("//tu.qq.com/websites/Christmas2015/wxCallback.php");
    var authUrl = ["//open.weixin.qq.com/connect/oauth2/authorize?appid=wx4893740d2e6856a6&redirect_uri=", redirectUrl, "&response_type=code&scope=snsapi_login&state=", wechatState, "#wechat_redirect"].join("");
    location.href = authUrl;
}

/*
 * 功能：使用图片url发说说
 * shareTitle:分享文案
 * imgUrl:支持多图，用空格分隔
 * shareUrl:分享链接
 */
function publishShuoshuoByImgurl(shareTitle, imgUrl, shareUrl) {
    loadingStart("正在分享");

    var getParamStr = "";
    if (window.p_uin && window.p_skey) {
        getParamStr = ["?u=o", window.p_uin, "&k=", encodeURIComponent(window.p_skey)].join("");
    }

    $.ajax({
      url:"//tu.qq.com/webapi/qzonePublishShuoshuoByImgurl.php"+getParamStr,
      type:"POST",
      data:{
        "content":[shareTitle, shareUrl].join(" "),
        "imgurl":imgUrl,
      },
      dataType:"json",
      timeout:15000,
      success:function(data, textStatus){
        if (data.data.ret == 0) {
        loadingStart("发表说说成功", true, "//res.tu.qq.com/assets/opchristmas2015_img/icon-succ2.png");
        } else {
        loadingStart(data.data.msg || "发表说说失败..."+JSON.stringify(data), true);
        }
      },
      error:function(req, errorType, error){
        loadingStart(error, true);
      }
    });
}

function sharePageByQZoneApi(shareImg, shareUrl) {
    loadingStart("正在分享");
    
    var shareTitle = document.title;
    var shareDesc = $("meta[name=description]").attr("content");

    var sid = pageGetParam("sid") || pageGetCookie("sid");
    $.ajax({
        url:"api/shareQZone.php",
        type:"POST",
        data:{
            title:shareTitle,
            summary:shareDesc,
            content:shareDesc,
            imageUrl:shareImg,
            url:shareUrl,
            sid:sid
        },
        dataType:"json",
        timeout:15000,
        success:function(data, textStatus){
            if (textStatus == "success") {
                if (data.ret == 200) {
                    loadingStart("分享空间成功", true);
                    return;
                }
            }
            loadingStart("分享空间失败", true);
        },
        error:function(req, errorType, error){
            loadingStart(error, true);
        }
    });
}
function sharePageByQZoneRedirect(shareImg, shareUrl) {
    var shareTitle = document.title;
    var shareDesc = $("meta[name=description]").attr("content");

    var sid = pageGetParam("sid") || pageGetCookie("sid");
    var shareParams = [
        'title=' + encodeURIComponent(shareTitle),
        'summary=' + encodeURIComponent(shareDesc),
        'desc=' + encodeURIComponent(shareDesc),
        'imageUrl=' + encodeURIComponent(shareImg),
        'url=' + encodeURIComponent(shareUrl),
        'successUrl=' + encodeURIComponent(shareUrl),
        'failUrl=' + encodeURIComponent(shareUrl),
        'callbackUrl=' + encodeURIComponent(shareUrl),
        'sid=' + encodeURIComponent(sid)
    ];
    window.location.href = "//openmobile.qq.com/api/check2?page=qzshare.html&loginpage=loginindex.html&logintype=qzone&" + shareParams.join("&");
}

function launchApp(appUrl, installUrl, tips, replace) {
    if (window.isInMqzone) {
        if (typeof(mqq) == 'object') {
            launchAppInMQzone(appUrl, installUrl, tips, replace);
        } else {
            pageLoadScript("//qzs.qq.com/qzone/phone/m/v4/widget/mobile/jsbridge.js", function(){
                launchAppInMQzone(appUrl, installUrl, tips, replace);
            });
        }
    } else {
        launchAppInMBrowser(appUrl, installUrl, tips, replace);
    }
}

function launchAppInMQzone(appUrl, installUrl, tips, replace) {
    if (mqq.support("mqq.ui.openUrl")) {
        var startTime = new Date();
        mqq.invoke("ui", "openUrl", {
            url:appUrl,
            target:2
        });

        window.setTimeout(function(){
            var endTime = new Date();
            var duration = endTime - startTime;
            if(duration >= 1000) {
                return;
            }

            if (tips && tips.length > 0) {
                window.alert(tips);
            }
            if (installUrl && installUrl.length > 0) {
                if (replace) {
                    window.location.replace(installUrl);
                } else {
                    window.location = installUrl;
                }
            }
        }, 800);
    } else {
        launchAppInMBrowser(appUrl, installUrl, tips, replace);
    }
}

function launchAppInMBrowser(appUrl, installUrl, tips, replace) {
    if (window.supportTouch) {
        var startTime = new Date();
        window.location = appUrl;

        window.setTimeout(function(){
            var endTime = new Date();
            var duration = endTime - startTime;
            if(duration >= 1000) {
                return;
            }

            if (tips && tips.length > 0) {
                window.alert(tips);
            }
            if (installUrl && installUrl.length > 0) {
                if (replace) {
                    window.location.replace(installUrl);
                } else {
                    window.location = installUrl;
                }
            }
        }, 800);
    } else {
        if (installUrl && installUrl.length > 0) {
            if (replace) {
                window.location.replace(installUrl);
            } else {
                window.location = installUrl;
            }
        }
    }
}

function distanceBetweenPoints(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

function angleBetweenPoints(p1, p2) {
    var angle = 0;
    if (p2.y > p1.y) {
        if (p2.x > p1.x) {
            angle = Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        } else if (p2.x < p1.x) {
            angle = Math.PI - Math.atan((p2.y-p1.y)/(p1.x-p2.x));
        } else {
            angle = Math.PI * 0.5;
        }
    } else if (p2.y < p1.y) {
        if (p2.x > p1.x) {
            angle = Math.PI * 2 - Math.atan((p1.y-p2.y)/(p2.x-p1.x));
        } else if (p2.x < p1.x) {
            angle = Math.PI + Math.atan((p1.y-p2.y)/(p1.x-p2.x));
        } else {
            angle = Math.PI * 1.5;
        }
    } else {
        if (p2.x >= p1.x) {
            angle = 0;
        } else {
            angle = Math.PI;
        }
    }
    return angle;
}
