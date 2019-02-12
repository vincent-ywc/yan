// loading 加载页面 begin
var load = document.getElementById('loading'),
	progress = document.getElementById('loading_rate');
// 加载图片资源
var loadingImage = (function() {

	var img_list = [
		'bg01.jpg', 'bg02.jpg', 'bg03.jpg', 'bg04.jpg', 'bg05.jpg', 'bg06.jpg', 'bg07.jpg', 'bg08.jpg', 'bg09.jpg', 'bg10.jpg', 'arrow.png'
	];
	var img_len = img_list.length,
		imgPath = './img/',
		load_num = 0,
		imgArr = [];
	for (var i = 0; i < img_len; i++) {
		imgArr.push(imgPath + img_list[i]);
	}
	function loadImage(path, callback) {
		var img = new Image();
		img.src = path;
		img.onload = function() {
			img.onload = null;
			callback && callback();
		};
	}
	function imgLoader(imgs, callback) {
		var len = imgs.length, i = 0;
		while (imgs.length) {
			loadImage(imgs.shift(), function() {
				callback && callback(++i, len);
			});
		}
	}
	imgLoader(imgArr, function(curNum, len) {
		load_num = curNum / len;
		progress.innerHTML = Math.floor(load_num * 100) + '%';
		if (load_num == 1) {
			setTimeout(function() {
				load.style.opacity = 0;
				setTimeout(function() {
					load.style.display = 'none';
				}, 200);
			}, 500);
		}
	});

})();
// loading 加载页面 end

// 检测是否竖屏
;(function(window, undefined) {
	var vertical = document.getElementById('vertical'),
		orientation = 'onorientationchange' in window,
		w, h;
	function verticalFun() {
		w = document.documentElement.clientWidth;
		h = document.documentElement.clientHeight;
		w > h ? vertical.style.display = 'block' : vertical.style.display = 'none';
	}
	
	orientation ? (window.addEventListener('orientationchange', function() {
		(window.orientation != 0) ? vertical.style.display = 'block' : vertical.style.display = 'none';
	}, false)) : 
	(verticalFun(), (window.addEventListener('resize', verticalFun, false)));
	
})(window);

;(function($, window, undefined){

	var hasTouch = 'ontouchstart' in window ? true : false,
		touchStart = hasTouch ? 'touchstart' : 'mousedown',
		touchMove = hasTouch ? 'touchmove' : 'mousemove',
		touchEnd = hasTouch ? 'touchend' : 'mouseup';

	function TouchSlider(opts) {
		this.touch = opts.touch;		// 触摸元素
		this.box = opts.box;			// 列表元素
		this.len = this.box.length;		// 长度
		this.el = opts.el;				// 动画元素类名
		this.ani = opts.ani;			// 执行动画名
		this.dataList = opts.dataList;	// 数据列表
		this.dataLen = this.dataList.length;	// 获取数据长度
		this.h = $(window).height();	// 屏幕高度
		this._prev = 0;					// 上一个
		this._next = 0;					// 下一个
		this.startY = 0;				// 开始触摸位置
		this.moveY = 0;					// 移动触摸位置
		this.active = 0;				// 当前位置
		this.diff = 0;					// 滑动距离
		this.dataId = 0;				// 当前数据位置
		this.temp = 0;					// 临时存储当前位置数据
		this.flag = false;				// 检测触摸滑动
		this.pcMove = false;			// PC端移动鼠标
	}
	TouchSlider.prototype = {
		constructor: TouchSlider,
		// 设置显示顺序
		setBoxZIndex: function(i) {
			var _self = this;
			switch (i) {
				case 0: 
					_self.box.eq(_self.active).css('z-index', 100);
					_self.box.eq(_self.active + 1).css({
						'z-index': 90,
						'-webkit-transform': 'translate3d(0,'+_self.h+'px,0)',
						'transform': 'translate3d(0,'+_self.h+'px,0)'
					});
					_self.box.eq(_self.active + 2).css({
						'z-index': 80,
						'-webkit-transform': 'translate3d(0,'+(_self.h*2)+'px,0)',
						'transform': 'translate3d(0,'+(_self.h*2)+'px,0)'
					});
					break;
				case 1:
					_self.box.css({
						'z-index': 80,
						'-webkit-transition': 'all 0s ease-out',
						'transition': 'all 0s ease-out',
						'-webkit-transform': 'translate3d(0,'+(_self.h*2)+'px,0)',
						'transform': 'translate3d(0,'+(_self.h*2)+'px,0)'
					});
					break;
			}
		},
		// 设置触摸移动动画
		setTouchAni: function(obj) {
			// 如果没有， 采用默认值
			var i = obj.i || 0,
				z = obj.z || 80,
				ms = obj.ms || '0.3s',
				s = obj.s || 1,
				y = obj._y || 0;
			// 执行动画
			this.box.eq(i).css({
				'z-index': z,
				'-webkit-transition': 'all '+ms+' ease-out',
				'transition': 'all '+ms+' ease-out',
				'-webkit-transform': 'scale('+s+') translate3d(0,'+y+',0)',
				'transform': 'scale('+s+') translate3d(0,'+y+',0)'
			});
		},
		// 触摸开始
		touchStart: function() {
			var _self = this;
			_self.touch.on(touchStart, function(e) {
				_self.startY = parseInt(hasTouch ? e.touches[0].pageY : e.clientY);
				_self.diff = 0;		// 距离清空
				_self.flag = false;
				_self.pcMove = true;
			});
		},
		// 触摸移动
		touchMove: function() {
			var _self = this,
				touch, scale;		// 触摸元素及滑动比例
			_self.touch.on(touchMove, function(e) {
				if (!_self.pcMove) return;

				// 阻止默认事件
				e.preventDefault();	
				// 获取触摸信息
				_self.moveY = parseInt(hasTouch ? e.touches[0].pageY : e.clientY);

				// 滑动距离
				_self.diff = _self.moveY - _self.startY;
				// 缩放比例
				scale = Math.abs(_self.diff * 0.1 / _self.h);

				// 设置显示顺序
				_self.setBoxZIndex(1);

				// 判断滑动方向
				if (_self.diff > 0) {

					// 向下滑动
					_self._prev = (_self.active == 0) ? _self.len - 1 : _self.active - 1;

					// 获取数据并插入
					if (!_self.flag) {
						_self.flag = true;
						_self.temp = _self.dataId;		// 临时存储信息，防止滑动力度较小，回到原位

						(_self.dataId == 0) ? _self.dataId = _self.dataLen - 1 : _self.dataId--;
						// 插入数据
						_self.addElementCon(_self.dataId, _self._prev, null);
					}

					_self.setTouchAni({ i: _self._prev, z: 90, s: scale + 0.8, ms: '0s'});
					_self.setTouchAni({ i: _self.active, z: 100, ms: '0s', _y: parseInt(_self.diff * 0.4)+'px'});


				} else {
					// 向上滑动
					_self._next = (_self.active == _self.len-1) ? 0 : _self.active + 1;

					// 获取数据并插入
					if (!_self.flag) {
						_self.flag = true;
						_self.temp = _self.dataId;		// 临时存储信息，防止滑动力度较小，回到原位

						(_self.dataId == _self.dataLen - 1) ? _self.dataId = 0 : _self.dataId++;
						// 插入数据
						_self.addElementCon(_self.dataId, _self._next, null);
					}

					_self.setTouchAni({ i: _self.active, z: 90, s: 1 - scale, ms: '0s'});
					_self.setTouchAni({ i: _self._next, z: 100, ms: '0s', _y: (parseInt(_self.diff * 0.4)+_self.h)+'px'});

				}
			});
		},
		touchEnd: function() {
			var _self = this,
				prev, next;
			_self.touch.on(touchEnd, function(e) {
				if (_self.diff > 0) {	// 向下滑动
					// 滑动距离大于120，则切换到上一个
					if (_self.diff > 120) {
						_self.setTouchAni({ i: _self.active, z: 100, _y: _self.h+"px" });
						// 上一个
						_self.setTouchAni({ i: _self._prev, z: 90});
						// 当前选项切换
						_self.active = _self._prev;
						// 设置动画
						_self.box.eq(_self.active).find('.'+_self.el).addClass(_self.ani);
					} else {
						// 滑动距离过小，回到原位
						_self.setTouchAni({ i: _self.active, z: 100});
						_self.setTouchAni({ i: _self._prev, s: 0.8, z: 90});

						// 插入数据回到原位
						_self.dataId = _self.temp;

					}

				} else if (_self.diff < 0) {	// 向上滑动
					// 滑动距离大于120，则切换到下一个
					if (_self.diff < -120) {
						_self.setTouchAni({ i: _self.active, s: 0.8, z: 90});
						_self.setTouchAni({ i: _self._next, z: 100});
						
						_self.active = _self._next;

						// 设置动画
						_self.box.eq(_self.active).find('.'+_self.el).addClass(_self.ani);

					} else {	// 距离过小，回到原位
						_self.setTouchAni({ i: _self.active, z: 90});
						_self.setTouchAni({ i: _self._next, z: 100, _y: _self.h+'px' });
						
						// 插入数据回到原位
						_self.dataId = _self.temp;
					}  
				}
				_self.pcMove = false;

			});
		},
		// 窗口发送改变时
		windowChange: function() {
			var _self = this;
			$(window).resize(function() {
				// 设置高度
				_self.h = $(this).height();
			});
		},
		// 添加元素内容
		addElementCon: function(listInd, i, ani) {
			var data = this.dataList[listInd],
				strHTML;
			if (data.html) {	// 检测是否有数据
				strHTML = '<section id="'+data.id+'" class="'+this.el+' '+data.id+'">'+data.html+'</section>';
				// 插入内容
				this.box.eq(i).html(strHTML);
				// 如果是首屏，则添加显示动画类
				if (ani !== null) {
					this.box.eq(i).find('.'+this.el).addClass(ani);
				}
			}
		},
		// 初始化
		init: function(obj) {
			this.setBoxZIndex(0);	// 设置显示顺序
			this.touchStart();		// 触摸开始
			this.touchMove();		// 触摸移动
			this.touchEnd();		// 触摸结束
			this.windowChange();	// 窗口发生改变
			// 添加元素内容
			this.addElementCon(this.dataId, this.active, this.ani);
		}
	};
	
	window.TouchSlider = TouchSlider;


	/********************************
	* 音乐播放功能
	********************************/
	function AudioPlay(opts) {
		this.audio = opts.audio;	// 音乐
		this.btn = opts.btn;		// 播放按钮
		this.off = opts.off;		// 播放状态

		this.musicPlay();			// 音乐播放
	}
	AudioPlay.prototype = {
		constructor: AudioPlay,
		musicPlay: function() {
			var self = this,
				trigger = "ontouchend" in document ? 'touchstart' : 'mouseup';

			function start() {
				document.removeEventListener(trigger, start, false);
				if (!self.audio.paused) return;	// 如果是音频是播放的，则返回
				self.audio.play();
			}
			function toggle() {
				// 检测播放还是暂停
				if (!self.audio.paused) return self.audio.pause();
				self.audio.play();
			}
			function playFun() {
				self.btn.className = '';
			}
			function pauseFun() {
				self.btn.className = self.off;
			}
			
			// 按钮事件
			this.audio.addEventListener('play', playFun, false);
			this.audio.addEventListener('pause', pauseFun, false);
			this.btn.addEventListener('click', toggle, false);
			this.audio.play();

			// 苹果手机默认不自动触发播放，绑定触摸触发播放
			document.addEventListener(trigger, start, false);

		}
	};

	window.AudioPlay = AudioPlay;


})($, window);

// 文本内容
var page_1 = {
	id: 'page_1',
	html :'<div class="arrow2"><img src="img/timg (1).gif"></div><div class="arrow"></div>'
},
page_2 = {
	id : 'page_2',
	html : '<div class="arrow"></div>'
},
page_3 = {
	id : 'page_3',
	html : '<div class="arrow"></div>'
},
page_4 = {
	id : 'page_4',
	html : '<div class="arrow"></div>'
},
page_5 = {
	id : 'page_5',
	html : '<div class="arrow"></div>'
},
page_6 = {
	id : 'page_6',
	html : '<div class="arrow"></div>'
},
page_7 = {
	id : 'page_7',
	html : '<div class="arrow"></div>'
},
page_8 = {
	id : 'page_8',
	html : '<div class="arrow"></div>'
},
page_9 = {
	id : 'page_9',
	html : '<div class="arrow"></div>'
},
page_10 = {
	id : 'page_10',
	html : '<div class="arrow"></div>'
};

// 实例化触摸事件
new TouchSlider({
	touch: $(".main"),
	box: $(".box"),
	el: 'page',
	ani: 'show',
	dataList: [page_1, page_2, page_3, page_4, page_5, page_6, page_7, page_8, page_9, page_10] 		// 数据列表
}).init();


// 实例化音乐播放
new AudioPlay({
	audio: document.getElementById('audio'),
	btn: document.getElementById('audioPlay'),
	off: 'off'
});