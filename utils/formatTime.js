/**
 * @fileoverview 时间格式化工具
 * @description 提供时间相关的格式化函数
 */

/**
 * 格式化时间戳为 YYYY-MM-DD HH:mm 格式
 * @param {number|Date} timestamp - 时间戳或Date对象
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(timestamp) {
  if (!timestamp) return '';

  const date = typeof timestamp === 'number'
    ? new Date(timestamp)
    : timestamp;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * 计算两个时间戳之间的间隔
 * @param {number} timestamp1 - 较早的时间戳
 * @param {number} timestamp2 - 较晚的时间戳（默认为当前时间）
 * @returns {Object} 间隔对象 { days, hours, minutes, totalMinutes }
 */
function calculateInterval(timestamp1, timestamp2) {
  if (!timestamp1) return null;

  const endTime = timestamp2 || Date.now();
  const diff = endTime - timestamp1;

  if (diff < 0) return null;

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    days,
    hours,
    minutes,
    totalMinutes
  };
}

/**
 * 将间隔对象格式化为友好的文字描述
 * @param {Object} interval - 间隔对象 { days, hours, minutes }
 * @returns {string} 格式化的时间间隔描述
 */
function formatInterval(interval) {
  if (!interval) return '未开始';

  const { days, hours, minutes } = interval;

  if (days > 0) {
    return `${days}天 ${hours}小时`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟`;
  } else {
    return '刚刚';
  }
}

module.exports = {
  formatTime,
  calculateInterval,
  formatInterval
};