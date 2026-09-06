import { createContext, useContext } from 'react';

type TransferSide = 'source' | 'target';

export interface LumenLocale {
  locale: string;
  common: {
    loading: string;
    clear: string;
    confirm: string;
    now: string;
    today: string;
  };
  navigation: {
    appBar: string;
    bottomNavigation: string;
    breadcrumb: string;
    sideNav: string;
    toolbar: string;
  };
  select: {
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    loadingText: string;
    multipleCountLabel: (count: number) => string;
    selectedCount: (count: number) => string;
    removeItem: (label: string) => string;
  };
  treeSelect: {
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    loadingText: string;
    selectedCount: (count: number) => string;
    removeItem: (label: string) => string;
  };
  cascader: {
    label: string;
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    loadingText: string;
    clear: string;
    searchResults: string;
    column: (index: number) => string;
  };
  commandPalette: {
    label: string;
    placeholder: string;
    emptyText: string;
    loadingText: string;
  };
  calendar: {
    weekdays: string[];
    months: string[];
    previousYearPage: string;
    nextYearPage: string;
    previousYear: string;
    nextYear: string;
    previousMonth: string;
    nextMonth: string;
    year: (year: number) => string;
    month: (year: number, month: number) => string;
    selectDate: (date: string) => string;
  };
  datePicker: {
    placeholder: string;
    formatYearMonth: (year: number, month: number) => string;
    formatDate: (year: number, month: number, day: number) => string;
  };
  dateTimePicker: {
    placeholder: string;
    valueLabel: (label: string) => string;
  };
  timePicker: {
    placeholder: string;
    hour: string;
    minute: string;
    second: string;
  };
  transfer: {
    sourceTitle: string;
    targetTitle: string;
    searchPlaceholder: string;
    emptyText: string;
    selectAll: (side: TransferSide) => string;
    search: (side: TransferSide) => string;
    list: (side: TransferSide) => string;
    moveToTarget: string;
    moveToSource: string;
  };
  pagination: {
    itemLabel: string;
    total: (total: number, itemLabel: string) => string;
    page: (current: number, total: number) => string;
    pageSize: (size: number) => string;
    previous: string;
    next: string;
  };
  pullToRefresh: {
    pulling: string;
    release: string;
    refreshing: string;
  };
  fileUpload: {
    inputLabel: string;
    unsupportedType: string;
    maxSize: (size: string) => string;
    maxFiles: (count: number) => string;
    uploading: string;
    dropToUpload: string;
    dragOrClick: string;
    dragOrChoose: string;
    progress: string;
    removeFile: (name: string) => string;
  };
  dataTable: {
    emptyText: string;
    selectAll: string;
    selectRow: (index: number) => string;
  };
  timeline: {
    emptyText: string;
    details: string;
    before: string;
    after: string;
    remaining: (count: number) => string;
  };
  toast: {
    success: string;
    info: string;
    warning: string;
    error: string;
    close: string;
  };
  accessibility: {
    alertClose: string;
    chipRemove: string;
    empty: string;
    fab: string;
    loading: string;
    passwordShow: string;
    passwordHide: string;
    rating: string;
    increment: string;
    decrement: string;
    scrollToTop?: string;
    scrollToBottom?: string;
  };
  confirmDialog: {
    confirm: string;
    cancel: string;
  };
}

export const zhCN: LumenLocale = {
  locale: 'zh-CN',
  common: { loading: '加载中', clear: '清除', confirm: '确定', now: '此刻', today: '今天' },
  navigation: { appBar: '应用栏', bottomNavigation: '底部导航', breadcrumb: '面包屑', sideNav: '侧边导航', toolbar: '工具栏' },
  select: {
    placeholder: '请选择', searchPlaceholder: '搜索...', emptyText: '无匹配选项', loadingText: '加载中...',
    multipleCountLabel: (count) => `已选择 ${count} 项`, selectedCount: (count) => `已选 ${count} 项`, removeItem: (label) => `移除 ${label}`,
  },
  treeSelect: {
    placeholder: '请选择', searchPlaceholder: '搜索组织节点', emptyText: '无可选节点', loadingText: '加载中...',
    selectedCount: (count) => `已选 ${count} 项`, removeItem: (label) => `移除 ${label}`,
  },
  cascader: {
    label: '级联选择', placeholder: '请选择', searchPlaceholder: '搜索选项', emptyText: '无匹配选项', loadingText: '加载中...',
    clear: '清除选择', searchResults: '搜索结果', column: (index) => `第 ${index} 级选项`,
  },
  commandPalette: { label: '命令面板', placeholder: '搜索命令...', emptyText: '没有匹配的命令', loadingText: '加载中...' },
  calendar: {
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    previousYearPage: '上一组年份', nextYearPage: '下一组年份', previousYear: '上一年', nextYear: '下一年', previousMonth: '上个月', nextMonth: '下个月',
    year: (year) => `${year}年`, month: (year, month) => `${year}年${month}月`, selectDate: (date) => `选择日期 ${date}`,
  },
  datePicker: {
    placeholder: '请选择日期', formatYearMonth: (year, month) => `${year}年${month}月`, formatDate: (year, month, day) => `${year}年${month}月${day}日`,
  },
  dateTimePicker: { placeholder: '请选择日期时间', valueLabel: (label) => `${label}值` },
  timePicker: { placeholder: '请选择时间', hour: '时', minute: '分', second: '秒' },
  transfer: {
    sourceTitle: '可选项', targetTitle: '已选项', searchPlaceholder: '搜索', emptyText: '暂无数据',
    selectAll: (side) => `选择${side === 'source' ? '可选' : '已选'}列表全部可见项`,
    search: (side) => `${side === 'source' ? '可选' : '已选'}列表搜索`,
    list: (side) => `${side === 'source' ? '可选' : '已选'}列表`, moveToTarget: '移到右侧', moveToSource: '移到左侧',
  },
  pagination: {
    itemLabel: '条', total: (total, itemLabel) => `共 ${total} ${itemLabel}`, page: (current, total) => `第 ${current} / ${total} 页`,
    pageSize: (size) => `${size}条/页`, previous: '上一页', next: '下一页',
  },
  pullToRefresh: { pulling: '下拉刷新', release: '释放刷新', refreshing: '正在刷新' },
  fileUpload: {
    inputLabel: '文件上传', unsupportedType: '文件格式不受支持', maxSize: (size) => `文件大小不能超过 ${size}`, maxFiles: (count) => `最多选择 ${count} 个文件`,
    uploading: '正在上传文件', dropToUpload: '释放文件以上传', dragOrClick: '拖拽文件到此处，或点击上传', dragOrChoose: '拖拽文件到此处，或点击选择文件',
    progress: '上传进度', removeFile: (name) => `移除 ${name}`,
  },
  dataTable: { emptyText: '暂无数据', selectAll: '选择当前页全部行', selectRow: (index) => `选择第 ${index} 行` },
  timeline: { emptyText: '暂无记录', details: '详情', before: '变更前', after: '变更后', remaining: (count) => `还有 ${count} 条记录` },
  toast: { success: '操作成功', info: '提示', warning: '请注意', error: '操作失败', close: '关闭消息提示' },
  accessibility: {
    alertClose: '关闭提示', chipRemove: '移除标签', empty: '暂无数据', fab: '浮动操作', loading: '加载中',
    passwordShow: '显示密码', passwordHide: '隐藏密码', rating: '评分', increment: '增加', decrement: '减少',
    scrollToTop: '回到顶部', scrollToBottom: '滚动到底部',
  },
  confirmDialog: { confirm: '确认', cancel: '取消' },
};

export const enUS: LumenLocale = {
  locale: 'en-US',
  common: { loading: 'Loading', clear: 'Clear', confirm: 'Confirm', now: 'Now', today: 'Today' },
  navigation: { appBar: 'Application bar', bottomNavigation: 'Bottom navigation', breadcrumb: 'Breadcrumb', sideNav: 'Side navigation', toolbar: 'Toolbar' },
  select: {
    placeholder: 'Select', searchPlaceholder: 'Search...', emptyText: 'No matching options', loadingText: 'Loading...',
    multipleCountLabel: (count) => `${count} selected`, selectedCount: (count) => `${count} selected`, removeItem: (label) => `Remove ${label}`,
  },
  treeSelect: {
    placeholder: 'Select', searchPlaceholder: 'Search nodes', emptyText: 'No available nodes', loadingText: 'Loading...',
    selectedCount: (count) => `${count} selected`, removeItem: (label) => `Remove ${label}`,
  },
  cascader: {
    label: 'Cascader', placeholder: 'Select', searchPlaceholder: 'Search options', emptyText: 'No matching options', loadingText: 'Loading...',
    clear: 'Clear selection', searchResults: 'Search results', column: (index) => `Level ${index} options`,
  },
  commandPalette: { label: 'Command palette', placeholder: 'Search commands...', emptyText: 'No matching commands', loadingText: 'Loading...' },
  calendar: {
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    previousYearPage: 'Previous years', nextYearPage: 'Next years', previousYear: 'Previous year', nextYear: 'Next year', previousMonth: 'Previous month', nextMonth: 'Next month',
    year: (year) => String(year), month: (year, month) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(year, month - 1, 1)),
    selectDate: (date) => `Select date ${date}`,
  },
  datePicker: {
    placeholder: 'Select date', formatYearMonth: (year, month) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(year, month - 1, 1)),
    formatDate: (year, month, day) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(year, month - 1, day)),
  },
  dateTimePicker: { placeholder: 'Select date and time', valueLabel: (label) => `${label} value` },
  timePicker: { placeholder: 'Select time', hour: 'Hour', minute: 'Minute', second: 'Second' },
  transfer: {
    sourceTitle: 'Available', targetTitle: 'Selected', searchPlaceholder: 'Search', emptyText: 'No data',
    selectAll: (side) => `Select all visible ${side === 'source' ? 'available' : 'selected'} items`,
    search: (side) => `Search ${side === 'source' ? 'available' : 'selected'} items`,
    list: (side) => `${side === 'source' ? 'Available' : 'Selected'} items`, moveToTarget: 'Move right', moveToSource: 'Move left',
  },
  pagination: {
    itemLabel: 'items', total: (total, itemLabel) => `${total} ${itemLabel}`, page: (current, total) => `Page ${current} of ${total}`,
    pageSize: (size) => `${size} / page`, previous: 'Previous page', next: 'Next page',
  },
  pullToRefresh: { pulling: 'Pull to refresh', release: 'Release to refresh', refreshing: 'Refreshing' },
  fileUpload: {
    inputLabel: 'Upload files', unsupportedType: 'Unsupported file type', maxSize: (size) => `File size must not exceed ${size}`, maxFiles: (count) => `Select up to ${count} files`,
    uploading: 'Uploading files', dropToUpload: 'Drop files to upload', dragOrClick: 'Drag files here or click to upload', dragOrChoose: 'Drag files here or click to choose files',
    progress: 'Upload progress', removeFile: (name) => `Remove ${name}`,
  },
  dataTable: { emptyText: 'No data', selectAll: 'Select all rows on this page', selectRow: (index) => `Select row ${index}` },
  timeline: { emptyText: 'No records', details: 'Details', before: 'Before', after: 'After', remaining: (count) => `${count} more records` },
  toast: { success: 'Success', info: 'Notice', warning: 'Warning', error: 'Error', close: 'Close notification' },
  accessibility: {
    alertClose: 'Close alert', chipRemove: 'Remove tag', empty: 'No data', fab: 'Floating action', loading: 'Loading',
    passwordShow: 'Show password', passwordHide: 'Hide password', rating: 'Rating', increment: 'Increase', decrement: 'Decrease',
    scrollToTop: 'Scroll to top', scrollToBottom: 'Scroll to bottom',
  },
  confirmDialog: { confirm: 'Confirm', cancel: 'Cancel' },
};

export const LumenLocaleContext = createContext<LumenLocale>(zhCN);

export const useLumenLocale = () => useContext(LumenLocaleContext);
