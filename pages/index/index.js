/**
 * @fileoverview 首页 - 事项打卡主界面
 * @description 展示事项列表、打卡记录，支持添加/编辑/删除事项
 */

const RecordService = require('../../utils/RecordService');

/**
 * 吉祥物"嘟嘟"的语录库
 * @constant {Array<string>}
 */
var MASCOT_QUOTES = [
  '主人终于看我啦，今天也要开开心心哦✨',
  '肚子空空，想要一点点小零食投喂～',
  '窗外风好大，躲在桌面陪着主人就很安心。',
  '累了就歇一会儿，我安安静静待在旁边陪你。',
  '偷偷踩键盘啦，看主人能不能发现我！',
  '不许一直盯着屏幕，快摸摸我的小脑袋！',
  '无聊 ing，来陪我玩小游戏嘛？',
  '趁你不注意，霸占桌面一小块地盘咯。',
  '阳光暖暖的，就地屏幕打个小盹。',
  '啥也不想干，瘫在桌面放空一整天。',
  '犯困啦，随便晃晃尾巴就很满足。',
  '工作辛苦啦，我就地躺平给你打气。'
];

/**
 * 吉祥物图片路径列表
 * @constant {Array<string>}
 */
var MASCOT_IMAGES = [
  '/images2/64ea822fcd94256efdbe84abd2de1e10.png',
  '/images2/07d28f6da2347c1c1fe527e2f7ea9f22.png',
  '/images2/c095bc553d342170ae25a78b2a5fef66.jpg',
  '/images2/f33943d5c3a55172078491b09f5ef644.jpg',
  '/images2/b6778104512f3d217bcff2a6e3ea1b25.jpg',
  '/images2/346509adda6df80cb7738a4147ea97f7.jpg',
  '/images2/87817505899bcbdeff76534d490b5a89.jpg',
  '/images2/f2fed1e7b4cd699e5b168db4c2c2ca88.jpg'
];

Page({
  data: {
    events: [],
    eventInfos: [],
    displayEvents: [],
    hasMore: false,
    showAddModal: false,
    showCheckIn: false,
    showEditModal: false,
    checkInEvent: null,
    editEvent: null,
    editName: '',
    editIcon: '',
    editThreshold: 24,
    editBgStyle: 'gradient1',
    newName: '',
    newIcon: '',
    newThreshold: 24,
    newBgStyle: 'gradient1',
    emojiOptions: ['💊', '🏃', '💧', '🍎', '📖', '🧘', '😴', '🦷', '🌿', '☕'],
    bgStyles: [],
    mascotImage: '',
    mascotQuote: ''
  },

  /**
   * 页面加载时初始化
   */
  onLoad() {
    this.setData({
      bgStyles: RecordService.getBgStyles(),
      mascotImage: MASCOT_IMAGES[Math.floor(Math.random() * MASCOT_IMAGES.length)],
      mascotQuote: MASCOT_QUOTES[Math.floor(Math.random() * MASCOT_QUOTES.length)]
    });
    this.loadData();
  },

  /**
   * 页面显示时刷新数据和吉祥物
   */
  onShow() {
    this.setData({
      mascotImage: MASCOT_IMAGES[Math.floor(Math.random() * MASCOT_IMAGES.length)],
      mascotQuote: MASCOT_QUOTES[Math.floor(Math.random() * MASCOT_QUOTES.length)]
    });
    this.loadData();
  },

  /**
   * 加载事项列表和记录信息
   */
  loadData() {
    try {
      const events = RecordService.getEventList();
      const bgStyles = RecordService.getBgStyles();
      const eventInfos = events.map(function (evt) {
        var info = RecordService.getRecordInfo(evt.id);
        var bgStyle = bgStyles.find(function (s) { return s.id === (evt.bgStyle || 'gradient1'); });
        return {
          id: evt.id,
          name: evt.name,
          icon: evt.icon,
          color: evt.color,
          threshold: evt.threshold,
          bgStyle: evt.bgStyle || 'gradient1',
          bgGradient: bgStyle ? bgStyle.gradient : '',
          bgPattern: bgStyle ? bgStyle.pattern : 'none',
          pinned: evt.pinned || false,
          lastTimeFormatted: info.lastTimeFormatted,
          intervalText: info.intervalText,
          hint: info.hint
        };
      });

      this.setData({
        events: events,
        eventInfos: eventInfos
      });
    } catch (e) {
      console.error('loadData error:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 点击事项卡片，弹出打卡确认窗
   * @param {Object} e - 事件对象
   */
  onEventTap(e) {
    const id = e.currentTarget.dataset.id;
    const events = RecordService.getEventList();
    const event = events.find(function (ev) { return ev.id === id; });
    if (!event) return;

    this.setData({
      showCheckIn: true,
      checkInEvent: { id: event.id, name: event.name, icon: event.icon }
    });
  },

  /**
   * 确认打卡
   */
  onConfirmCheckIn() {
    const id = this.data.checkInEvent.id;
    const result = RecordService.addRecord(id);

    this.setData({ showCheckIn: false, checkInEvent: null });

    wx.showToast({
      title: result.hint,
      icon: 'none',
      duration: 1500
    });

    if (result.success) {
      try {
        wx.vibrateShort();
      } catch (e) {
        console.warn('vibrate not supported');
      }
      this.loadData();
    }
  },

  /**
   * 关闭打卡弹窗
   */
  onCloseCheckIn() {
    this.setData({ showCheckIn: false, checkInEvent: null });
  },

  /**
   * 点击吉祥物区域，随机更换图片和文案
   */
  onMascotTap() {
    this.setData({
      mascotImage: MASCOT_IMAGES[Math.floor(Math.random() * MASCOT_IMAGES.length)],
      mascotQuote: MASCOT_QUOTES[Math.floor(Math.random() * MASCOT_QUOTES.length)]
    });
  },

  /**
   * 打开编辑事项弹窗
   */
  onShowEdit() {
    const id = this.data.checkInEvent.id;
    const events = RecordService.getEventList();
    const event = events.find(function (ev) { return ev.id === id; });
    if (!event) return;

    this.setData({
      showCheckIn: false,
      showEditModal: true,
      editEvent: event,
      editName: event.name,
      editIcon: event.icon,
      editThreshold: event.threshold,
      editBgStyle: event.bgStyle || 'gradient1'
    });
  },

  /**
   * 关闭编辑弹窗
   */
  onCloseEdit() {
    this.setData({ showEditModal: false, editEvent: null });
  },

  /**
   * 编辑名称输入
   * @param {Object} e - 事件对象
   */
  onEditNameInput(e) {
    this.setData({ editName: e.detail.value });
  },

  /**
   * 编辑提醒间隔输入
   * @param {Object} e - 事件对象
   */
  onEditThresholdInput(e) {
    this.setData({ editThreshold: parseInt(e.detail.value) || 24 });
  },

  /**
   * 编辑时选择图标
   * @param {Object} e - 事件对象
   */
  onEditPickEmoji(e) {
    this.setData({ editIcon: e.currentTarget.dataset.emoji });
  },

  /**
   * 编辑时选择背景样式
   * @param {Object} e - 事件对象
   */
  onEditPickBg(e) {
    this.setData({ editBgStyle: e.currentTarget.dataset.bg });
  },

  /**
   * 确认编辑事项
   */
  onConfirmEdit() {
    var name = this.data.editName.trim();
    var icon = this.data.editIcon;
    if (!name) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
    if (!icon) {
      wx.showToast({ title: '请选择图标', icon: 'none' });
      return;
    }

    try {
      RecordService.updateEvent(this.data.editEvent.id, {
        name: name,
        icon: icon,
        threshold: this.data.editThreshold,
        bgStyle: this.data.editBgStyle
      });

      this.setData({ showEditModal: false, editEvent: null });
      this.loadData();
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      console.error('onConfirmEdit error:', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  /**
   * 长按事项卡片，删除事项
   * @param {Object} e - 事件对象
   */
  onEventLongPress(e) {
    const id = e.currentTarget.dataset.id;
    const events = RecordService.getEventList();
    const event = events.find(function (ev) { return ev.id === id; });
    if (!event) return;
    if (event.pinned) {
      wx.showToast({ title: '默认事项不能删除', icon: 'none' });
      return;
    }

    var self = this;
    wx.showModal({
      title: '删除事项',
      content: '确定删除「' + event.name + '」及其所有记录？',
      success: function (res) {
        if (res.confirm) {
          try {
            RecordService.removeEvent(id);
            self.loadData();
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (e) {
            console.error('removeEvent error:', e);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 打开添加事项弹窗
   */
  onShowAdd() {
    this.setData({ showAddModal: true, newName: '', newIcon: '', newThreshold: 24, newBgStyle: 'gradient1' });
  },

  /**
   * 关闭添加弹窗
   */
  onCloseAdd() {
    this.setData({ showAddModal: false });
  },

  /**
   * 新事项名称输入
   * @param {Object} e - 事件对象
   */
  onNameInput(e) {
    this.setData({ newName: e.detail.value });
  },

  /**
   * 新事项提醒间隔输入
   * @param {Object} e - 事件对象
   */
  onThresholdInput(e) {
    this.setData({ newThreshold: parseInt(e.detail.value) || 24 });
  },

  /**
   * 新事项选择图标
   * @param {Object} e - 事件对象
   */
  onPickEmoji(e) {
    this.setData({ newIcon: e.currentTarget.dataset.emoji });
  },

  /**
   * 新事项选择背景样式
   * @param {Object} e - 事件对象
   */
  onPickBg(e) {
    this.setData({ newBgStyle: e.currentTarget.dataset.bg });
  },

  /**
   * 确认添加新事项
   */
  onConfirmAdd() {
    var name = this.data.newName.trim();
    var icon = this.data.newIcon;
    if (!name) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
    if (!icon) {
      wx.showToast({ title: '请选择图标', icon: 'none' });
      return;
    }

    try {
      var colors = ['#e88e5a', '#5a9fd4', '#9b59b6', '#27ae60', '#e74c3c', '#f39c12'];
      var events = RecordService.getEventList();
      var color = colors[events.length % colors.length];

      RecordService.addEvent({
        id: RecordService.generateId(),
        name: name,
        icon: icon,
        color: color,
        threshold: this.data.newThreshold,
        shortInterval: 10,
        bgStyle: this.data.newBgStyle
      });

      this.setData({ showAddModal: false });
      this.loadData();
      wx.showToast({ title: '添加成功', icon: 'success' });
    } catch (e) {
      console.error('onConfirmAdd error:', e);
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  },

  /**
   * 分享给好友
   * @returns {Object} 分享配置
   */
  onShareAppMessage() {
    return {
      title: '我在用这个小工具记录生活习惯，一起来打卡吧',
      path: '/pages/index/index'
    };
  },

  /**
   * 分享到朋友圈
   * @returns {Object} 分享配置
   */
  onShareTimeline() {
    return {
      title: '生活习惯打卡小助手'
    };
  }
});
