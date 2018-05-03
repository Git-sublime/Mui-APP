/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	//创建遮罩层
	var mask = mui.createMask();
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 3) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 3) {
			return callback('密码最短为 6 个字符');
		}
//		users.push(loginInfo);
//		localStorage.setItem('$users', JSON.stringify(users));
//		console.log(JSON.stringify(users));
		mui.ajax({
			url: 'http://118.24.34.244:8080/test1/LoginServlet?id=' + loginInfo.account + '&password=' + loginInfo.password,
			type: 'GET',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			beforeSend: function(){
				mask.show();
				plus.nativeUI.showWaiting("登陆中...");
			},
			complete: function(){
				plus.nativeUI.closeWaiting("登陆中...");
				mask.close();
			},
			success: function(res) {
				console.log(res);
				//若启动页不是登录页，则需通过如下方式打开登录页		
				if (res == 'true') {
					plus.nativeUI.toast('登陆成功');
					return owner.createState(loginInfo, callback);
				} else {
					return callback('用户名或密码错误!');
				}
			},
			error: function(xhr, type, errorThrown) {
//				console.log(errorThrown);
				plus.nativeUI.toast('Error! 链接服务器失败');
			}
		});
							
		//判断用户是否在以后的本地缓存中
//		var users = JSON.parse(localStorage.getItem('$users') || '[]');
//		var authed = users.some(function(user) {
//			return loginInfo.account == user.account && loginInfo.password == user.password;
//		});
//		console.log(JSON.stringify(authed));
//		if (authed) {
//			return owner.createState(loginInfo.account, callback);
//		} else {
//			return callback('用户名或密码错误');
//		}
	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.account.length < 3) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 3) {
			return callback('密码最短需要 6 个字符');
		}
		if (regInfo.name == '') {
			return callback('请填写姓名');
		}
		//注册接口
		mui.ajax({
			url: 'http://118.24.34.244:8080/test1/InsertUser?id='+regInfo.account+'&name=' + regInfo.name + '&sex=保密&age=0&password='+regInfo.password,
			type: 'GET',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			beforeSend: function(){
				mask.show();
				plus.nativeUI.showWaiting("注册中...");
			},
			complete: function(){
				plus.nativeUI.closeWaiting("注册中...");
				mask.close();
			},
			success: function(res) {
				console.log(res);
				plus.nativeUI.toast('注册成功');
				//若启动页不是登录页，则需通过如下方式打开登录页
				$.openWindow({
					url: 'login.html',
					id: 'login',
					show: {
						aniShow: 'pop-in'
					}
				});									
			},
			error: function(xhr, type, errorThrown) {
//				console.log(errorThrown);
				plus.nativeUI.toast('Error! 链接服务器失败');
			}
		});

//		var users = JSON.parse(localStorage.getItem('$users') || '[]');
//		users.push(regInfo);
//		localStorage.setItem('$users', JSON.stringify(users));
//		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));