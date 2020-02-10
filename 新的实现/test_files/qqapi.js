(function(name, definition) {

	this[name] = definition();

	if (typeof define === 'function') {
		define(this[name]);
	} else if (typeof module === 'object') {
		module.exports = this[name];
	}

})('mqq', function(undefined) {
	"use strict";
	var exports = {};
	var ua = navigator.userAgent;
	var SLICE = Array.prototype.slice;
	var REGEXP_IOS_QQ = /(iPad|iPhone|iPod).*? (IPad)?QQ\/([\d\.]+)/;
	var REGEXP_ANDROID_QQ = /\bV1_AND_SQI?_([\d\.]+)(.*? QQ\/([\d\.]+))?/; // 国际版的 QQ 的 ua 是 sqi 
	var UUIDSeed = 1; //从1开始, 因为QQ浏览器的注入广告占用了0, 避免冲突 
	var aCallbacks = {}; // 调用回调 
	var CODE_API_CALLBACK = -200000; // 定义为 API 调用的返回, 但是不知道确切返回码 
	exports.iOS = REGEXP_IOS_QQ.test(ua);
	exports.android = REGEXP_ANDROID_QQ.test(ua);
	exports.QQVersion = '0';

	/**
	 * 当a<b返回-1, 当a==b返回0, 当a>b返回1,
	 * 约定当a或b非法则返回-1
	 */

	if (exports.android) {
		exports.QQVersion = function(m) { // 从 ua 拿版本号
			return m && (m[3] || m[1]) || 0;
		}(ua.match(REGEXP_ANDROID_QQ));

		if (!window.JsBridge) { // 兼容 android
			window.JsBridge = {};
		}
		window.JsBridge.callMethod = invokeClientMethod;
		window.JsBridge.callback = execGlobalCallback;
		window.JsBridge.compareVersion = exports.compare;
	}

	/**
	 * 创建名字空间
	 * @param  {String} name
	 */
	function createNamespace(name) {
		var arr = name.split('.');
		var space = window;
		arr.forEach(function(a) {
			!space[a] && (space[a] = {});
			space = space[a];
		});
		return space;
	}

	function storeCallback(callback) {
		var sn = UUIDSeed++;
		if (callback) {
			aCallbacks[sn] = callback;
		}
		return sn;
	}

	/**
	 * 所有回调的最终被执行的入口函数
	 */
	function fireCallback(sn, argus, deleteOnExec, execOnNewThread) {
		var callback = typeof sn === 'function' ? sn : (aCallbacks[sn] || window[sn]);
		var endTime = Date.now();
		argus = argus || [];
		// Console.debug('fireCallback, sn: ' + sn);
		if (typeof callback === 'function') {
			if (execOnNewThread) {
				setTimeout(function() {

					callback.apply(null, argus);
				}, 0);
			} else {
				callback.apply(null, argus);
			}
		} else {

			console.log('mqqapi: not found such callback: ' + sn);
		}
		if (deleteOnExec) {
			delete aCallbacks[sn];
			delete window['__MQQ_CALLBACK_' + sn];
		}
	}

	/**
	 * android / iOS 5.0 开始, client回调 js, 都通过这个入口函数处理
	 */
	function execGlobalCallback(sn /*, data*/ ) {
		//Console.debug('execGlobalCallback: ' + JSON.stringify(arguments));

		var argus = SLICE.call(arguments, 1);

		if (exports.android && argus && argus.length) {

			// 对 android 的回调结果进行兼容
			// android 的旧接口返回会包装个 {r:0,result:123}, 要提取出来
			argus.forEach(function(data, i) {
				if (typeof data === 'object' && ('r' in data) && ('result' in data)) {
					argus[i] = data.result;
				}
			});
		}

		fireCallback(sn, argus);
	}

	/**
	 * 空的api实现, 用于兼容在浏览器调试, 让mqq的调用不报错
	 */
	function emptyAPI() {
		// var argus = SLICE.call(arguments);
		// var callback = argus.length && argus[argus.length-1];
		// return (typeof callback === 'function') ? callback(null) : null;
	}

	/**
	 * 创建 api 方法, 把指定 api 包装为固定的调用形式
	 */
	function buildAPI(name, data) {
		var func = null;
		var index = name.lastIndexOf('.');
		var nsName = name.substring(0, index);
		var methodName = name.substring(index + 1);

		var ns = createNamespace(nsName);
		if (ns[methodName]) {

			// 已经有这个API了, 抛出异常
			throw new Error('[mqqapi]already has ' + name);
		}
		func = data.android;
		ns[methodName] = func || emptyAPI;
	}

	/**
	 * 使用 iframe 发起伪协议请求给客户端
	 */
	function openURL(url, sn) {
		//Console.debug('openURL: ' + url);
		var iframe = document.createElement('iframe');
		iframe.style.cssText = 'display:none;width:0px;height:0px;';
		var container = document.body || document.documentElement;
		container.appendChild(iframe);
		iframe.src = url;
	}

	function invokeClientMethod(ns, method, argus, callback) {
		if (!ns || !method) {
			return null;
		}
		var url, sn; // sn 是回调函数的序列号
		argus = SLICE.call(arguments, 2);
		callback = argus.length && argus[argus.length - 1];

		if (callback && typeof callback === 'function') { // args最后一个参数是function, 说明存着callback
			argus.pop();
		} else if (typeof callback === 'undefined') {

			argus.pop();
		} else {
			callback = null;
		}

		sn = storeCallback(callback);
		url = 'jsbridge://' + encodeURIComponent(ns) + '/' + encodeURIComponent(method);

		argus.forEach(function(a, i) {
			if (typeof a === 'object') {
				a = JSON.stringify(a);
			}
			if (i === 0) {
				url += '?p=';
			} else {
				url += '&p' + i + '=';
			}
			url += encodeURIComponent(String(a));
		});

		url += '#' + sn;

		openURL(url);
		return null;
	}

	exports.build = buildAPI;
	exports.invoke = invokeClientMethod;

	return exports;

});;

/**
 * 查询单个应用是否已安装
 * @param {String} scheme 比如'mqq'
 * @return {Boolean} 
 * */

mqq.build('mqq.app.isAppInstalled', {
	android: function(identifier, callback) {
		mqq.invoke('QQApi', 'isAppInstalled', identifier, callback);
	}
});;
