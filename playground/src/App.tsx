import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  MapPin,
  LogOut,
  MoreHorizontal,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Plus,
  Search,
  SearchX,
  Settings,
  Moon,
  Sun,
  Table2,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Chip,
  Collapse,
  CollapseItem,
  ConfirmDialog,
  DatePicker,
  DateTimePicker,
  DataTable,
  Divider,
  Drawer,
  DropdownMenu,
  FileUpload,
  FileTypeIcon,
  FormField,
  Empty,
  Input,
  List,
  ListItem,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  Scrollbar,
  SegmentedControl,
  Select,
  SideNav,
  Slider,
  Skeleton,
  Spinner,
  Steps,
  Switch,
  Tabs,
  Textarea,
  TimePicker,
  Timeline,
  Toast,
  Tooltip,
  Transfer,
  TreeSelect,
} from '@luokuiai/lumen-ui';
import type { DataTableColumn, DataTableSort, StepsDirection } from '@luokuiai/lumen-ui';
import '@luokuiai/lumen-theme-clarity';
import '@luokuiai/lumen-theme-paper';
import '@luokuiai/lumen-theme-prism';

type Section = {
  id: string;
  title: string;
  description: string;
  keywords: string;
  icon: LucideIcon;
};

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

type ColorScheme = 'light' | 'dark';
type Accent = 'blue' | 'purple';
type Theme = 'clarity' | 'paper' | 'prism';

const themeStorageKey = 'lumen-playground-theme';
const colorSchemeStorageKey = 'lumen-playground-color-scheme';
const accentStorageKey = 'lumen-playground-accent';

const initialTheme: Theme = (() => {
  if (typeof window === 'undefined') return 'clarity';
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    return storedTheme === 'paper' || storedTheme === 'prism' ? storedTheme : 'clarity';
  } catch {
    return 'clarity';
  }
})();

const getInitialColorScheme = (): ColorScheme => {
  if (typeof window === 'undefined') return 'light';

  try {
    const storedScheme = window.localStorage.getItem(colorSchemeStorageKey);
    if (storedScheme === 'light' || storedScheme === 'dark') return storedScheme;
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialColorScheme = getInitialColorScheme();
const initialAccent: Accent = (() => {
  if (typeof window === 'undefined') return 'blue';
  try {
    return window.localStorage.getItem(accentStorageKey) === 'purple' ? 'purple' : 'blue';
  } catch {
    return 'blue';
  }
})();

if (typeof document !== 'undefined') {
  document.documentElement.dataset.lumenTheme = initialTheme;
  document.documentElement.dataset.colorScheme = initialColorScheme;
  if (initialTheme === 'clarity') {
    document.documentElement.dataset.accent = initialAccent;
  } else {
    delete document.documentElement.dataset.accent;
  }
}

type SafetyEvent = {
  id: string;
  section: string;
  category: string;
  level: '高' | '中' | '低';
  status: '待处置' | '处置中' | '已关闭';
  updatedAt: string;
};

const sections: Section[] = [
  { id: 'buttons', title: 'Buttons', description: '按钮、徽标、Chip、头像和 Tooltip。', keywords: 'Button Badge Chip Avatar Tooltip', icon: Plus },
  { id: 'forms', title: 'Forms', description: '输入、校验、开关、单选和多行文本。', keywords: 'Input FormField Textarea Checkbox Radio RadioGroup Switch Slider', icon: Check },
  { id: 'pickers', title: 'Pickers', description: '选择器、树选择、穿梭框、日期和时间选择。', keywords: 'Select TreeSelect Transfer DatePicker TimePicker DateTimePicker', icon: CalendarDays },
  { id: 'data', title: 'Data Display', description: '文件类型、数据表格、列表、滚动区域、分隔和折叠内容。', keywords: 'FileTypeIcon DataTable List ListItem Pagination Scrollbar Divider Collapse Accordion', icon: Table2 },
  { id: 'navigation', title: 'Navigation', description: '标签页、步骤、菜单和时间线。', keywords: 'Tabs Steps DropdownMenu Timeline SideNav', icon: MoreHorizontal },
  { id: 'overlays', title: 'Overlays', description: '模态框、抽屉、确认和消息提示。', keywords: 'Modal Drawer ConfirmDialog Toast', icon: Bell },
  { id: 'feedback', title: 'Feedback', description: '页面提示、加载、进度、空状态、上传和骨架屏。', keywords: 'Alert Spinner Progress Empty FileUpload Skeleton SegmentedControl', icon: Settings },
];

const getSectionFromHash = () => {
  if (typeof window === 'undefined') return sections[0]!.id;
  const sectionId = window.location.hash.slice(1);
  return sections.some((section) => section.id === sectionId)
    ? sectionId
    : sections[0]!.id;
};

const basicSelectOptions = [
  { label: '设计评审', value: 'review' },
  { label: '需求同步', value: 'sync' },
  { label: '线上发布', value: 'release' },
  { label: '回归测试', value: 'qa' },
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

const transferItems = [
  { key: 'camera-north', label: '北向摄像机', description: 'K18+900' },
  { key: 'camera-south', label: '南向摄像机', description: 'K18+900' },
  { key: 'radar', label: '毫米波雷达', description: 'K24+300' },
  { key: 'weather', label: '气象监测站', description: 'K28+100' },
  { key: 'slope', label: '边坡传感器', description: 'K31+600' },
  { key: 'offline', label: '离线设备', description: '暂不可分配', disabled: true },
];

const fileTypeIconExamples = [
  {
    title: '文档与文本',
    files: [
      'report.pdf', 'proposal.doc', 'brief.docx', 'budget.xls', 'budget.xlsx',
      'table.csv', 'slides.ppt', 'slides.pptx', 'notes.txt', 'notes.md',
      'config.json', 'source.ts', 'query.sql',
    ],
  },
  {
    title: '图片与媒体',
    files: [
      'photo.jpg', 'graphic.svg', 'camera.heic', 'clip.mp4', 'movie.mkv',
      'camera.mts', 'recording.mp3', 'lossless.flac', 'voice.m4a',
    ],
  },
  {
    title: '压缩与应用包',
    files: [
      'bundle.zip', 'backup.7z', 'source.tar.gz', 'client.apk', 'client.aab',
      'client.ipa', 'client.hap',
    ],
  },
  {
    title: 'BIN 回退',
    files: ['setup.exe', 'library.dll', 'disk.iso', 'unknown.xyz', 'README'],
  },
] as const;

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

const safetyEvents: SafetyEvent[] = Array.from({ length: 23 }, (_, index) => {
  const levels: SafetyEvent['level'][] = ['高', '中', '低'];
  const statuses: SafetyEvent['status'][] = ['待处置', '处置中', '已关闭'];
  const categories = ['异常停车', '行人闯入', '边坡告警', '拥堵缓行'];
  const minute = String((index * 7) % 60).padStart(2, '0');
  return {
    id: `SJ-${String(index + 1).padStart(4, '0')}`,
    section: `G65 K${12 + index}+${String((index * 137) % 1000).padStart(3, '0')}`,
    category: categories[index % categories.length]!,
    level: levels[index % levels.length]!,
    status: statuses[index % statuses.length]!,
    updatedAt: `2026-08-${String(22 - Math.floor(index / 8)).padStart(2, '0')} ${String(9 + (index % 8)).padStart(2, '0')}:${minute}`,
  };
});

const safetyEventColumns: DataTableColumn<SafetyEvent>[] = [
  {
    key: 'id',
    header: '事件编号',
    sortable: true,
    minWidth: 112,
    render: (event) => <span className="font-medium text-[var(--lumen-color-text)]">{event.id}</span>,
  },
  {
    key: 'section',
    header: '路段位置',
    sortable: true,
    minWidth: 150,
    className: 'mobile:hidden',
    headerClassName: 'mobile:hidden',
    render: (event) => event.section,
  },
  {
    key: 'category',
    header: '事件类型',
    minWidth: 112,
    className: 'mobile:hidden',
    headerClassName: 'mobile:hidden',
    render: (event) => event.category,
  },
  {
    key: 'level',
    header: '等级',
    sortable: true,
    minWidth: 84,
    className: 'mobile:hidden',
    headerClassName: 'mobile:hidden',
    render: (event) => (
      <Badge
        variant={event.level === '高' ? 'danger' : event.level === '中' ? 'warning' : 'info'}
      >
        {event.level}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: '状态',
    minWidth: 96,
    render: (event) => (
      <Badge
        variant={event.status === '已关闭' ? 'neutral' : event.status === '处置中' ? 'info' : 'warning'}
      >
        {event.status}
      </Badge>
    ),
  },
  {
    key: 'updatedAt',
    header: '更新时间',
    sortable: true,
    minWidth: 152,
    className: 'mobile:hidden',
    headerClassName: 'mobile:hidden',
    render: (event) => event.updatedAt,
  },
  {
    key: 'actions',
    header: '操作',
    align: 'left',
    width: 96,
    minWidth: 96,
    className: 'whitespace-nowrap mobile:hidden',
    headerClassName: 'mobile:hidden',
    render: (event) => (
      <Button size="sm" variant="ghost" onClick={() => Toast.info(`查看 ${event.id}`)}>
        查看
      </Button>
    ),
  },
];

const getSafetyEventSortValue = (event: SafetyEvent, key: string) => {
  if (key === 'level') return { 高: 3, 中: 2, 低: 1 }[event.level];
  return event[key as keyof SafetyEvent];
};

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
      <img className="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
      <div>
        <strong>Lumen Design</strong>
        <span>Component Gallery</span>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initialColorScheme);
  const [accent, setAccent] = useState<Accent>(initialAccent);
  const [activeSection, setActiveSection] = useState(getSectionFromHash);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [meetingName, setMeetingName] = useState('项目周会');
  const [textareaText, setTextareaText] = useState('记录评审结论和后续动作。');
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [priorityChipSelected, setPriorityChipSelected] = useState(false);
  const [temporaryChipVisible, setTemporaryChipVisible] = useState(true);
  const [sliderValue, setSliderValue] = useState(62);
  const [radioValue, setRadioValue] = useState('pad');
  const [segment, setSegment] = useState<'all' | 'active' | 'archived'>('all');
  const [tab, setTab] = useState<'overview' | 'usage' | 'tokens'>('overview');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepsDirection, setStepsDirection] = useState<StepsDirection>('horizontal');
  const [basicSelectValue, setBasicSelectValue] = useState<string | null>(null);
  const [selectValue, setSelectValue] = useState<string | null>('review');
  const [multiSelectValue, setMultiSelectValue] = useState<Array<string | number>>(['review', 'release']);
  const [treeValue, setTreeValue] = useState<string | null>('frontend');
  const [treeValues, setTreeValues] = useState(['product-design', 'frontend']);
  const [transferTargetKeys, setTransferTargetKeys] = useState<React.Key[]>(['camera-north', 'radar']);
  const [dateValue, setDateValue] = useState('2026-08-21');
  const [monthValue, setMonthValue] = useState('2026-08');
  const [timeValue, setTimeValue] = useState('09:30');
  const [dateTimeValue, setDateTimeValue] = useState('2026-08-21 09:30:00');
  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(10);
  const [eventSort, setEventSort] = useState<DataTableSort>();
  const [selectedEventKeys, setSelectedEventKeys] = useState<React.Key[]>([]);
  const [warningAlertVisible, setWarningAlertVisible] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [compactFiles, setCompactFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filteredNavigationSections = useMemo(
    () => sections.filter((section) =>
      `${section.title} ${section.description} ${section.keywords}`
        .toLowerCase()
        .includes(gallerySearch.trim().toLowerCase()),
    ),
    [gallerySearch],
  );
  const sideNavSections = useMemo(
    () => [{
      items: filteredNavigationSections.map((section) => ({
        value: section.id,
        label: section.title,
        icon: section.icon,
        href: `#${section.id}`,
      })),
    }],
    [filteredNavigationSections],
  );
  const activeSections = useMemo(
    () => sections.filter((section) => section.id === activeSection),
    [activeSection],
  );

  useEffect(() => {
    const syncSectionFromHash = () => setActiveSection(getSectionFromHash());
    window.addEventListener('hashchange', syncSectionFromHash);
    return () => window.removeEventListener('hashchange', syncSectionFromHash);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.lumenTheme = theme;
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // The active theme still applies when persistence is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.colorScheme = colorScheme;
    try {
      window.localStorage.setItem(colorSchemeStorageKey, colorScheme);
    } catch {
      // The active theme still applies when persistence is unavailable.
    }
  }, [colorScheme]);

  useEffect(() => {
    if (theme === 'clarity') {
      document.documentElement.dataset.accent = accent;
    } else {
      delete document.documentElement.dataset.accent;
    }
    try {
      window.localStorage.setItem(accentStorageKey, accent);
    } catch {
      // The active accent still applies when persistence is unavailable.
    }
  }, [accent, theme]);

  const sortedSafetyEvents = useMemo(() => {
    if (!eventSort) return safetyEvents;
    const direction = eventSort.direction === 'asc' ? 1 : -1;
    return [...safetyEvents].sort((left, right) => {
      const leftValue = getSafetyEventSortValue(left, eventSort.key);
      const rightValue = getSafetyEventSortValue(right, eventSort.key);
      return String(leftValue).localeCompare(String(rightValue), 'zh-CN', { numeric: true }) * direction;
    });
  }, [eventSort]);
  const eventTotalPages = Math.ceil(sortedSafetyEvents.length / eventPageSize);
  const visibleSafetyEvents = useMemo(
    () => sortedSafetyEvents.slice((eventPage - 1) * eventPageSize, eventPage * eventPageSize),
    [eventPage, eventPageSize, sortedSafetyEvents],
  );

  return (
    <div
      data-lumen-theme={theme}
      data-color-scheme={colorScheme}
      data-accent={theme === 'clarity' ? accent : undefined}
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
              value={gallerySearch}
              onChange={(event) => setGallerySearch(event.target.value)}
              prefix={<Search size={15} />}
              placeholder="搜索分类或组件"
            />
            <DropdownMenu
              menuMode
              align="right"
              className="topbar-accent"
              menuClassName="accent-menu"
              trigger={({ open, menuId, toggle }) => (
                <Tooltip content="主题" placement="bottom">
                  <Button
                    iconOnly
                    size="sm"
                    variant="ghost"
                    className="topbar-accent-button"
                    aria-label={theme === 'paper'
                      ? 'Paper 主题'
                      : theme === 'prism'
                        ? 'Prism 多彩主题'
                        : `Clarity ${accent === 'purple' ? '紫色' : '蓝色'}主题`}
                    aria-controls={menuId}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    icon={<Palette size={18} />}
                    onClick={toggle}
                  />
                </Tooltip>
              )}
            >
              {({ close }) => (
                <div className="accent-options">
                  {([
                    ['clarity', 'blue', 'Clarity 蓝色'],
                    ['clarity', 'purple', 'Clarity 紫色'],
                    ['paper', null, 'Paper 黑白'],
                    ['prism', null, 'Prism 多彩'],
                  ] as const).map(([themeValue, accentValue, label]) => {
                    const selected = theme === themeValue
                      && (themeValue !== 'clarity' || accent === accentValue);
                    return (
                    <button
                      key={`${themeValue}-${accentValue ?? 'default'}`}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      className="accent-option"
                      onClick={() => {
                        setTheme(themeValue);
                        if (accentValue) setAccent(accentValue);
                        close();
                      }}
                    >
                      <span className={`accent-swatch accent-swatch-${accentValue ?? themeValue}`} />
                      <span>{label}</span>
                      {selected ? <Check aria-hidden="true" size={15} /> : null}
                    </button>
                    );
                  })}
                </div>
              )}
            </DropdownMenu>
            <Tooltip
              content={colorScheme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
              placement="bottom"
            >
              <Button
                iconOnly
                size="sm"
                variant="ghost"
                className="topbar-theme-button"
                aria-label={colorScheme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
                icon={colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                onClick={() => setColorScheme((scheme) => scheme === 'dark' ? 'light' : 'dark')}
              />
            </Tooltip>
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

        {activeSections.map((section) => {
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
                <DemoCard title="Chip" wide>
                  <div className="button-row">
                    <Chip
                      tone="danger"
                      shape="pill"
                      selected={priorityChipSelected}
                      onSelect={setPriorityChipSelected}
                    >
                      高风险
                    </Chip>
                    {temporaryChipVisible ? (
                      <Chip tone="neutral" onClose={() => setTemporaryChipVisible(false)}>
                        临时标签
                      </Chip>
                    ) : null}
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
                          value={meetingName}
                          onChange={(event) => setMeetingName(event.target.value)}
                          prefix={<CalendarDays size={15} />}
                        />
                      )}
                    </FormField>
              <FormField label="负责人">
                <Input placeholder="负责人姓名" suffix={<UserRound size={15} />} />
              </FormField>
                    <FormField label="备注" className="form-span">
                      <Textarea
                      value={textareaText}
                      onChange={(event) => setTextareaText(event.target.value)}
                      maxLength={200}
                      rows={4}
                      showCount
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
                <DemoCard title="Slider" wide>
                  <div className="form-grid">
                    <Slider
                      aria-label="告警阈值"
                      label="告警阈值"
                      value={sliderValue}
                      onChange={setSliderValue}
                      showValue
                      formatValue={(value) => `${value}%`}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' },
                      ]}
                    />
                    <Slider
                      aria-label="风险等级"
                      label="风险等级"
                      defaultValue={40}
                      min={0}
                      max={80}
                      step={10}
                      status="warning"
                      showValue
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
                      options={basicSelectOptions}
                      value={basicSelectValue}
                      onChange={(value) => setBasicSelectValue(value as string | null)}
                      placeholder="请选择"
                    />
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
                <DemoCard title="Transfer" wide>
                  <Transfer
                    items={transferItems}
                    targetKeys={transferTargetKeys}
                    onChange={setTransferTargetKeys}
                    sourceTitle="可分配设备"
                    targetTitle="已分配设备"
                  />
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
                <DemoCard title="Dropdown">
                  <div className="stack">
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
                <DemoCard title="Steps" wide>
                  <div className="stack">
                    <div className="flex">
                      <SegmentedControl
                        aria-label="步骤排列方向"
                        value={stepsDirection}
                        onChange={setStepsDirection}
                        options={[
                          { value: 'horizontal', label: '横向' },
                          { value: 'vertical', label: '纵向' },
                        ]}
                      />
                    </div>
                    <Steps
                      current={currentStep}
                      direction={stepsDirection}
                      onChange={setCurrentStep}
                      items={[
                        { title: '事件上报', description: '已采集现场信息' },
                        { title: '研判确认', description: '核实风险等级' },
                        { title: '现场处置', description: '调度处置人员' },
                        { title: '完成归档', description: '生成处置记录' },
                      ]}
                    />
                  </div>
                </DemoCard>
                <DemoCard title="Timeline" wide>
                  <Timeline items={timelineItems} />
                </DemoCard>
              </GallerySection>
            );
          }

          if (section.id === 'data') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="FileTypeIcon" wide>
                  <div className="space-y-5">
                    {fileTypeIconExamples.map((group) => (
                      <section key={group.title} aria-label={group.title}>
                        <h3 className="mb-3 text-[12px] font-medium text-[var(--lumen-color-text-secondary)]">
                          {group.title}
                        </h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-x-3 gap-y-4">
                          {group.files.map((fileName) => (
                            <div key={fileName} className="flex min-w-0 flex-col items-center gap-2">
                              <FileTypeIcon fileName={fileName} title={fileName} size="lg" />
                              <span className="w-full truncate text-center text-[11px] text-[var(--lumen-color-text-muted)]">
                                {fileName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </DemoCard>
                <DemoCard title="DataTable · Default" wide>
                  <DataTable
                    caption="默认公路安全事件表格"
                    columns={safetyEventColumns}
                    data={safetyEvents.slice(0, 5)}
                    getRowKey={(event) => event.id}
                  />
                </DemoCard>
                <DemoCard title="DataTable · Embedded + Pagination" wide>
                  <div className="overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)]">
                    <div className="border-b border-[var(--lumen-color-border)] px-4 py-3">
                      <strong className="block text-[14px] font-semibold text-[var(--lumen-color-text-strong)]">
                        公路安全事件
                      </strong>
                      <span className="mt-1 block text-[13px] text-[var(--lumen-color-text-muted)]">
                        按更新时间排序 · {safetyEvents.length} 条
                      </span>
                    </div>
                    <DataTable
                      caption="公路安全事件"
                      variant="embedded"
                      columns={safetyEventColumns}
                      data={visibleSafetyEvents}
                      getRowKey={(event) => event.id}
                      sort={eventSort}
                      onSortChange={(nextSort) => {
                        setEventSort(nextSort);
                        setEventPage(1);
                      }}
                      selectedRowKeys={selectedEventKeys}
                      onSelectedRowKeysChange={setSelectedEventKeys}
                    />
                    <Pagination
                      currentPage={eventPage}
                      totalPages={eventTotalPages}
                      totalItems={safetyEvents.length}
                      pageSize={eventPageSize}
                      onPageSizeChange={(nextPageSize) => {
                        setEventPageSize(nextPageSize);
                        setEventPage(1);
                      }}
                      onPageChange={setEventPage}
                    />
                  </div>
                  <p className="mt-3 text-[12px] text-[var(--lumen-color-text-muted)]">
                    已选择 {selectedEventKeys.length} 条事件
                  </p>
                </DemoCard>
                <DemoCard title="List" wide>
                  <List aria-label="重点事件">
                    <ListItem
                      title="主线异常停车"
                      description="G65 K18+900，车辆已持续停留 6 分钟。"
                      leading={<AlertTriangle className="text-[var(--lumen-color-danger)]" size={18} />}
                      meta={<Badge size="sm" variant="danger">高风险</Badge>}
                      actions={(
                        <Tooltip content="更多操作">
                          <Button
                            iconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="主线异常停车更多操作"
                            icon={<MoreHorizontal size={16} />}
                          />
                        </Tooltip>
                      )}
                    />
                    <ListItem
                      title="边坡监测预警"
                      description="K24 路段位移速率超过关注阈值。"
                      leading={<MapPin className="text-[var(--lumen-color-warning)]" size={18} />}
                      meta="8 分钟前"
                    />
                    <ListItem
                      title="巡检任务已完成"
                      description="今日重点路段巡检结果已提交。"
                      leading={<Check className="text-[var(--lumen-color-success)]" size={18} />}
                      meta={<Badge size="sm" variant="success">已完成</Badge>}
                    />
                  </List>
                </DemoCard>
                <DemoCard title="Scrollbar" wide>
                  <div className="form-grid items-start">
                    <Scrollbar
                      aria-label="告警记录"
                      className="h-48 rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]"
                    >
                      <div className="divide-y divide-[var(--lumen-color-surface-muted)] px-4">
                        {Array.from({ length: 12 }, (_, index) => (
                          <div key={index} className="py-3 text-[13px] text-[var(--lumen-color-text-secondary)]">
                            K{18 + index} 路段监测记录 · {String(index + 8).padStart(2, '0')}:30
                          </div>
                        ))}
                      </div>
                    </Scrollbar>
                    <Scrollbar
                      aria-label="巡检看板"
                      orientation="horizontal"
                      size="sm"
                      autoHide
                      className="rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] p-4"
                    >
                      <div className="flex w-max gap-3">
                        {['桥梁巡检', '隧道照明', '边坡监测', '路面养护', '机电设备'].map((item) => (
                          <div
                            key={item}
                            className="w-40 shrink-0 border-l-2 border-[var(--lumen-color-primary)] bg-[var(--lumen-color-surface-muted)] px-3 py-4"
                          >
                            <strong className="block text-[13px] font-medium text-[var(--lumen-color-text-strong)]">
                              {item}
                            </strong>
                            <span className="mt-1 block text-[12px] text-[var(--lumen-color-text-muted)]">
                              今日任务 8 项
                            </span>
                          </div>
                        ))}
                      </div>
                    </Scrollbar>
                  </div>
                </DemoCard>
                <DemoCard title="Collapse + Accordion" wide>
                  <div className="form-grid">
                    <Collapse defaultValue={['road', 'device']}>
                      <CollapseItem value="road" title="路段信息" extra="G65 K18+900">
                        南向双车道，当前平均车速 72 km/h。
                      </CollapseItem>
                      <CollapseItem value="device" title="监测设备" extra="12 台在线">
                        摄像机、雷达和气象监测设备运行正常。
                      </CollapseItem>
                    </Collapse>
                    <Accordion defaultValue="event">
                      <CollapseItem value="event" title="事件详情">
                        异常停车事件已持续 6 分钟，等待现场确认。
                      </CollapseItem>
                      <CollapseItem value="history" title="处置记录">
                        10:26 已通知附近巡检人员前往现场。
                      </CollapseItem>
                    </Accordion>
                  </div>
                </DemoCard>
                <DemoCard title="Divider" wide>
                  <div>
                    <p className="text-[13px] text-[var(--lumen-color-text-secondary)]">G65 K18+900 南向路段</p>
                    <Divider />
                    <p className="text-[13px] text-[var(--lumen-color-text-secondary)]">当前平均车速 72 km/h</p>
                    <Divider label="设备状态" variant="dashed" />
                    <div className="flex h-8 items-center text-[13px] text-[var(--lumen-color-text-secondary)]">
                      <span>摄像机在线</span>
                      <Divider orientation="vertical" />
                      <span>雷达在线</span>
                      <Divider orientation="vertical" />
                      <span>气象站在线</span>
                    </div>
                  </div>
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
                <DemoCard title="Popover" wide>
                  <div className="button-row">
                    <Popover
                      placement="bottom"
                      align="start"
                      ariaLabel="监测设备详情"
                      contentClassName="w-[300px]"
                      trigger={({ open, popoverId, toggle }) => (
                        <Button
                          variant="secondary"
                          aria-expanded={open}
                          aria-controls={popoverId}
                          aria-haspopup="dialog"
                          icon={<MapPin size={15} />}
                          onClick={toggle}
                        >
                          设备详情
                        </Button>
                      )}
                    >
                      {({ close }) => (
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[14px] font-semibold text-[var(--lumen-color-text)]">摄像机 K18-03</div>
                              <div className="mt-1 text-[12px] text-[var(--lumen-color-text-muted)]">G65 K18+900 南向</div>
                            </div>
                            <Badge variant="success">在线</Badge>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                            <span className="text-[var(--lumen-color-text-muted)]">最后同步</span>
                            <span className="text-right text-[var(--lumen-color-text)]">2 分钟前</span>
                            <span className="text-[var(--lumen-color-text-muted)]">今日事件</span>
                            <span className="text-right text-[var(--lumen-color-text)]">3 条</span>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="outline" onClick={close}>关闭</Button>
                          </div>
                        </div>
                      )}
                    </Popover>
                  </div>
                </DemoCard>
              </GallerySection>
            );
          }

          return (
            <GallerySection key={section.id} section={section}>
              <DemoCard title="Alert" wide>
                <div className="stack">
                  <Alert
                    variant="info"
                    title="路况数据已更新"
                    action={<Button size="sm" variant="outline">查看变化</Button>}
                  >
                    最新一次同步完成于 10:32，当前路网数据正常。
                  </Alert>
                  <Alert variant="success" title="事件处置完成">
                    SJ-0018 已关闭，处置记录已归档。
                  </Alert>
                  {warningAlertVisible ? (
                    <Alert
                      variant="warning"
                      title="部分设备离线"
                      onClose={() => setWarningAlertVisible(false)}
                    >
                      K28 路段有 3 台监测设备暂时无法连接。
                    </Alert>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="self-start"
                      onClick={() => setWarningAlertVisible(true)}
                    >
                      恢复警告
                    </Button>
                  )}
                  <Alert variant="danger" title="高风险事件待处置">
                    行人闯入主线区域，请立即通知现场人员。
                  </Alert>
                </div>
              </DemoCard>
              <DemoCard title="Progress" wide>
                <div className="stack">
                  <Progress label="事件处置进度" value={68} showValue />
                  <Progress label="今日巡检完成率" value={84} status="success" showValue />
                  <Progress label="设备离线占比" value={27} status="warning" showValue />
                  <div className="button-row">
                    <Progress type="circle" label="设备在线率" value={92} status="success" showValue />
                    <Progress type="circle" label="风险处置率" value={64} status="info" showValue />
                    <Progress type="circle" label="同步中" indeterminate />
                  </div>
                </div>
              </DemoCard>
              <DemoCard title="Spinner" wide>
                <div className="button-row">
                  <Spinner size="sm" />
                  <Spinner label="正在刷新路况" />
                  <Spinner size="lg" tone="warning" label="正在同步设备" />
                </div>
              </DemoCard>
              <DemoCard title="Empty" wide>
                <Empty
                  bordered
                  icon={<SearchX size={22} />}
                  title="没有匹配的事件"
                  description="当前筛选条件下没有安全事件记录。"
                  action={(
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => Toast.info('已清除筛选条件')}
                    >
                      清除筛选
                    </Button>
                  )}
                />
              </DemoCard>
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
