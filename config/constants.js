/**
 * @fileoverview 常量定义
 * @description 定义应用程序中使用的所有常量，包括记录类型、数据库配置等
 */

/** 记录类型枚举 */
const RECORD_TYPE = {
  /** 排便记录 */
  POOP: 'poop',
  /** 洗头记录 */
  SHAMPOO: 'shampoo'
};

/** 数据库集合名称 */
const DB_COLLECTION = {
  /** 事件记录集合 */
  EVENT_RECORD: 'EventRecord'
};

/** 提醒阈值配置（单位：小时） */
const REMINDER_THRESHOLD = {
  /** 排便提醒阈值（默认24小时） */
  POOP: 24,
  /** 洗头提醒阈值（默认72小时，即3天） */
  SHAMPOO: 72
};

/** 时间间隔提示阈值（单位：分钟） */
const INTERVAL_HINT = {
  /** 过短间隔提示阈值（10分钟） */
  TOO_SHORT: 10,
  /** 洗头过长间隔提示阈值（3天） */
  SHAMPOO_TOO_LONG: 4320 // 3天 = 3 * 24 * 60 分钟
};

/** 提示文案 */
const HINT_MESSAGE = {
  /** 排便过短间隔提示 */
  POOP_TOO_SHORT: '刚才不是去过啦？',
  /** 洗头过长间隔提示 */
  SHAMPOO_TOO_LONG: '头皮都要长草啦🌿',
  /** 排便超过24小时提示 */
  POOP_OVERDUE: '该去释放压力啦！',
  /** 洗头超过3天提示 */
  SHAMPOO_OVERDUE: '头发该洗啦！'
};

module.exports = {
  RECORD_TYPE,
  DB_COLLECTION,
  REMINDER_THRESHOLD,
  INTERVAL_HINT,
  HINT_MESSAGE
};