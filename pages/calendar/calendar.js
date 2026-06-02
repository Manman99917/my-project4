/**
 * @fileoverview 日历页面 - 查看历史打卡记录
 * @description 月视图展示打卡记录，支持滑动切换月份，点击日期查看详情
 */

var RecordService = require('../../utils/RecordService');

/**
 * 底部随机文案库
 * @constant {Array<string>}
 */
var RANDOM_QUOTES = [
  '翻翻日历找找规律',
  '回顾一下打卡记录',
  '规律生活从记录开始',
  '每一次记录都是对自己的关心',
  '身体的节奏藏在日历里',
  '让我康康这个月的战绩',
  '打卡达人就是我本人',
  '看看哪天最勤快'
];

Page({
  data: {
    year: 0,
    month: 0,
    days: [],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    selectedDay: null,
    selectedRecords: [],
    slideAnim: '',
    bottomQuote: '',
    pinnedIds: []
  },

  touchStartX: 0,
  touchStartY: 0,

  /**
   * 页面加载时初始化
   */
  onLoad: function () {
    var now = new Date();
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1
    });
    this.loadPinnedIds();
    this.buildCalendar();
    this.generateQuote();
  },

  /**
   * 页面显示时刷新数据
   */
  onShow: function () {
    this.loadPinnedIds();
    this.buildCalendar();
    this.generateQuote();
  },

  /**
   * 加载置顶事项ID列表（用于日历显示前2个）
   */
  loadPinnedIds: function () {
    try {
      var events = RecordService.getEventList();
      var ids = events.slice(0, 2).map(function (e) { return e.id; });
      this.setData({ pinnedIds: ids });
    } catch (e) {
      console.error('loadPinnedIds error:', e);
    }
  },

  /**
   * 生成随机底部文案
   */
  generateQuote: function () {
    var quote = RANDOM_QUOTES[Math.floor(Math.random() * RANDOM_QUOTES.length)];
    this.setData({ bottomQuote: quote });
  },

  /**
   * 构建日历数据
   */
  buildCalendar: function () {
    try {
      var year = this.data.year;
      var month = this.data.month;
      var records = RecordService.getRecordsByMonth(year, month);
      var events = RecordService.getEventList();
      var pinnedIds = this.data.pinnedIds;

      var firstDay = new Date(year, month - 1, 1).getDay();
      var daysInMonth = new Date(year, month, 0).getDate();

      var days = [];

      // 填充月初空白
      for (var i = 0; i < firstDay; i++) {
        days.push({ day: '', empty: true, icons: [] });
      }

      // 填充日期
      for (var d = 1; d <= daysInMonth; d++) {
        var dayRecords = records[d];
        var icons = [];
        var hasMore = false;

        if (dayRecords) {
          var shown = 0;
          for (var j = 0; j < events.length; j++) {
            var evt = events[j];
            if (dayRecords[evt.id] && dayRecords[evt.id].length > 0) {
              if (shown < 2) {
                icons.push(evt.icon);
                shown++;
              } else {
                hasMore = true;
                break;
              }
            }
          }
        }

        days.push({
          day: d,
          empty: false,
          icons: icons,
          hasMore: hasMore
        });
      }

      this.setData({ days: days, selectedDay: null, selectedRecords: [] });
    } catch (e) {
      console.error('buildCalendar error:', e);
      wx.showToast({ title: '日历加载失败', icon: 'none' });
    }
  },

  /**
   * 触摸开始，记录位置
   * @param {Object} e - 事件对象
   */
  onTouchStart: function (e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  /**
   * 触摸结束，判断滑动方向
   * @param {Object} e - 事件对象
   */
  onTouchEnd: function (e) {
    var endX = e.changedTouches[0].clientX;
    var endY = e.changedTouches[0].clientY;
    var diffX = endX - this.touchStartX;
    var diffY = endY - this.touchStartY;

    // 水平滑动距离不够或垂直滑动更多，忽略
    if (Math.abs(diffX) < 60 || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      this.slideToMonth('slide-right');
      this.onPrevMonth();
    } else {
      this.slideToMonth('slide-left');
      this.onNextMonth();
    }
  },

  /**
   * 切换月份动画
   * @param {string} direction - 动画方向
   */
  slideToMonth: function (direction) {
    var self = this;
    this.setData({ slideAnim: direction });
    setTimeout(function () {
      self.setData({ slideAnim: '' });
    }, 300);
  },

  /**
   * 切换到上一月
   */
  onPrevMonth: function () {
    var year = this.data.year;
    var month = this.data.month - 1;
    if (month < 1) { month = 12; year--; }
    this.setData({ year: year, month: month });
    this.buildCalendar();
    this.generateQuote();
  },

  /**
   * 切换到下一月
   */
  onNextMonth: function () {
    var year = this.data.year;
    var month = this.data.month + 1;
    if (month > 12) { month = 1; year++; }
    this.setData({ year: year, month: month });
    this.buildCalendar();
    this.generateQuote();
  },

  /**
   * 点击日期，查看详情
   * @param {Object} e - 事件对象
   */
  onDayTap: function (e) {
    var day = e.currentTarget.dataset.day;
    if (!day) return;

    try {
      var records = RecordService.getRecordsByMonth(this.data.year, this.data.month);
      var dayRecords = records[day];
      if (!dayRecords) return;

      var events = RecordService.getEventList();
      var details = [];

      events.forEach(function (evt) {
        if (dayRecords[evt.id] && dayRecords[evt.id].length > 0) {
          dayRecords[evt.id].forEach(function (ts) {
            details.push({
              eventId: evt.id,
              label: evt.name,
              icon: evt.icon,
              time: RecordService.formatTime(ts),
              timestamp: ts
            });
          });
        }
      });

      details.sort(function (a, b) {
        return a.timestamp - b.timestamp;
      });

      this.setData({ selectedDay: day, selectedRecords: details });
    } catch (e) {
      console.error('onDayTap error:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 删除某条记录
   * @param {Object} e - 事件对象
   */
  onDeleteRecord: function (e) {
    var index = e.currentTarget.dataset.index;
    var record = this.data.selectedRecords[index];
    var self = this;

    wx.showModal({
      title: '确认删除',
      content: '删除这条' + record.label + '记录？',
      success: function (res) {
        if (res.confirm) {
          try {
            RecordService.removeRecord(record.eventId, record.timestamp);
            self.buildCalendar();

            var records = RecordService.getRecordsByMonth(self.data.year, self.data.month);
            var dayRecords = records[self.data.selectedDay];
            if (!dayRecords || Object.keys(dayRecords).every(function (k) { return dayRecords[k].length === 0; })) {
              self.setData({ selectedDay: null, selectedRecords: [] });
            } else {
              self.onDayTap({ currentTarget: { dataset: { day: self.data.selectedDay } } });
            }

            wx.showToast({ title: '已删除', icon: 'success', duration: 1000 });
          } catch (e) {
            console.error('onDeleteRecord error:', e);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 关闭详情弹窗
   */
  onCloseDetail: function () {
    this.setData({ selectedDay: null, selectedRecords: [] });
  },

  /**
   * 分享给好友
   * @returns {Object} 分享配置
   */
  onShareAppMessage: function () {
    return {
      title: '我在用这个小工具记录生活习惯，一起来打卡吧',
      path: '/pages/index/index'
    };
  },

  /**
   * 分享到朋友圈
   * @returns {Object} 分享配置
   */
  onShareTimeline: function () {
    return {
      title: '生活习惯打卡小助手'
    };
  }
});
