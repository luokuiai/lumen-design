import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  LogOut,
  MoreHorizontal,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  DatePicker,
  DateTimePicker,
  Drawer,
  DropdownMenu,
  FileUpload,
  FormField,
  Input,
  Modal,
  Pagination,
  Radio,
  RadioGroup,
  SegmentedControl,
  Select,
  SideNav,
  Skeleton,
  Switch,
  Tabs,
  Textarea,
  TimePicker,
  Timeline,
  Toast,
  Tooltip,
  TreeSelect,
} from '@luokuiai/lumen-ui';
import '@luokuiai/lumen-theme-clarity';

type Section = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

const sections: Section[] = [
  { id: 'buttons', title: 'Buttons', description: '按钮、徽标、头像和提示。', icon: Plus },
  { id: 'forms', title: 'Forms', description: '输入、校验、开关、单选和多行文本。', icon: Check },
  { id: 'pickers', title: 'Pickers', description: '选择器、树选择、日期和时间选择。', icon: CalendarDays },
  { id: 'navigation', title: 'Navigation', description: 'Tabs、分页、菜单和时间线。', icon: MoreHorizontal },
  { id: 'overlays', title: 'Overlays', description: 'Modal、Drawer、Confirm 和 Toast。', icon: Bell },
  { id: 'feedback', title: 'Feedback', description: '上传、骨架屏和状态反馈。', icon: Settings },
];

const sideNavSections = [
  {
    items: sections.map((section) => ({
      value: section.id,
      label: section.title,
      icon: section.icon,
      href: `#${section.id}`,
    })),
  },
];

const selectOptions = [
  { label: '设计评审', value: 'review', group: '会议', description: 'UI 组件走查' },
  { label: '需求同步', value: 'sync', group: '会议', description: '业务与研发对齐' },
  { label: '线上发布', value: 'release', group: '变更', description: '生产环境发布窗口' },
  { label: '回归测试', value: 'qa', group: '变更', disabled: true },
];

const treeNodes: TreeNode[] = [
  {
    id: 'product',
    label: '产品中心',
    children: [
      { id: 'product-design', label: '体验设计' },
      { id: 'product-growth', label: '增长策略' },
    ],
  },
  {
    id: 'engineering',
    label: '研发中心',
    children: [
      { id: 'frontend', label: '前端平台' },
      { id: 'qa', label: '质量保障' },
    ],
  },
];

const timelineItems = [
  {
    id: '1',
    date: '2026-08-21 09:30',
    title: '已创建',
    description: '组件画廊初始化，覆盖主组件入口。',
    type: 'success' as const,
    meta: [{ label: '操作者', value: 'Design Ops' }],
  },
  {
    id: '2',
    date: '2026-08-21 11:00',
    title: '待评审',
    description: '补充交互态和响应式截图。',
    type: 'warning' as const,
    meta: [{ label: '范围', value: 'Gallery' }],
    beforeValue: '静态预览',
    afterValue: '可交互预览',
  },
];

function GallerySection({ section, children }: { section: Section; children: React.ReactNode }) {
  return (
    <section id={section.id} className="gallery-section">
      <header className="section-header">
        <div>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
      </header>
      <div className="section-grid">{children}</div>
    </section>
  );
}

function DemoCard({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Card className={wide ? 'demo-card demo-card-wide' : 'demo-card'}>
      <CardHeader>
        <CardTitle className="demo-card-title">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function GalleryBrand({ className = '' }: { className?: string }) {
  return (
    <div className={`brand ${className}`.trim()}>
      <div className="brand-mark">L</div>
      <div>
        <strong>Lumen UI</strong>
        <span>Component Gallery</span>
      </div>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('buttons');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('项目周会');
  const [textareaText, setTextareaText] = useState('记录评审结论和后续动作。');
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [radioValue, setRadioValue] = useState('pad');
  const [segment, setSegment] = useState<'all' | 'active' | 'archived'>('all');
  const [tab, setTab] = useState<'overview' | 'usage' | 'tokens'>('overview');
  const [selectValue, setSelectValue] = useState<string | null>('review');
  const [multiSelectValue, setMultiSelectValue] = useState<Array<string | number>>(['review', 'release']);
  const [treeValue, setTreeValue] = useState<string | null>('frontend');
  const [treeValues, setTreeValues] = useState(['product-design', 'frontend']);
  const [dateValue, setDateValue] = useState('2026-08-21');
  const [monthValue, setMonthValue] = useState('2026-08');
  const [timeValue, setTimeValue] = useState('09:30');
  const [dateTimeValue, setDateTimeValue] = useState('2026-08-21 09:30:00');
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(20);
  const [files, setFiles] = useState<File[]>([]);
  const [compactFiles, setCompactFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filteredSections = useMemo(
    () =>
      sections.filter((section) =>
        `${section.title} ${section.description}`.toLowerCase().includes(searchText.trim().toLowerCase()) || searchText.trim() === '项目周会',
      ),
    [searchText],
  );

  return (
    <div
      data-lumen-theme="clarity"
      data-density="default"
      className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
    >
      <aside className="sidebar">
        <GalleryBrand />
        <SideNav
          ariaLabel="组件分类"
          activeValue={activeSection}
          collapsed={sidebarCollapsed}
          className="gallery-side-nav"
          sections={sideNavSections}
          onSelect={setActiveSection}
        />
      </aside>

      <Drawer
        open={mobileNavOpen}
        placement="left"
        drawerId="mobile-navigation"
        panelClassName="mobile-nav-panel"
        onRequestClose={() => setMobileNavOpen(false)}
      >
        <div className="mobile-nav-header">
          <GalleryBrand className="mobile-nav-brand" />
          <Button
            iconOnly
            variant="ghost"
            aria-label="关闭导航"
            icon={<X size={18} />}
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
        <SideNav
          ariaLabel="移动端组件分类"
          activeValue={activeSection}
          className="mobile-side-nav"
          sections={sideNavSections}
          onSelect={(value) => {
            setActiveSection(value);
            setMobileNavOpen(false);
          }}
        />
      </Drawer>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <Button
              iconOnly
              variant="secondary"
              className="mobile-menu-button"
              aria-label="打开导航"
              icon={<Menu size={18} />}
              onClick={() => setMobileNavOpen(true)}
            />
            <Tooltip content={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'} placement="bottom">
              <Button
                iconOnly
                variant="ghost"
                className="sidebar-toggle-button"
                aria-label={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'}
                aria-expanded={!sidebarCollapsed}
                icon={sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              />
            </Tooltip>
            <div>
              <h1>Lumen UI Gallery</h1>
              <p>组件库全量预览和交互检查入口。</p>
            </div>
          </div>
          <div className="topbar-actions">
            <Input
              className="topbar-search"
              size="md"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              prefix={<Search size={15} />}
              placeholder="搜索组件"
            />
            <DropdownMenu
              className="topbar-notification"
              menuClassName="w-[min(320px,calc(100vw-16px))] overflow-hidden py-0"
              trigger={({ open, toggle }) => (
                <Tooltip content="通知" placement="bottom">
                  <Button
                    iconOnly
                    size="sm"
                    variant="ghost"
                    className="topbar-notification-button"
                    aria-label="通知"
                    aria-expanded={open}
                    icon={(
                      <span className="relative inline-flex">
                        <Bell size={18} />
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-[var(--lumen-color-surface)] bg-[var(--lumen-color-danger)]" />
                      </span>
                    )}
                    onClick={toggle}
                  />
                </Tooltip>
              )}
            >
              {({ close }) => (
                <div className="-my-1" data-testid="playground-notifications">
                  <div className="flex items-center justify-between border-b border-[var(--lumen-color-surface-muted)] px-4 py-3">
                    <span className="text-[14px] font-semibold text-[var(--lumen-color-text-strong)]">通知</span>
                    <Badge size="sm" variant="danger">2</Badge>
                  </div>
                  <div className="py-1">
                    {[
                      ['组件检查已完成', '刚刚'],
                      ['Dropdown 定位已更新', '5 分钟前'],
                    ].map(([title, time]) => (
                      <button
                        key={title}
                        type="button"
                        className="flex w-full items-start gap-3 border-b border-[var(--lumen-color-surface-muted)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--lumen-color-surface-muted)] focus:outline-none focus-visible:bg-[var(--lumen-color-surface-muted)]"
                        onClick={close}
                      >
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--lumen-color-primary)]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-[var(--lumen-color-text)]">{title}</span>
                          <span className="mt-1 block text-[11px] text-[var(--lumen-color-text-placeholder)]">{time}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[var(--lumen-color-surface-muted)] p-2">
                    <button
                      type="button"
                      className="w-full rounded-[6px] px-3 py-2 text-center text-[12px] font-medium text-[var(--lumen-color-primary)] hover:bg-[var(--lumen-color-surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20"
                      onClick={close}
                    >
                      全部标记为已读
                    </button>
                  </div>
                </div>
              )}
            </DropdownMenu>
            <DropdownMenu
              menuMode
              align="right"
              className="topbar-avatar"
              menuClassName="account-menu"
              trigger={({ open, menuId, toggle }) => (
                <Tooltip content="账户" placement="bottom">
                  <button
                    type="button"
                    className="topbar-avatar-trigger"
                    aria-label="打开账户菜单"
                    aria-controls={menuId}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    onClick={toggle}
                  >
                    <Avatar
                      size="sm"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80"
                      alt="Gallery user"
                      name="Gallery User"
                      imageProps={{
                        loading: 'lazy',
                        referrerPolicy: 'no-referrer',
                      }}
                    />
                  </button>
                </Tooltip>
              )}
            >
              {({ close }) => (
                <div>
                  <div className="account-menu-profile">
                    <Avatar
                      size="md"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80"
                      alt="Gallery user"
                      name="Gallery User"
                      imageProps={{
                        loading: 'lazy',
                        referrerPolicy: 'no-referrer',
                      }}
                    />
                    <span>
                      <strong>Gallery User</strong>
                      <small>gallery@lumen.dev</small>
                    </span>
                  </div>
                  <div className="account-menu-actions">
                    <button type="button" role="menuitem" onClick={close}>
                      <UserRound size={16} />
                      个人信息
                    </button>
                    <button type="button" role="menuitem" onClick={close}>
                      <Settings size={16} />
                      账户设置
                    </button>
                  </div>
                  <div className="account-menu-actions account-menu-footer">
                    <button type="button" role="menuitem" className="account-menu-logout" onClick={close}>
                      <LogOut size={16} />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </DropdownMenu>
          </div>
        </header>

        {filteredSections.map((section) => {
          if (section.id === 'buttons') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="Button">
                  <div className="button-row">
                    <Button icon={<Plus size={15} />}>新建</Button>
                    <Button variant="secondary" icon={<Filter size={15} />}>筛选</Button>
                    <Button variant="outline">描边</Button>
                    <Button variant="ghost">文字</Button>
                    <Button variant="destructive">删除</Button>
                    <Tooltip content="仅图标按钮">
                      <Button iconOnly aria-label="设置" icon={<Settings size={15} />} />
                    </Tooltip>
                  </div>
                </DemoCard>
                <DemoCard title="Badge + Avatar">
                  <div className="stack">
                    <div className="button-row">
                      <Badge variant="info">Info</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="danger">Danger</Badge>
                      <Badge variant="neutral">Neutral</Badge>
                      <Badge variant="outline" shape="square">Outline</Badge>
                    </div>
                    <div className="avatar-row">
                      <Avatar name="Lumen Design" />
                      <Avatar name="Qiao Ming" shape="rounded" />
                      <Avatar
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80"
                        alt="Unsplash portrait"
                        name="Portrait User"
                        imageProps={{
                          loading: 'lazy',
                          referrerPolicy: 'no-referrer',
                        }}
                      />
                      <Avatar
                        name="Color Avatar"
                        style={{
                          backgroundColor: 'var(--lumen-color-primary)',
                          borderColor: 'transparent',
                          color: 'var(--lumen-color-on-primary)',
                        }}
                      />
                      <Avatar
                        name="Success User"
                        style={{
                          backgroundColor: 'var(--lumen-color-success-soft)',
                          borderColor: 'var(--lumen-color-success-border)',
                          color: 'var(--lumen-color-success-text)',
                        }}
                      />
                      <Avatar
                        name="Warning User"
                        shape="rounded"
                        style={{
                          backgroundColor: 'var(--lumen-color-warning-soft)',
                          borderColor: 'var(--lumen-color-warning-border)',
                          color: 'var(--lumen-color-warning-text)',
                        }}
                      />
                      <Avatar
                        name="Danger User"
                        style={{
                          backgroundColor: 'var(--lumen-color-danger-soft)',
                          borderColor: 'var(--lumen-color-danger-border)',
                          color: 'var(--lumen-color-danger-text)',
                        }}
                      />
                      <Avatar fallback={<UserRound size={18} />} />
                    </div>
                  </div>
                </DemoCard>
              </GallerySection>
            );
          }

          if (section.id === 'forms') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="Input + FormField" wide>
                  <div className="form-grid">
                    <FormField label="会议名称" required inputId="meeting-title">
                      {(props) => (
                        <Input
                          {...props}
                          id="meeting-title"
                          value={searchText}
                          onChange={(event) => setSearchText(event.target.value)}
                          prefix={<CalendarDays size={15} />}
                        />
                      )}
                    </FormField>
                    <FormField label="负责人" error="请选择负责人">
                      <Input invalid placeholder="负责人姓名" suffix={<UserRound size={15} />} />
                    </FormField>
                    <FormField label="备注" className="form-span">
                      <Textarea
                        value={textareaText}
                        onChange={(event) => setTextareaText(event.target.value)}
                        rows={4}
                      />
                    </FormField>
                  </div>
                </DemoCard>
                <DemoCard title="Checkbox + Radio + Switch">
                  <div className="stack">
                    <Checkbox checked={checked} onChange={setChecked} label="同步到日历" description="创建后自动邀请成员。" />
                    <Switch checked={enabled} onChange={setEnabled} label="开启提醒" description="会前 10 分钟推送。" />
                    <Radio checked label="单独 Radio" />
                    <RadioGroup
                      value={radioValue}
                      onChange={setRadioValue}
                      direction="horizontal"
                      options={[
                        { value: 'mobile', label: 'Mobile' },
                        { value: 'pad', label: 'Pad' },
                        { value: 'desktop', label: 'Desktop' },
                      ]}
                    />
                  </div>
                </DemoCard>
              </GallerySection>
            );
          }

          if (section.id === 'pickers') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="Select" wide>
                  <div className="form-grid">
                    <Select
                      options={selectOptions}
                      value={selectValue}
                      onChange={(value) => setSelectValue(value as string | null)}
                      searchable
                      placeholder="选择类型"
                    />
                    <Select
                      mode="multiple"
                      options={selectOptions}
                      value={multiSelectValue}
                      onChange={(value) => setMultiSelectValue(Array.isArray(value) ? value : [])}
                      searchable
                      placeholder="选择多个事项"
                    />
                    <TreeSelect
                      nodes={treeNodes}
                      value={treeValue}
                      onChange={(value) => setTreeValue(value)}
                      searchable
                      getValue={(node) => node.id}
                      getLabel={(node) => node.label}
                      placeholder="选择组织"
                    />
                    <TreeSelect
                      nodes={treeNodes}
                      value={null}
                      values={treeValues}
                      multiple
                      onChange={() => undefined}
                      onMultiChange={(values) => setTreeValues(values)}
                      searchable
                      getValue={(node) => node.id}
                      getLabel={(node) => node.label}
                      placeholder="选择多个组织"
                    />
                  </div>
                </DemoCard>
                <DemoCard title="Date + Time" wide>
                  <div className="form-grid">
                    <DatePicker value={dateValue} onChange={setDateValue} />
                    <DatePicker value={monthValue} onChange={setMonthValue} mode="year-month" />
                    <TimePicker value={timeValue} onChange={setTimeValue} minuteStep={5} />
                    <DateTimePicker label="开始时间" value={dateTimeValue} onChange={setDateTimeValue} minuteStep={5} />
                  </div>
                </DemoCard>
              </GallerySection>
            );
          }

          if (section.id === 'navigation') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="Tabs" wide>
                  <Tabs
                    value={tab}
                    onChange={setTab}
                    options={[
                      { value: 'overview', label: '总览', count: 12, icon: Bell },
                      { value: 'usage', label: '使用', count: 8, icon: Check },
                      { value: 'tokens', label: 'Tokens', count: 32, icon: Settings },
                    ]}
                    aside={<Button size="sm" variant="secondary">导出</Button>}
                  />
                </DemoCard>
                <DemoCard title="Pagination + Dropdown">
                  <div className="stack">
                    <Pagination
                      currentPage={page}
                      totalPages={9}
                      totalItems={180}
                      pageSize={pageSize}
                      pageSizeOptions={[10, 20, 50]}
                      onPageSizeChange={setPageSize}
                      onPageChange={setPage}
                    />
                    <DropdownMenu
                      menuMode
                      trigger={({ toggle, open }) => (
                        <Button type="button" variant="secondary" onClick={toggle} icon={<MoreHorizontal size={15} />}>
                          {open ? '收起菜单' : '打开菜单'}
                        </Button>
                      )}
                    >
                      {({ close }) => (
                        <div className="menu-list">
                          <button role="menuitem" onClick={close}>复制组件名称</button>
                          <button role="menuitem" onClick={close}>查看源码路径</button>
                          <button role="menuitem" onClick={close}>标记为常用</button>
                        </div>
                      )}
                    </DropdownMenu>
                  </div>
                </DemoCard>
                <DemoCard title="Timeline" wide>
                  <Timeline items={timelineItems} />
                </DemoCard>
              </GallerySection>
            );
          }

          if (section.id === 'overlays') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="Modal + Drawer + Confirm" wide>
                  <div className="button-row">
                    <Button onClick={() => setModalOpen(true)}>打开 Modal</Button>
                    <Button variant="secondary" onClick={() => setDrawerOpen(true)}>打开 Drawer</Button>
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>打开 Confirm</Button>
                    <Button variant="outline" icon={<Bell size={15} />} onClick={() => Toast.success('组件状态已保存')}>
                      Toast
                    </Button>
                  </div>
                </DemoCard>
              </GallerySection>
            );
          }

          return (
            <GallerySection key={section.id} section={section}>
              <DemoCard title="FileUpload">
                <FileUpload
                  value={files}
                  onChange={setFiles}
                  multiple
                  maxFiles={3}
                  accept=".png,.jpg,.pdf"
                  hint="支持 PNG、JPG、PDF，最多 3 个文件。"
                  onReject={(items) => Toast.warning(items[0]?.message ?? '文件不可用')}
                />
              </DemoCard>
              <DemoCard title="FileUpload Compact">
                <FileUpload
                  density="compact"
                  value={compactFiles}
                  onChange={setCompactFiles}
                  multiple
                  maxFiles={3}
                  accept=".png,.jpg,.pdf"
                  hint="支持 PNG、JPG、PDF"
                  onReject={(items) => Toast.warning(items[0]?.message ?? '文件不可用')}
                />
              </DemoCard>
              <DemoCard title="Skeleton + SegmentedControl">
                <div className="stack">
                  <SegmentedControl
                    value={segment}
                    onChange={setSegment}
                    fullWidth
                    options={[
                      { label: '全部', value: 'all' },
                      { label: '启用', value: 'active' },
                      { label: '归档', value: 'archived' },
                    ]}
                  />
                  <div className="skeleton-row">
                    <Skeleton variant="circular" />
                    <div className="skeleton-lines">
                      <Skeleton width="85%" />
                      <Skeleton width="62%" />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" height={96} />
                </div>
              </DemoCard>
            </GallerySection>
          );
        })}
      </main>

      <Modal
        open={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        panelClassName="modal-panel"
      >
        <h2>Modal 预览</h2>
        <p>用于确认、编辑和短流程任务。当前画廊直接使用组件库 Modal。</p>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setModalOpen(false)}>关闭</Button>
          <Button onClick={() => setModalOpen(false)}>保存</Button>
        </div>
      </Modal>

      <Drawer
        open={drawerOpen}
        onRequestClose={() => setDrawerOpen(false)}
        panelClassName="drawer-panel"
      >
        <div className="drawer-head">
          <h2>Drawer 预览</h2>
          <Button iconOnly variant="ghost" aria-label="关闭抽屉" icon={<ChevronDown size={16} />} onClick={() => setDrawerOpen(false)} />
        </div>
        <div className="stack">
          <FormField label="配置名称">
            <Input defaultValue="Gallery Preview" />
          </FormField>
          <FormField label="说明">
            <Textarea defaultValue="右侧抽屉适合承载较长配置表单。" rows={5} />
          </FormField>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        title="确认删除预览项"
        message="此操作仅用于查看 ConfirmDialog 的危险操作样式。"
        confirmText="删除"
        confirmVariant="destructive"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          Toast.info('已执行确认动作');
        }}
      />
    </div>
  );
}
