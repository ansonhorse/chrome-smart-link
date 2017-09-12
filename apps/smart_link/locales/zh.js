
let messages = {
  modes: {
    1: '页面默认规则',
    2: '当前标签页',
    3: '新标签',
    4: '后台新标签',
    5: '新窗口',
    6: '新匿名窗口',
    7: '无反应',
  },
  detections: {
    1: '包含',
    2: '开头匹配',
    3: '结尾匹配',
    4: '完全匹配',
    5: '正则表达式',
  },
  app: {
    add: '添加',
    edit: '编辑',
    remove: '删除',
    delete: '删除',
    confirm_delete: '确定删除该项？',
    update: '更新',
    enabled: '开启',
    disabled: '禁用',
    save: '保存',
    ok: '确定',
    cancel: '取消',
    close: '关闭',
    copy: '复制',
    duplicate: '复制',
    create_rule: '创建规则',
    create_rule_for_elements: '为当前元素创建规则',

    settings: '设置',

    global_setting: '全局规则设置',
    current_tab_setting: '当前标签规则设置',
    glboal_enabled: '全局规则已开启',
    global_disabled: '全局规则已禁用',
    current_tab_enabled: '当前标签规则已开启',
    current_tab_disabled: '当前标签规则已禁用',

    is_required: '是必须的',
    rules_list: '规则列表',
    
    rule: '规则',
    memo: '备注',
    detection: 'URL匹配方式',
    pattern: 'URL特征',
    selectors: '选择器',
    selectors_label: '选择器 (jQuery)，支持多个',
    selectors_placeholder: '敲击回车添加一个',
    mode: '打开方式',
    status: '状态',
    operations: '操作',

    set_locale: '设置显示语言',
    create_rule_for_current_tab: '为当前标签创建新的规则',
    no_active_tab: '没有处于激活状态的标签',
    no_tab_provided: '没有传递tab或者tab为空！',

    bulk_remove: '删除已选规则',
    confirm_bulk_remove: '确定删除已选的规则？',
    confirm_bulk_remove_alert: '删除后将不能恢复',

    tips: '提示',
    inspector_selection_tips: '单击所选元素将会打开规则创建页面；按下Ecs键退出当前选择。',
  },
};

export default messages;