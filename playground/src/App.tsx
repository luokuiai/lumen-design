import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
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
};

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

const sections: Section[] = [
  { id: 'buttons', title: 'Buttons', description: '按钮、徽标、头像和提示。' },
  { id: 'forms', title: 'Forms', description: '输入、校验、开关、单选和多行文本。' },
  { id: 'pickers', title: 'Pickers', description: '选择器、树选择、日期和时间选择。' },
  { id: 'navigation', title: 'Navigation', description: 'Tabs、分页、菜单和时间线。' },
  { id: 'overlays', title: 'Overlays', description: 'Modal、Drawer、Confirm 和 Toast。' },
  { id: 'feedback', title: 'Feedback', description: '上传、骨架屏和状态反馈。' },
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
    <article className={wide ? 'demo-card demo-card-wide' : 'demo-card'}>
      <h3>{title}</h3>
      <div className="demo-content">{children}</div>
    </article>
  );
}

export default function App() {
  const [density, setDensity] = useState<'default' | 'compact'>('default');
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
    <div data-lumen-theme="clarity" data-density={density} className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div>
            <strong>Lumen UI</strong>
            <span>Component Gallery</span>
          </div>
        </div>
        <nav className="side-nav" aria-label="组件分类">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Lumen UI Gallery</h1>
            <p>组件库全量预览和交互检查入口。</p>
          </div>
          <div className="topbar-actions">
            <Input
              size="md"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              prefix={<Search size={15} />}
              placeholder="搜索组件"
            />
            <SegmentedControl
              value={density}
              onChange={setDensity}
              options={[
                { label: '默认', value: 'default' },
                { label: '紧凑', value: 'compact' },
              ]}
            />
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
                      <Badge>默认</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge size="lg" shape="square">Square</Badge>
                    </div>
                    <div className="avatar-row">
                      <Avatar name="Lumen Design" />
                      <Avatar name="Qiao Ming" size="lg" shape="rounded" />
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
              <DemoCard title="FileUpload" wide>
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
