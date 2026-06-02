/**
 * @fileoverview 记录服务 - 负责事项和打卡记录的数据管理
 * @description 提供事项列表管理、打卡记录增删改查、历史数据统计等功能
 */

/**
 * 默认事项配置
 * @constant {Array<Object>}
 */
var DEFAULT_EVENTS = [
  { id: 'poop', name: '排便', icon: '💩', color: '#8b7355', threshold: 24, shortInterval: 10, pinned: true, bgStyle: 'gradient1' },
  { id: 'shampoo', name: '洗头', icon: '🧴', color: '#7eb8b8', threshold: 72, shortInterval: 10, pinned: true, bgStyle: 'gradient2' }
];

/**
 * 背景样式预设
 * @constant {Array<Object>}
 */
var BG_STYLES = [
  { id: 'gradient1', name: '粉橙渐变', gradient: 'linear-gradient(135deg, #ffd1dc 0%, #ffb6c1 100%)', pattern: 'dots' },
  { id: 'gradient2', name: '蓝紫渐变', gradient: 'linear-gradient(135deg, #a8e6ff 0%, #d4b5ff 100%)', pattern: 'waves' },
  { id: 'gradient3', name: '绿薄荷渐变', gradient: 'linear-gradient(135deg, #c3f5d9 0%, #a8e6cf 100%)', pattern: 'dots' },
  { id: 'gradient4', name: '黄橙渐变', gradient: 'linear-gradient(135deg, #ffe9a0 0%, #ffd97d 100%)', pattern: 'stripes' },
  { id: 'gradient5', name: '桃粉渐变', gradient: 'linear-gradient(135deg, #ffd4e5 0%, #ffaac9 100%)', pattern: 'none' },
  { id: 'gradient6', name: '紫蓝渐变', gradient: 'linear-gradient(135deg, #dcd1ff 0%, #b8c5ff 100%)', pattern: 'waves' },
  { id: 'gradient7', name: '薄荷绿渐变', gradient: 'linear-gradient(135deg, #c5f4e0 0%, #a0e7c7 100%)', pattern: 'dots' },
  { id: 'gradient8', name: '奶橙渐变', gradient: 'linear-gradient(135deg, #ffe0c4 0%, #ffc9a3 100%)', pattern: 'stripes' },
  { id: 'gradient9', name: '天蓝渐变', gradient: 'linear-gradient(135deg, #cce7ff 0%, #a8d4ff 100%)', pattern: 'none' },
  { id: 'gradient10', name: '樱花粉渐变', gradient: 'linear-gradient(135deg, #ffd6e8 0%, #ffb3d4 100%)', pattern: 'waves' },
  { id: 'solid1', name: '奶黄纯色', gradient: 'linear-gradient(135deg, #fff9e6 0%, #fff9e6 100%)', pattern: 'dots' },
  { id: 'solid2', name: '薄荷纯色', gradient: 'linear-gradient(135deg, #e8f8f5 0%, #e8f8f5 100%)', pattern: 'stripes' },
  { id: 'solid3', name: '淡紫纯色', gradient: 'linear-gradient(135deg, #f3eeff 0%, #f3eeff 100%)', pattern: 'waves' },
  { id: 'solid4', name: '粉嫩纯色', gradient: 'linear-gradient(135deg, #fff0f5 0%, #fff0f5 100%)', pattern: 'dots' }
];

/**
 * 短时间间隔提示文案
 * @constant {Array<string>}
 */
var SHORT_HINTS = [
  '刚才不是做过了吗？',
  '别急，给自己点时间',
  '这么快又来？',
  '冷静冷静',
  '你是不是点错了'
];

/**
 * 打卡成功提示文案
 * @constant {Array<string>}
 */
var SUCCESS_HINTS = [
  '已记录～',
  '打卡成功',
  '不错不错',
  '好的收到',
  '记上了',
  '又完成一件事'
];

/**
 * 从数组中随机选择一个元素
 * @param {Array} arr - 源数组
 * @returns {*} 随机选中的元素
 */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 格式化时间戳为字符串
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} 格式化后的时间字符串 YYYY-MM-DD HH:mm
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  var date = new Date(timestamp);
  var y = date.getFullYear();
  var m = ('0' + (date.getMonth() + 1)).slice(-2);
  var d = ('0' + date.getDate()).slice(-2);
  var h = ('0' + date.getHours()).slice(-2);
  var min = ('0' + date.getMinutes()).slice(-2);
  return y + '-' + m + '-' + d + ' ' + h + ':' + min;
}

/**
 * 计算两个时间戳之间的间隔
 * @param {number} t1 - 开始时间戳
 * @param {number} [t2] - 结束时间戳，默认为当前时间
 * @returns {Object|null} 间隔对象 {days, hours, minutes, totalMinutes}
 */
function calculateInterval(t1, t2) {
  if (!t1) return null;
  var end = t2 || Date.now();
  var diff = end - t1;
  if (diff < 0) return null;
  var totalMinutes = Math.floor(diff / 60000);
  var days = Math.floor(totalMinutes / 1440);
  var hours = Math.floor((totalMinutes % 1440) / 60);
  var minutes = totalMinutes % 60;
  return { days: days, hours: hours, minutes: minutes, totalMinutes: totalMinutes };
}

/**
 * 格式化间隔对象为可读字符串
 * @param {Object} interval - 间隔对象
 * @returns {string} 格式化后的间隔字符串
 */
function formatInterval(interval) {
  if (!interval) return '--';
  if (interval.days > 0) return interval.days + '天 ' + interval.hours + '小时';
  if (interval.hours > 0) return interval.hours + '小时 ' + interval.minutes + '分钟';
  if (interval.minutes > 0) return interval.minutes + '分钟';
  return '刚刚';
}

/**
 * 获取事项列表
 * @returns {Array<Object>} 事项列表
 */
function getEventList() {
  try {
    var list = wx.getStorageSync('event_list');
    if (list && list.length > 0) return list;
  } catch (e) {
    console.error('getEventList error:', e);
  }
  wx.setStorageSync('event_list', DEFAULT_EVENTS);
  return DEFAULT_EVENTS;
}

/**
 * 保存事项列表
 * @param {Array<Object>} list - 事项列表
 */
function saveEventList(list) {
  try {
    wx.setStorageSync('event_list', list);
  } catch (e) {
    console.error('saveEventList error:', e);
  }
}

/**
 * 添加新事项
 * @param {Object} event - 事项对象
 * @returns {Array<Object>} 更新后的事项列表
 */
function addEvent(event) {
  var list = getEventList();
  list.push(event);
  saveEventList(list);
  return list;
}

/**
 * 更新事项信息
 * @param {string} id - 事项ID
 * @param {Object} updates - 要更新的字段
 * @returns {Array<Object>} 更新后的事项列表
 */
function updateEvent(id, updates) {
  var list = getEventList();
  var index = list.findIndex(function (e) { return e.id === id; });
  if (index > -1) {
    list[index] = Object.assign({}, list[index], updates);
    saveEventList(list);
  }
  return list;
}

/**
 * 删除事项及其所有记录
 * @param {string} id - 事项ID
 * @returns {Array<Object>} 更新后的事项列表
 */
function removeEvent(id) {
  var list = getEventList();
  list = list.filter(function (e) { return e.id !== id; });
  saveEventList(list);
  try {
    wx.removeStorageSync('latest_' + id);
    wx.removeStorageSync('history_' + id);
  } catch (e) {
    console.error('removeEvent storage cleanup error:', e);
  }
  return list;
}

/**
 * 获取事项的历史记录
 * @param {string} id - 事项ID
 * @returns {Array<number>} 时间戳数组
 */
function getHistory(id) {
  try {
    var value = wx.getStorageSync('history_' + id);
    return value || [];
  } catch (e) {
    console.error('getHistory error:', e);
    return [];
  }
}

/**
 * 获取事项的最近一次记录时间
 * @param {string} id - 事项ID
 * @returns {number|null} 时间戳
 */
function getLatest(id) {
  try {
    var value = wx.getStorageSync('latest_' + id);
    return value || null;
  } catch (e) {
    console.error('getLatest error:', e);
    return null;
  }
}

/**
 * 添加打卡记录
 * @param {string} id - 事项ID
 * @returns {Object} 结果对象 {success, timestamp, hint, isShortInterval}
 */
function addRecord(id) {
  var now = Date.now();
  var events = getEventList();
  var event = events.find(function (e) { return e.id === id; });
  var shortInterval = event ? event.shortInterval : 10;

  var latest = getLatest(id);
  if (latest) {
    var interval = calculateInterval(latest, now);
    if (interval && interval.totalMinutes < shortInterval) {
      return { success: false, hint: randomFrom(SHORT_HINTS), isShortInterval: true };
    }
  }

  try {
    wx.setStorageSync('latest_' + id, now);
    var history = getHistory(id);
    history.push(now);
    wx.setStorageSync('history_' + id, history);
  } catch (e) {
    console.error('addRecord error:', e);
    return { success: false, hint: '记录失败，请重试', isShortInterval: false };
  }

  return { success: true, timestamp: now, hint: randomFrom(SUCCESS_HINTS) };
}

/**
 * 删除指定的打卡记录
 * @param {string} id - 事项ID
 * @param {number} timestamp - 要删除的记录时间戳
 */
function removeRecord(id, timestamp) {
  try {
    var history = getHistory(id);
    var index = history.indexOf(timestamp);
    if (index > -1) {
      history.splice(index, 1);
      wx.setStorageSync('history_' + id, history);
    }
    if (history.length > 0) {
      wx.setStorageSync('latest_' + id, history[history.length - 1]);
    } else {
      wx.removeStorageSync('latest_' + id);
    }
  } catch (e) {
    console.error('removeRecord error:', e);
  }
}

/**
 * 获取事项的记录信息摘要
 * @param {string} id - 事项ID
 * @returns {Object} 记录信息对象
 */
function getRecordInfo(id) {
  var latest = getLatest(id);
  var events = getEventList();
  var event = events.find(function (e) { return e.id === id; });

  if (!latest) {
    return { hasRecord: false, lastTimeFormatted: '--', intervalText: '--', hint: null };
  }

  var interval = calculateInterval(latest);
  var intervalText = formatInterval(interval);
  var lastTimeFormatted = formatTime(latest);

  var hint = null;
  if (event && interval && interval.totalMinutes >= event.threshold * 60) {
    hint = '该' + event.name + '啦！';
  }

  return {
    hasRecord: true,
    lastTime: latest,
    lastTimeFormatted: lastTimeFormatted,
    intervalText: intervalText,
    hint: hint
  };
}

/**
 * 获取指定月份的所有记录
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {Object} 以日期为key的记录对象
 */
function getRecordsByMonth(year, month) {
  var events = getEventList();
  var result = {};

  events.forEach(function (event) {
    var history = getHistory(event.id);
    history.forEach(function (ts) {
      var date = new Date(ts);
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        var day = date.getDate();
        if (!result[day]) result[day] = {};
        if (!result[day][event.id]) result[day][event.id] = [];
        result[day][event.id].push(ts);
      }
    });
  });

  return result;
}

/**
 * 获取日期的唯一标识字符串
 * @param {number} ts - 时间戳
 * @returns {string} 日期标识 YYYY-M-D
 */
function getDateKey(ts) {
  var d = new Date(ts);
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

/**
 * 计算连续打卡天数
 * @param {string} id - 事项ID
 * @returns {Object} 连续天数信息 {streak, title}
 */
function getStreak(id) {
  var history = getHistory(id);
  if (history.length === 0) return { streak: 0, title: null };

  var daySet = {};
  history.forEach(function (ts) {
    daySet[getDateKey(ts)] = true;
  });

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var streak = 0;
  var check = new Date(today);

  if (!daySet[getDateKey(check.getTime())]) {
    check.setDate(check.getDate() - 1);
    if (!daySet[getDateKey(check.getTime())]) return { streak: 0, title: null };
  }

  while (daySet[getDateKey(check.getTime())]) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  var title = null;
  if (streak >= 30) title = '超级达人';
  else if (streak >= 14) title = '习惯养成';
  else if (streak >= 7) title = '坚持一周';
  else if (streak >= 3) title = '小有成就';

  return { streak: streak, title: title };
}

/**
 * 生成唯一的事项ID
 * @returns {string} 事项ID
 */
function generateId() {
  return 'evt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

module.exports = {
  getEventList: getEventList,
  addEvent: addEvent,
  updateEvent: updateEvent,
  removeEvent: removeEvent,
  addRecord: addRecord,
  removeRecord: removeRecord,
  getRecordInfo: getRecordInfo,
  getRecordsByMonth: getRecordsByMonth,
  getStreak: getStreak,
  formatTime: formatTime,
  generateId: generateId,
  getBgStyles: function () { return BG_STYLES; }
};
