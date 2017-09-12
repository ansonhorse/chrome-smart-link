let messages = {
  modes: {
    1: 'default(none)',
    2: 'current tab',
    3: 'new tab',
    4: 'background tab',
    5: 'new window',
    6: 'incognito window',
    7: 'no reaction',
  },
  detections: {
    1: 'contains',
    2: 'starts with',
    3: 'ends with',
    4: 'exact the same',
    5: 'regular expression',
  },
  app: {
    add: 'Add',
    edit: 'Edit',
    remove: 'Remove',
    delete: 'Delete',
    confirm_delete: 'Confirm to delete this item?',
    update: 'Update',
    enabled: 'Enabled',
    disabled: 'Disabled',
    save: 'Save',
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    copy: 'Copy',
    duplicate: 'Duplicate',
    create_rule: 'Create Rule',
    create_rule_for_elements: 'Create Rule for This Element',

    settings: 'Settings',

    global_setting: 'Global Rule Setting',
    current_tab_setting: 'Current Tab Rule Setting',
    glboal_enabled: 'Global Rule Enabled',
    global_disabled: 'Global Rule Disabled',
    current_tab_enabled: 'Current Tab Rule Enabled',
    current_tab_disabled: 'Current Tab Rule Disabled',
    
    is_required: 'is required',
    rules_list: 'Rule list',

    rule: 'Rule',
    memo: 'Memo',
    detection: 'URL Pattern Detection',
    pattern: 'URL Pattern',
    selectors: 'Selectors',
    selectors_label: 'Selectors (jQuery), could have multiple',
    selectors_placeholder: 'Press enter to add one',
    mode: 'Open Mode',
    status: 'Status',
    operations: 'Operations',

    set_locale: 'Set Language',
    create_rule_for_current_tab: 'Create new rule for current tab',
    no_active_tab: 'No active tab!',
    no_tab_provided: 'No tab info passed!',

    bulk_remove: 'Delete selected rules',
    confirm_bulk_remove: 'Confirm to delete these selected rules?',
    confirm_bulk_remove_alert: 'These selected rules will be deleted permanently.',

    tips: 'Tips',
    inspector_selection_tips: 'Click the selected element to initialize an new rule creation; Press `Escape` to exit selection.',
  },
};

export default messages;