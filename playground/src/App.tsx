import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Filter,
  Languages,
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
  Star,
  Moon,
  Sun,
  Table2,
  Type as TypeIcon,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Accordion,
  Alert,
  AppBar,
  AppHeader,
  Avatar,
  Badge,
  BottomNavigation,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Cascader,
  Checkbox,
  Chip,
  Collapse,
  CollapseItem,
  CommandPalette,
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
  Fab,
  Input,
  List,
  ListItem,
  LumenProvider,
  Modal,
  NumberInput,
  Pagination,
  Popover,
  Progress,
  PullToRefresh,
  Radio,
  RadioGroup,
  Rating,
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
  Toolbar,
  Tooltip,
  Transfer,
  TreeSelect,
  Typography,
  enUS,
  zhCN,
} from '@luokuiai/lumen-ui';
import type { DataTableColumn, DataTableSort, StepsDirection } from '@luokuiai/lumen-ui';
import '@luokuiai/lumen-theme-clarity';
import '@luokuiai/lumen-theme-paper';
import '@luokuiai/lumen-theme-prism';
import type { GeneratedPropDoc } from './generated/componentApi';
import { demoCardCodeByTitle } from './generated/demoCardCode';
import { localizeDemoNode, translateDemoText } from './demoI18n';

type Section = {
  id: string;
  title: string;
  description: string;
  keywords: string;
  icon: LucideIcon;
};

type DemoDefinition = {
  id: string;
  title: string;
  sourceSection: string;
  code: string;
  cardTitles: string[];
  apiComponents: string[];
  codeByCardTitle?: Record<string, string>;
};

type ComponentPropDoc = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
  descriptionEn?: string;
  required?: boolean;
};

type ComponentGuide = {
  summary: string;
  usage: string[];
  props: ComponentPropDoc[];
};

type GalleryCategory = Section & {
  demos: DemoDefinition[];
};

type TreeNode = {
  id: string;
  label: string;
  selectable?: boolean;
  disabled?: boolean;
  children?: TreeNode[];
};

type ColorScheme = 'light' | 'dark';
type Accent = 'blue' | 'purple';
type Theme = 'clarity' | 'paper' | 'prism';

const themeStorageKey = 'lumen-playground-theme';
const colorSchemeStorageKey = 'lumen-playground-color-scheme';
const accentStorageKey = 'lumen-playground-accent';
const localeStorageKey = 'lumen-playground-locale';

const getInitialLocale = () => {
  if (typeof window === 'undefined') return zhCN;
  try {
    return window.localStorage.getItem(localeStorageKey) === 'en-US' ? enUS : zhCN;
  } catch {
    return zhCN;
  }
};

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

const renderSections: Section[] = [
  { id: 'typography', title: 'Typography', description: '标题、正文和辅助文字层级。', keywords: 'Typography H1 H2 H3 H4 H5 H6 Body Caption', icon: TypeIcon },
  { id: 'buttons', title: 'Buttons', description: '按钮、徽标、Chip、头像和 Tooltip。', keywords: 'Button Badge Chip Avatar Tooltip', icon: Plus },
  { id: 'forms', title: 'Forms', description: '输入、校验、开关、单选和多行文本。', keywords: 'Input NumberInput FormField Textarea Checkbox Radio RadioGroup Rating Switch Slider', icon: Check },
  { id: 'pickers', title: 'Pickers', description: '选择器、级联选择、树选择、穿梭框、日历、日期和时间选择。', keywords: 'Select Cascader TreeSelect Transfer Calendar DatePicker TimePicker DateTimePicker', icon: CalendarDays },
  { id: 'data', title: 'Data Display', description: '文件类型、数据表格、列表、滚动区域、分隔和折叠内容。', keywords: 'FileTypeIcon DataTable List ListItem Pagination Scrollbar Divider Collapse Accordion', icon: Table2 },
  { id: 'navigation', title: 'Navigation', description: '应用栏、工具栏、底部导航和页面导航。', keywords: 'AppBar Toolbar BottomNavigation Breadcrumb Tabs Steps DropdownMenu Timeline SideNav', icon: MoreHorizontal },
  { id: 'overlays', title: 'Overlays', description: '模态框、抽屉、命令面板、确认和消息提示。', keywords: 'Modal Drawer CommandPalette ConfirmDialog Toast', icon: Bell },
  { id: 'feedback', title: 'Feedback', description: '页面提示、加载、进度、空状态、上传和骨架屏。', keywords: 'Alert Spinner Progress Empty FileUpload Skeleton SegmentedControl', icon: Settings },
];

const toDemoId = (title: string) => title
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const usageExample = (
  imports: string,
  jsx: string,
  lucideIcons?: string,
  setup?: string,
) => `${setup ? "import { useState } from 'react';\n" : ''}${lucideIcons ? `import { ${lucideIcons} } from 'lucide-react';\n` : ''}import { ${imports} } from '@luokuiai/lumen-ui';

export function Example() {
${setup ? `  ${setup}\n\n` : ''}
  return (
${jsx}
  );
}`;

const demo = (
  title: string,
  sourceSection: string,
  imports: string,
  jsx: string,
  lucideIcons?: string,
  setup?: string,
  cardTitles: string[] = [title],
  apiComponents: string[] = title.split('/').map((item) => item.trim()),
): DemoDefinition => ({
  id: toDemoId(title),
  title,
  sourceSection,
  code: usageExample(imports, jsx, lucideIcons, setup),
  cardTitles,
  apiComponents,
});

const galleryCategories: GalleryCategory[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: '字体层级与内容基础样式。',
    keywords: 'Typography Headings Body',
    icon: TypeIcon,
    demos: [
      demo('Typography', 'typography', 'Typography', '    <>\n      <Typography variant="h1">H1 运营总览</Typography>\n      <Typography variant="h2">H2 事件处置</Typography>\n      <Typography>正文用于承载主要说明和数据内容。</Typography>\n      <Typography variant="caption" tone="muted">辅助文字用于简短提示。</Typography>\n    </>', undefined, undefined, ['Headings', 'Body']),
      demo('Locale', 'typography', 'LumenProvider, Pagination, Select, enUS', '    <LumenProvider locale={enUS}>\n      <div className="space-y-4">\n        <Select options={[]} value={null} onChange={() => undefined} />\n        <Pagination currentPage={2} totalPages={8} totalItems={72} onPageChange={() => undefined} />\n      </div>\n    </LumenProvider>', undefined, undefined, ['Locale'], ['LumenProvider']),
    ],
  },
  {
    id: 'actions',
    title: 'Actions',
    description: '触发操作、工具组和页面主要行为。',
    keywords: 'Button Fab Toolbar DropdownMenu',
    icon: Plus,
    demos: [
      demo('Button', 'buttons', 'Button', '    <Button variant="primary">保存</Button>'),
      {
        ...demo('Fab', 'buttons', 'Fab', '    <Fab position="static" icon={<Plus size={18} />} aria-label="新建任务" />', 'Plus', undefined, ['Icon only', 'Extended', 'Expandable']),
        codeByCardTitle: {
          'Icon only': usageExample('Fab', '    <div className="flex items-center gap-4">\n      <Fab position="static" size="sm" icon={<Plus size={18} />} aria-label="新建任务" />\n      <Fab position="static" size="md" variant="secondary" icon={<Search size={18} />} aria-label="搜索" />\n      <Fab position="static" size="lg" variant="outline" icon={<Settings size={20} />} aria-label="设置" />\n    </div>', 'Plus, Search, Settings'),
          Extended: usageExample('Fab', '    <div className="flex items-center gap-4">\n      <Fab position="static" icon={<Plus size={18} />} label="新建任务" />\n      <Fab position="static" variant="secondary" icon={<Filter size={18} />} label="筛选条件" />\n    </div>', 'Filter, Plus'),
          Expandable: usageExample('Fab, Switch', '    <div className="flex items-center gap-5">\n      <Switch checked={extended} onChange={setExtended} label="显示文字" />\n      <Fab\n        position="static"\n        icon={<Plus size={18} />}\n        label="新建任务"\n        extended={extended}\n      />\n    </div>', 'Plus', "const [extended, setExtended] = useState(false);"),
        },
      },
      demo('Toolbar', 'navigation', 'Button, Toolbar', '    <Toolbar\n      ariaLabel="列表操作"\n      className="rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]"\n    >\n      <Button size="sm" variant="ghost" icon={<Search size={15} />}>\n        搜索\n      </Button>\n      <Button size="sm" variant="ghost" icon={<Filter size={15} />}>\n        筛选\n      </Button>\n      <div className="flex-1" />\n      <Button size="sm" icon={<Plus size={15} />}>\n        新建\n      </Button>\n    </Toolbar>', 'Filter, Plus, Search'),
      demo('DropdownMenu', 'navigation', 'Button, DropdownMenu', '    <DropdownMenu\n      trigger={({ toggle }) => <Button onClick={toggle}>打开菜单</Button>}\n    >\n      {({ close }) => <button onClick={close}>复制</button>}\n    </DropdownMenu>'),
    ],
  },
  {
    id: 'forms',
    title: 'Forms',
    description: '输入、选择、日期时间和文件提交。',
    keywords: 'Input FormField Checkbox Radio Switch Slider Rating Select Cascader Date Time Calendar Transfer FileUpload',
    icon: Check,
    demos: [
      demo('Input / FormField', 'forms', 'FormField, Input', '    <FormField label="项目名称" inputId="project-name">\n      {(props) => <Input {...props} />}\n    </FormField>', undefined, undefined, ['Input + FormField']),
      demo('NumberInput', 'forms', 'FormField, NumberInput', '    <FormField label="处置时限">\n      <NumberInput defaultValue={30} min={5} max={120} suffix="分钟" />\n    </FormField>'),
      demo('Textarea', 'forms', 'FormField, Textarea', '    <FormField label="备注">\n      <Textarea value={value} onChange={setValue} maxLength={200} showCount />\n    </FormField>'),
      demo('Checkbox', 'forms', 'Checkbox', '    <div className="flex items-center gap-5">\n      <Checkbox size="sm" checked={checked} onChange={setChecked} label="Small" />\n      <Checkbox size="md" checked={checked} onChange={setChecked} label="Medium" />\n      <Checkbox size="lg" checked={checked} onChange={setChecked} label="Large" />\n    </div>'),
      demo('Radio', 'forms', 'Radio, RadioGroup', '    <div className="space-y-4">\n      <div className="flex items-center gap-5">\n        <Radio size="sm" checked label="Small" />\n        <Radio size="md" checked label="Medium" />\n        <Radio size="lg" checked label="Large" />\n      </div>\n      <RadioGroup size="md" value={value} onChange={setValue} options={options} />\n    </div>'),
      demo('Switch', 'forms', 'Switch', '    <div className="flex items-center gap-5">\n      <Switch size="sm" checked={enabled} onChange={setEnabled} label="Small" />\n      <Switch size="md" checked={enabled} onChange={setEnabled} label="Medium" />\n      <Switch size="lg" checked={enabled} onChange={setEnabled} label="Large" />\n    </div>'),
      demo('Slider', 'forms', 'Slider', '    <Slider value={60} onChange={() => undefined} />'),
      demo('Rating', 'forms', 'Rating', '    <Rating value={4} onChange={() => undefined} />'),
      demo('Select', 'pickers', 'Select', '    <Select\n      value="review"\n      options={[{ label: \'设计评审\', value: \'review\' }]}\n      onChange={() => undefined}\n    />'),
      demo('TreeSelect', 'pickers', 'TreeSelect', '    <TreeSelect nodes={nodes} value="frontend" onChange={setValue} searchable />'),
      demo('Cascader', 'pickers', 'Cascader', '    <Cascader options={options} value={[]} onChange={() => undefined} />'),
      demo('DatePicker', 'pickers', 'DatePicker', '    <DatePicker value="2026-09-04" onChange={setValue} />'),
      demo('TimePicker', 'pickers', 'TimePicker', '    <TimePicker value="09:30" onChange={setValue} minuteStep={5} />'),
      demo('DateTimePicker', 'pickers', 'DateTimePicker', '    <DateTimePicker label="开始时间" value="2026-09-04 09:30:00" onChange={setValue} />'),
      demo('Calendar', 'pickers', 'Calendar', '    <Calendar value="2026-09-04" onChange={() => undefined} />'),
      demo('Transfer', 'pickers', 'Transfer', '    <Transfer items={items} targetKeys={[]} onChange={() => undefined} />'),
      demo('FileUpload', 'feedback', 'FileUpload', '    <>\n      <FileUpload value={files} onChange={setFiles} multiple />\n      <FileUpload density="compact" value={files} onChange={setFiles} multiple />\n    </>', undefined, undefined, ['FileUpload', 'FileUpload Compact']),
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: '应用级与页面级导航结构。',
    keywords: 'AppBar BottomNavigation SideNav Breadcrumb Tabs Steps Pagination',
    icon: MoreHorizontal,
    demos: [
      demo('Breadcrumb', 'navigation', 'Breadcrumb', '    <Breadcrumb items={[\n      { label: \'首页\', href: \'/\' },\n      { label: \'订单详情\' },\n    ]} />'),
      demo('AppBar', 'navigation', 'AppBar, Button, Typography', '    <div className="relative mx-auto h-56 w-full max-w-[390px] overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)]">\n      <AppBar\n        position="absolute"\n        title="订单详情"\n        leading={(\n          <Button iconOnly variant="ghost" aria-label="返回" icon={<ArrowLeft size={19} />} />\n        )}\n        actions={(\n          <Button iconOnly variant="ghost" aria-label="更多操作" icon={<MoreHorizontal size={19} />} />\n        )}\n      />\n      <div className="px-5 pt-20">\n        <Typography variant="h3">#LM-20260904</Typography>\n        <Typography variant="caption" color="muted">等待审核</Typography>\n      </div>\n    </div>', 'ArrowLeft, MoreHorizontal'),
      demo('BottomNavigation', 'navigation', 'BottomNavigation, Typography', '    <div className="relative mx-auto h-[320px] w-full max-w-[390px] overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)]">\n      <div className="flex h-full flex-col items-center justify-center px-6 pb-16 text-center">\n        <Typography variant="h3">{value}</Typography>\n        <Typography variant="caption" color="muted">当前底部导航目标</Typography>\n      </div>\n      <BottomNavigation\n        position="absolute"\n        value={value}\n        onChange={setValue}\n        items={[\n          { value: \'home\', label: \'首页\', icon: Star },\n          { value: \'schedule\', label: \'日程\', icon: CalendarDays },\n          { value: \'messages\', label: \'消息\', icon: Bell, badge: 3, badgeLabel: \'3 条未读消息\' },\n          { value: \'profile\', label: \'我的\', icon: UserRound },\n        ]}\n      />\n    </div>', 'Bell, CalendarDays, Star, UserRound', "const [value, setValue] = useState('home');"),
      demo('Pagination', 'data', 'Pagination', '    <Pagination currentPage={1} totalPages={5} onPageChange={setPage} />'),
      demo('Tabs', 'navigation', 'Tabs', '    <Tabs\n      value="overview"\n      options={[{ value: \'overview\', label: \'总览\' }]}\n      onChange={() => undefined}\n    />'),
      demo('Steps', 'navigation', 'Steps', '    <Steps current={1} items={[{ title: \'提交\' }, { title: \'完成\' }]} />'),
    ],
  },
  {
    id: 'data-display',
    title: 'Data Display',
    description: '状态、列表、表格与结构化内容。',
    keywords: 'Badge Avatar Chip Timeline FileTypeIcon DataTable List Scrollbar Collapse Accordion Divider',
    icon: Table2,
    demos: [
      demo('Badge', 'buttons', 'Badge', '    <Badge variant="success">Success</Badge>'),
      demo('Avatar', 'buttons', 'Avatar', '    <Avatar name="Lumen Design" />'),
      demo('Chip', 'buttons', 'Chip', '    <Chip tone="neutral">设计系统</Chip>'),
      demo('Timeline', 'navigation', 'Timeline', '    <Timeline items={[{ id: \'1\', title: \'已创建\' }]} />'),
      demo('FileTypeIcon', 'data', 'FileTypeIcon', '    <FileTypeIcon fileName="proposal.pdf" />'),
      demo('DataTable', 'data', 'DataTable', '    <>\n      <DataTable stickyHeader columns={columns} data={rows} getRowKey={(row) => row.id} />\n      <DataTable variant="embedded" columns={columns} data={rows} getRowKey={(row) => row.id} />\n    </>', undefined, undefined, ['DataTable · Sticky Header', 'DataTable · Embedded']),
      demo('List', 'data', 'List, ListItem', '    <List>\n      <ListItem title="设计评审" />\n    </List>'),
      demo('Scrollbar', 'data', 'Scrollbar', '    <Scrollbar className="h-64">{content}</Scrollbar>'),
      demo('Collapse', 'data', 'Collapse, CollapseItem', '    <Collapse defaultValue={[\'road\']}>\n      <CollapseItem value="road" title="路段信息">路段内容</CollapseItem>\n    </Collapse>'),
      demo('Accordion', 'data', 'Accordion, CollapseItem', '    <Accordion defaultValue="event">\n      <CollapseItem value="event" title="事件详情">事件内容</CollapseItem>\n    </Accordion>'),
      demo('Divider', 'data', 'Divider', '    <Divider label="更多信息" />'),
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: '操作结果、进度、加载与空状态。',
    keywords: 'Alert Toast Progress Spinner PullToRefresh Skeleton Empty SegmentedControl',
    icon: Settings,
    demos: [
      demo('Alert', 'feedback', 'Alert', '    <Alert variant="success" title="保存成功" />'),
      demo('Progress', 'feedback', 'Progress', '    <Progress value={64} />'),
      demo('Spinner', 'feedback', 'Spinner', '    <Spinner aria-label="加载中" />'),
      demo('PullToRefresh', 'feedback', 'PullToRefresh', '    <PullToRefresh\n      className="h-72 overflow-y-auto"\n      onRefresh={() => new Promise((resolve) => {\n        window.setTimeout(() => {\n          setRefreshCount((count) => count + 1);\n          resolve();\n        }, 800);\n      })}\n    >\n      <div>已刷新 {refreshCount} 次</div>\n    </PullToRefresh>', undefined, 'const [refreshCount, setRefreshCount] = useState(0);'),
      demo('Empty', 'feedback', 'Empty', '    <Empty title="暂无数据" />'),
      demo('SegmentedControl', 'feedback', 'SegmentedControl', '    <SegmentedControl value="all" options={options} onChange={setValue} />'),
      demo('Skeleton', 'feedback', 'Skeleton', '    <Skeleton variant="rectangular" height={96} />'),
    ],
  },
  {
    id: 'overlays',
    title: 'Overlays',
    description: '覆盖页面的弹层、抽屉和上下文操作。',
    keywords: 'Modal Drawer ConfirmDialog CommandPalette Popover Tooltip',
    icon: Bell,
    demos: [
      demo('CommandPalette', 'overlays', 'Button, CommandPalette', '    <Button onClick={() => setOpen(true)}>打开 CommandPalette</Button>'),
      demo('Modal', 'overlays', 'Button, Modal', '    <Modal open={open} title="编辑配置" description="修改当前配置项。" onRequestClose={() => setOpen(false)}>{content}</Modal>'),
      demo('Drawer', 'overlays', 'Button, Drawer', '    <Drawer open={open} closeOnSwipe title="配置面板" description="调整页面配置。" onRequestClose={() => setOpen(false)}>{content}</Drawer>'),
      demo('ConfirmDialog', 'overlays', 'Button, ConfirmDialog', '    <Button variant="destructive" onClick={() => setOpen(true)}>打开 Confirm</Button>'),
      demo('Toast', 'overlays', 'Button, Toast', '    <Button onClick={() => Toast.success(\'组件状态已保存\')}>Toast</Button>'),
      demo('Popover', 'overlays', 'Button, Popover', '    <Popover trigger={<Button>查看详情</Button>}>\n      上下文内容\n    </Popover>'),
    ],
  },
];

const playgroundMessages = {
  'zh-CN': {
    locale: 'zh-CN',
    appDescription: '组件库全量预览和交互检查入口。',
    navigationLabel: '组件目录',
    mobileNavigationLabel: '移动端组件目录',
    openNavigation: '打开导航',
    closeNavigation: '关闭导航',
    openSearch: '打开搜索',
    closeSearch: '关闭搜索',
    moreActions: '更多操作',
    expandSidebar: '展开侧栏',
    collapseSidebar: '折叠侧栏',
    searchPlaceholder: '搜索分类或组件',
    brandSubtitle: '开发预览',
    usageTips: '使用建议',
    examples: '示例',
    properties: '属性',
    property: '属性',
    type: '类型',
    defaultValue: '默认值',
    description: '说明',
    required: '必填',
    hideCode: '隐藏代码',
    viewCode: '查看代码',
    copied: '已复制',
    copyCode: '复制代码',
    codeCopied: '代码已复制',
    categories: {
      foundations: { title: '基础', description: '字体层级与内容基础样式。' },
      actions: { title: '操作', description: '触发操作、工具组和页面主要行为。' },
      forms: { title: '表单', description: '输入、选择、日期时间和文件提交。' },
      navigation: { title: '导航', description: '应用级与页面级导航结构。' },
      'data-display': { title: '数据展示', description: '状态、列表、表格与结构化内容。' },
      feedback: { title: '反馈', description: '操作结果、进度、加载与空状态。' },
      overlays: { title: '浮层', description: '覆盖页面的弹层、抽屉和上下文操作。' },
    },
  },
  'en-US': {
    locale: 'en-US',
    appDescription: 'A complete preview and interaction-checking workspace for the component library.',
    navigationLabel: 'Component catalog',
    mobileNavigationLabel: 'Mobile component catalog',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    openSearch: 'Open search',
    closeSearch: 'Close search',
    moreActions: 'More actions',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    searchPlaceholder: 'Search categories or components',
    brandSubtitle: 'Development Preview',
    usageTips: 'Usage',
    examples: 'Examples',
    properties: 'Properties',
    property: 'Property',
    type: 'Type',
    defaultValue: 'Default',
    description: 'Description',
    required: 'Required',
    hideCode: 'Hide code',
    viewCode: 'View code',
    copied: 'Copied',
    copyCode: 'Copy code',
    codeCopied: 'Code copied',
    categories: {
      foundations: { title: 'Foundations', description: 'Typography and foundational content styles.' },
      actions: { title: 'Actions', description: 'Triggers, tool groups, and primary page actions.' },
      forms: { title: 'Forms', description: 'Inputs, selections, date and time controls, and file submission.' },
      navigation: { title: 'Navigation', description: 'Application-level and page-level navigation structures.' },
      'data-display': { title: 'Data Display', description: 'Status, lists, tables, and structured content.' },
      feedback: { title: 'Feedback', description: 'Results, progress, loading, and empty states.' },
      overlays: { title: 'Overlays', description: 'Modals, drawers, and contextual actions above the page.' },
    },
  },
} as const;

type PlaygroundMessages = (typeof playgroundMessages)[keyof typeof playgroundMessages];
const PlaygroundMessagesContext = createContext<PlaygroundMessages>(playgroundMessages['zh-CN']);

const zhDemoNames: Record<string, string> = {
  Typography: '排版',
  Locale: '国际化',
  Button: '按钮',
  Fab: '浮动操作按钮',
  Toolbar: '工具栏',
  DropdownMenu: '下拉菜单',
  'Input / FormField': '输入框 / 表单字段',
  NumberInput: '数字输入框',
  Textarea: '多行文本框',
  Checkbox: '复选框',
  Radio: '单选框',
  Switch: '开关',
  Slider: '滑块',
  Rating: '评分',
  Select: '选择器',
  TreeSelect: '树选择器',
  Cascader: '级联选择器',
  DatePicker: '日期选择器',
  TimePicker: '时间选择器',
  DateTimePicker: '日期时间选择器',
  Calendar: '日历',
  Transfer: '穿梭框',
  FileUpload: '文件上传',
  Breadcrumb: '面包屑',
  AppBar: '应用栏',
  BottomNavigation: '底部导航',
  Pagination: '分页',
  Tabs: '标签页',
  Steps: '步骤条',
  Badge: '徽标',
  Avatar: '头像',
  Chip: '标签',
  Timeline: '时间线',
  FileTypeIcon: '文件类型图标',
  DataTable: '数据表格',
  List: '列表',
  Scrollbar: '滚动条',
  Collapse: '折叠面板',
  Accordion: '手风琴',
  Divider: '分隔线',
  Alert: '提示',
  Progress: '进度条',
  Spinner: '加载指示器',
  PullToRefresh: '下拉刷新',
  Empty: '空状态',
  SegmentedControl: '分段控制器',
  Skeleton: '骨架屏',
  CommandPalette: '命令面板',
  Modal: '模态框',
  Drawer: '抽屉',
  ConfirmDialog: '确认对话框',
  Toast: '消息提示',
  Popover: '弹出框',
};

const zhExampleNames: Record<string, string> = {
  Headings: '标题',
  Body: '正文',
  'Icon only': '仅图标',
  Extended: '扩展形态',
  Expandable: '可展开',
  'Input + FormField': '输入框与表单字段',
  'DataTable · Sticky Header': '数据表格 · 固定表头',
  'DataTable · Embedded': '数据表格 · 嵌入式',
  'FileUpload Compact': '文件上传 · 紧凑模式',
};

const allDemos = galleryCategories.flatMap((category) => category.demos);
const componentGuides: Record<string, ComponentGuide> = {
  fab: {
    summary: '浮动操作按钮用于突出当前页面最重要、最常用的单一操作，适合创建、编辑或快速添加。',
    usage: [
      '一个页面通常只保留一个主要 Fab，避免多个高强调操作竞争注意力。',
      '空间紧张时使用 icon-only；需要强化动作含义时使用 extended，并始终提供可访问名称。',
      'fixed 用于应用级悬浮，absolute 用于局部容器预览，static 用于普通布局和工具区。',
    ],
    props: [
      { name: 'icon', type: 'ReactNode', defaultValue: '-', description: '必填，按钮图标。' },
      { name: 'label', type: 'ReactNode', defaultValue: '-', description: '扩展状态显示的文字，也可作为折叠状态的可访问名称。' },
      { name: 'extended', type: 'boolean', defaultValue: '自动', description: '显式控制带文字或仅图标形态。未设置时根据 label 判断。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'sm'", description: '控制 36、44、52px 三档高度。' },
      { name: 'variant', type: 'ButtonVariant', defaultValue: "'primary'", description: '设置主色、次级、描边或危险操作样式。' },
      { name: 'position', type: "'fixed' | 'absolute' | 'static'", defaultValue: "'fixed'", description: '决定相对视口、容器或普通文档流定位。' },
      { name: 'placement', type: "'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'", defaultValue: "'bottom-end'", description: '设置悬浮位置，并自动适配 RTL。' },
      { name: 'offset', type: 'number | string', defaultValue: '16', description: '设置距定位边缘的间距。' },
      { name: 'safeArea', type: 'boolean', defaultValue: 'true', description: '在顶部或底部叠加设备安全区。' },
      { name: 'active', type: 'boolean', defaultValue: 'true', description: '控制是否显示。' },
      { name: 'loading', type: 'boolean', defaultValue: 'false', description: '显示加载图标并禁止重复点击。' },
    ],
  },
  toolbar: {
    summary: '工具栏用于组织一组与当前内容直接相关的操作、筛选和视图控制。',
    usage: ['使用方向键、Home 和 End 在工具间移动焦点。', '操作较多时开启 wrap，紧凑场景使用 sm。'],
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: '设置工具栏最小高度与水平留白。' },
      { name: 'wrap', type: 'boolean', defaultValue: 'false', description: '空间不足时允许工具换行。' },
      { name: 'ariaLabel', type: 'string', defaultValue: "'工具栏'", description: '描述这一组工具的用途。' },
      { name: 'children', type: 'ReactNode', defaultValue: '-', description: '按钮、输入框、分隔符或其他工具。' },
    ],
  },
  'app-bar': {
    summary: '应用栏固定页面上下文，承载返回操作、当前标题和少量页面级操作。',
    usage: ['移动页面通常使用居中标题；信息密集页面可使用 start 对齐。', 'fixed 和 sticky 会参与视口布局，局部演示使用 absolute。'],
    props: [
      { name: 'title', type: 'ReactNode', defaultValue: '-', description: '必填，当前页面标题。' },
      { name: 'leading', type: 'ReactNode', defaultValue: '-', description: '标题前的返回或导航操作。' },
      { name: 'actions', type: 'ReactNode', defaultValue: '-', description: '标题后的页面级操作。' },
      { name: 'position', type: "'fixed' | 'absolute' | 'sticky' | 'static'", defaultValue: "'fixed'", description: '设置应用栏定位方式。' },
      { name: 'titleAlign', type: "'start' | 'center'", defaultValue: "'center'", description: '设置标题对齐方式。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'lg'", description: '设置栏高。' },
      { name: 'safeArea', type: 'boolean', defaultValue: 'true', description: '为顶部刘海和状态栏预留空间。' },
      { name: 'active', type: 'boolean', defaultValue: 'true', description: '控制是否显示。' },
    ],
  },
  'bottom-navigation': {
    summary: '底部导航用于移动端的应用级主目的地切换，适合 3 到 5 个稳定且同级的入口。',
    usage: ['保持入口顺序稳定，不把临时操作放入底部导航。', '受控 value 决定当前项，onChange 负责同步路由或页面状态。'],
    props: [
      { name: 'items', type: 'BottomNavigationItem[]', defaultValue: '-', description: '必填，配置 value、label、icon、badge、href 和 disabled。' },
      { name: 'value', type: 'string', defaultValue: '-', description: '当前选中项的 value。' },
      { name: 'onChange', type: '(value, item) => void', defaultValue: '-', description: '选择可用项目时触发。' },
      { name: 'position', type: "'fixed' | 'absolute' | 'static'", defaultValue: "'fixed'", description: '设置相对视口、局部容器或文档流定位。' },
      { name: 'safeArea', type: 'boolean', defaultValue: 'true', description: '为底部手势区域增加安全间距。' },
      { name: 'active', type: 'boolean', defaultValue: 'true', description: '控制导航是否显示。' },
      { name: 'ariaLabel', type: 'string', defaultValue: "'底部导航'", description: '设置导航区域的可访问名称。' },
    ],
  },
};

const enGuideSummaries: Record<string, string> = {
  fab: 'Floating action buttons highlight the single most important and frequent action on a page, such as creating, editing, or quickly adding an item.',
  toolbar: 'Toolbars organize actions, filters, and view controls that directly relate to the current content.',
  'app-bar': 'App bars establish page context with navigation, a title, and a small set of page-level actions.',
  'bottom-navigation': 'Bottom navigation switches between three to five stable, top-level destinations in a mobile application.',
};

const enGuideUsage: Record<string, string[]> = {
  fab: [
    'Keep one primary Fab per page so high-emphasis actions do not compete for attention.',
    'Use icon-only in tight spaces and extended when the action needs a clearer label; always provide an accessible name.',
    'Use fixed for app-level floating actions, absolute for local previews, and static for normal layout or tool areas.',
  ],
  toolbar: [
    'Use the arrow keys, Home, and End to move focus between tools.',
    'Enable wrap when there are many actions, and use sm in compact layouts.',
  ],
  'app-bar': [
    'Mobile pages usually use a centered title; information-dense pages can align the title to the start.',
    'Fixed and sticky positioning participate in viewport layout; use absolute for local previews.',
  ],
  'bottom-navigation': [
    'Keep destination order stable and do not place temporary actions in bottom navigation.',
    'The controlled value identifies the current destination; use onChange to synchronize routing or page state.',
  ],
};
const legacyCategoryAliases: Record<string, string> = {
  typography: 'foundations',
  buttons: 'actions',
  pickers: 'forms',
  data: 'data-display',
};
const legacyDemoAliases: Record<string, string> = {
  headings: 'typography',
  body: 'typography',
  dropdown: 'dropdown-menu',
  'checkbox-radio-switch': 'checkbox',
  'date-time': 'date-picker',
  'file-upload-compact': 'file-upload',
  'badge-avatar': 'badge',
  'data-table-sticky-header': 'data-table',
  'data-table-embedded-pagination': 'data-table',
  'collapse-accordion': 'collapse',
  'skeleton-segmented-control': 'segmented-control',
  'modal-drawer-confirm': 'modal',
};

const getRouteFromHash = () => {
  const fallbackCategory = galleryCategories[0]!;
  if (typeof window === 'undefined') {
    return { categoryId: fallbackCategory.id, demoId: fallbackCategory.demos[0]!.id };
  }

  const [rawCategoryId, rawDemoId] = window.location.hash.slice(1).split('/');
  const categoryId = legacyCategoryAliases[rawCategoryId ?? ''] ?? rawCategoryId;
  const category = galleryCategories.find((item) => item.id === categoryId) ?? fallbackCategory;
  const demoId = legacyDemoAliases[rawDemoId ?? ''] ?? rawDemoId;
  const selectedDemo = category.demos.find((item) => item.id === demoId) ?? category.demos[0]!;
  return { categoryId: category.id, demoId: selectedDemo.id };
};

type ActiveDemoContextValue = {
  demo: DemoDefinition;
  expandedCodeTitle?: string;
  copiedCodeTitle?: string;
  onToggleCode: (title: string) => void;
  onCopyCode: (title: string, code: string) => void;
};

const ActiveDemoContext = createContext<ActiveDemoContextValue | null>(null);
const initialGalleryRoute = getRouteFromHash();

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

const cascaderOptions = [
  {
    value: 'east',
    label: '华东区域',
    children: [
      {
        value: 'shanghai',
        label: '上海市',
        children: [
          { value: 'pudong', label: '浦东新区', keywords: ['陆家嘴'] },
          { value: 'xuhui', label: '徐汇区' },
        ],
      },
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'binjiang', label: '滨江区' },
        ],
      },
    ],
  },
  {
    value: 'north',
    label: '华北区域',
    children: [
      {
        value: 'beijing',
        label: '北京市',
        children: [
          { value: 'chaoyang', label: '朝阳区' },
          { value: 'haidian', label: '海淀区' },
        ],
      },
      { value: 'offline', label: '暂未开通', disabled: true },
    ],
  },
];

const treeNodes: TreeNode[] = [
  {
    id: 'product',
    label: '产品中心',
    children: [
      {
        id: 'user-product',
        label: '用户产品',
        selectable: true,
        children: [
          {
            id: 'product-design',
            label: '体验设计',
            selectable: true,
            children: [
              { id: 'web-experience', label: 'Web 体验' },
              { id: 'mobile-experience', label: '移动端体验' },
            ],
          },
          {
            id: 'product-growth',
            label: '增长策略',
            children: [
              { id: 'user-growth', label: '用户增长' },
              { id: 'business-growth', label: '商业增长' },
            ],
          },
        ],
      },
      {
        id: 'platform-product',
        label: '平台产品',
        selectable: true,
        children: [
          { id: 'data-platform-product', label: '数据平台' },
          { id: 'open-platform-product', label: '开放平台' },
        ],
      },
    ],
  },
  {
    id: 'engineering',
    label: '研发中心',
    children: [
      {
        id: 'application-engineering',
        label: '应用研发',
        children: [
          {
            id: 'frontend',
            label: '前端平台',
            selectable: true,
            children: [
              { id: 'web-foundation', label: 'Web 基础设施' },
              { id: 'client-framework', label: '客户端框架' },
            ],
          },
          {
            id: 'backend',
            label: '服务端平台',
            children: [
              { id: 'business-services', label: '业务服务' },
              { id: 'data-services', label: '数据服务' },
            ],
          },
        ],
      },
      {
        id: 'engineering-productivity',
        label: '工程效能',
        selectable: true,
        children: [
          { id: 'qa', label: '质量保障', disabled: true },
          { id: 'release-platform', label: '发布平台' },
        ],
      },
    ],
  },
];

const isTreeNodeSelectable = (node: TreeNode) =>
  !node.disabled && (node.selectable ?? !node.children?.length);

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
    render: (event) => <span className="font-normal text-[var(--lumen-color-text)]">{event.id}</span>,
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
  const activeDemo = useContext(ActiveDemoContext);
  const messages = useContext(PlaygroundMessagesContext);
  const [generatedComponentApi, setGeneratedComponentApi] = useState<Record<string, GeneratedPropDoc[]>>({});
  const guide = activeDemo ? componentGuides[activeDemo.demo.id] : undefined;
  const guideUsage = guide && messages.locale === 'en-US'
    ? (enGuideUsage[activeDemo!.demo.id] ?? guide.usage)
    : guide?.usage;
  const localizedChildren = messages.locale === 'en-US'
    ? localizeDemoNode(children)
    : children;
  const apiSections = activeDemo?.demo.apiComponents.flatMap((componentName) => {
    const generatedProps = generatedComponentApi[componentName];
    if (!generatedProps?.length) return [];
    if (!guide || toDemoId(componentName) !== activeDemo.demo.id) {
      return [{ componentName, props: generatedProps }];
    }

    const manualProps = new Map(guide.props.map((prop) => [prop.name, prop]));
    const mergedProps = generatedProps.map((prop) => ({
      ...prop,
      ...manualProps.get(prop.name),
    }));
    const generatedNames = new Set(generatedProps.map((prop) => prop.name));
    return [{
      componentName,
      props: [...mergedProps, ...guide.props.filter((prop) => !generatedNames.has(prop.name))],
    }];
  }) ?? [];

  useEffect(() => {
    void import('./generated/componentApi').then((module) => {
      setGeneratedComponentApi(module.generatedComponentApi);
    });
  }, []);

  return (
    <section id={section.id} className="gallery-section">
      <header className="section-header">
        <div>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
      </header>
      {guide ? (
        <div className="component-guidance">
          <h3>{messages.usageTips}</h3>
          <ul>
            {guideUsage!.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}
      <h3 className="document-section-title">{messages.examples}</h3>
      <div className="section-grid">{localizedChildren}</div>
      {apiSections.length ? (
        <section className="component-api" aria-labelledby={`${activeDemo!.demo.id}-api-title`}>
          <div className="component-api-card">
            <div className="component-api-heading">
              <span>API</span>
              <h3 id={`${activeDemo!.demo.id}-api-title`}>{messages.properties}</h3>
            </div>
            {apiSections.map(({ componentName, props }) => (
              <div key={componentName} className="component-api-group">
                <h4>{componentName}</h4>
                <div className="component-api-table-wrap lumen-scrollbar" data-size="sm">
                  <table className="component-api-table">
                    <thead>
                      <tr>
                        <th>{messages.property}</th>
                        <th>{messages.type}</th>
                        <th>{messages.defaultValue}</th>
                        <th>{messages.description}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.map((prop) => (
                        <tr key={prop.name}>
                          <td>
                            <code>{prop.name}</code>
                            {prop.required ? <span className="component-api-required">{messages.required}</span> : null}
                          </td>
                          <td><code>{prop.type}</code></td>
                          <td><code>{prop.defaultValue}</code></td>
                          <td>{messages.locale === 'en-US' ? prop.descriptionEn : prop.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

const tsxTokenPattern = /(\/\*.*?\*\/|\/\/.*|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|<\/?[A-Za-z][\w.:-]*|\b(?:as|async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|interface|let|new|null|of|return|switch|throw|true|try|type|undefined|while)\b|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$-]*(?=\s*=)|[{}[\]()]|\/?>(?!\=))/g;

function getTsxTokenClass(token: string) {
  if (token.startsWith('//') || token.startsWith('/*')) return 'syntax-comment';
  if (/^["'`]/.test(token)) return 'syntax-string';
  if (/^<\/?/.test(token) || token === '>' || token === '/>') return 'syntax-tag';
  if (/^\d/.test(token)) return 'syntax-number';
  if (/^[{}[\]()]$/.test(token)) return 'syntax-punctuation';
  if (/^(?:as|async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|interface|let|new|null|of|return|switch|throw|true|try|type|undefined|while)$/.test(token)) {
    return 'syntax-keyword';
  }
  return 'syntax-property';
}

function SyntaxCode({ code, interactive = true }: { code: string; interactive?: boolean }) {
  return (
    <pre className="usage-code" tabIndex={interactive ? 0 : -1}>
      <code>
        {code.split('\n').map((line, lineIndex) => {
          const tokens: React.ReactNode[] = [];
          let lastIndex = 0;

          for (const match of line.matchAll(tsxTokenPattern)) {
            const index = match.index ?? 0;
            if (index > lastIndex) tokens.push(line.slice(lastIndex, index));
            tokens.push(
              <span key={`${index}-${match[0]}`} className={getTsxTokenClass(match[0])}>
                {match[0]}
              </span>,
            );
            lastIndex = index + match[0].length;
          }

          if (lastIndex < line.length) tokens.push(line.slice(lastIndex));

          return (
            <span key={lineIndex} className="usage-code-line">
              <span className="usage-code-line-number" aria-hidden="true">{lineIndex + 1}</span>
              <span className="usage-code-line-content">{tokens.length ? tokens : ' '}</span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function DemoCard({
  title,
  children,
  wide = false,
  flush = false,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  flush?: boolean;
}) {
  const activeDemo = useContext(ActiveDemoContext);
  const messages = useContext(PlaygroundMessagesContext);
  if (activeDemo && !activeDemo.demo.cardTitles.includes(title)) return null;

  const code = demoCardCodeByTitle[title]
    ?? activeDemo?.demo.codeByCardTitle?.[title]
    ?? activeDemo?.demo.code
    ?? '';
  const localizedCode = messages.locale === 'en-US' ? translateDemoText(code) : code;
  const localizedTitle = messages.locale === 'zh-CN'
    ? (zhExampleNames[title] ?? zhDemoNames[title] ?? title)
    : title;
  const codePanelId = activeDemo ? `demo-code-${activeDemo.demo.id}-${toDemoId(title)}` : undefined;
  const codeExpanded = activeDemo?.expandedCodeTitle === title;
  const copied = activeDemo?.copiedCodeTitle === title;

  return (
    <Card className={`${wide ? 'demo-card-wide ' : ''}demo-card`.trim()}>
      <CardHeader className="demo-card-header">
        <CardTitle>{localizedTitle}</CardTitle>
        {activeDemo ? (
          <Tooltip content={codeExpanded ? messages.hideCode : messages.viewCode} placement="left">
            <Button
              iconOnly
              size="sm"
              variant="ghost"
              aria-label={codeExpanded ? messages.hideCode : messages.viewCode}
              aria-controls={codePanelId}
              aria-expanded={codeExpanded}
              icon={<Code2 size={16} />}
              onClick={() => activeDemo.onToggleCode(title)}
            />
          </Tooltip>
        ) : null}
      </CardHeader>
      <CardContent className={`demo-preview-surface${flush ? ' demo-preview-surface-flush' : ''}`}>
        {children}
      </CardContent>
      {activeDemo ? (
        <div
          id={codePanelId}
          className="demo-code-collapse"
          data-expanded={codeExpanded || undefined}
          data-lumen-motion
          aria-hidden={!codeExpanded}
        >
          <div className="demo-code-collapse-inner">
            <div className="demo-code-panel">
              <div className="demo-code-header">
                <span><Code2 aria-hidden="true" size={14} /> TSX</span>
                <Tooltip content={copied ? messages.copied : messages.copyCode} placement="left">
                  <Button
                    iconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={copied ? messages.codeCopied : messages.copyCode}
                    icon={copied ? <Check size={16} /> : <Copy size={16} />}
                    tabIndex={codeExpanded ? undefined : -1}
                    onClick={() => activeDemo.onCopyCode(title, code)}
                  />
                </Tooltip>
              </div>
              <SyntaxCode code={localizedCode} interactive={codeExpanded} />
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function GalleryTreeNav({
  categories,
  activeCategoryId,
  activeDemoId,
  expandedCategoryIds,
  collapsed = false,
  ariaLabel,
  getDemoLabel,
  onToggleCategory,
  onSelectDemo,
}: {
  categories: GalleryCategory[];
  activeCategoryId: string;
  activeDemoId: string;
  expandedCategoryIds: string[];
  collapsed?: boolean;
  ariaLabel: string;
  getDemoLabel: (title: string) => string;
  onToggleCategory: (categoryId: string) => void;
  onSelectDemo: (categoryId: string, demoId: string) => void;
}) {
  return (
    <nav className="gallery-tree-nav" aria-label={ariaLabel}>
      {categories.map((category) => {
        const Icon = category.icon;
        const expanded = expandedCategoryIds.includes(category.id);
        const categoryButton = (
          <button
            type="button"
            className="gallery-tree-category"
            data-active={category.id === activeCategoryId || undefined}
            aria-expanded={collapsed ? undefined : expanded}
            aria-controls={collapsed ? undefined : `category-${category.id}`}
            aria-label={collapsed ? category.title : undefined}
            onClick={() => {
              if (collapsed) {
                onSelectDemo(category.id, category.demos[0]!.id);
              } else {
                onToggleCategory(category.id);
              }
            }}
          >
            <Icon aria-hidden="true" size={19} />
            {collapsed ? null : (
              <>
                <span>{category.title}</span>
                <ChevronDown className="gallery-tree-chevron" aria-hidden="true" size={16} />
              </>
            )}
          </button>
        );

        return (
          <div key={category.id} className="gallery-tree-group" data-expanded={expanded || undefined}>
            {collapsed ? (
              <Tooltip content={category.title} placement="right">{categoryButton}</Tooltip>
            ) : categoryButton}
            {!collapsed ? (
              <div
                id={`category-${category.id}`}
                className="gallery-tree-children"
                aria-hidden={!expanded}
              >
                {category.demos.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="gallery-tree-item"
                    data-active={item.id === activeDemoId || undefined}
                    aria-current={item.id === activeDemoId ? 'page' : undefined}
                    tabIndex={expanded ? undefined : -1}
                    onClick={() => onSelectDemo(category.id, item.id)}
                  >
                    {getDemoLabel(item.title)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function GalleryBrand({ className = '', subtitle }: { className?: string; subtitle: string }) {
  return (
    <div className={`brand ${className}`.trim()}>
      <img
        className="brand-mark"
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt=""
        aria-hidden="true"
      />
      <div>
        <strong>Lumen Design</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [locale, setLocale] = useState(getInitialLocale);
  useEffect(() => {
    document.documentElement.lang = locale.locale;
    try {
      window.localStorage.setItem(localeStorageKey, locale.locale);
    } catch {
      // Storage can be unavailable in restricted browsing contexts.
    }
  }, [locale]);

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileNavigationScrollTopRef = useRef(0);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initialColorScheme);
  const [accent, setAccent] = useState<Accent>(initialAccent);
  const [activeSection, setActiveSection] = useState(initialGalleryRoute.categoryId);
  const [activeDemoId, setActiveDemoId] = useState(initialGalleryRoute.demoId);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([initialGalleryRoute.categoryId]);
  const [expandedCodeTitle, setExpandedCodeTitle] = useState<string>();
  const [copiedCodeTitle, setCopiedCodeTitle] = useState<string>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMoreView, setMobileMoreView] = useState<'root' | 'language' | 'theme'>('root');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [meetingName, setMeetingName] = useState('项目周会');
  const [textareaText, setTextareaText] = useState('记录评审结论和后续动作。');
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [priorityChipSelected, setPriorityChipSelected] = useState(false);
  const [fabExtended, setFabExtended] = useState(false);
  const [temporaryChipVisible, setTemporaryChipVisible] = useState(true);
  const [sliderValue, setSliderValue] = useState(62);
  const [ratingValue, setRatingValue] = useState(3.5);
  const [radioValue, setRadioValue] = useState('pad');
  const [segment, setSegment] = useState<'all' | 'active' | 'archived'>('all');
  const [tab, setTab] = useState<'overview' | 'usage' | 'tokens'>('overview');
  const [bottomNavigationValue, setBottomNavigationValue] = useState('home');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepsDirection, setStepsDirection] = useState<StepsDirection>('horizontal');
  const [basicSelectValue, setBasicSelectValue] = useState<string | null>(null);
  const [selectValue, setSelectValue] = useState<string | null>('review');
  const [multiSelectValue, setMultiSelectValue] = useState<Array<string | number>>(['review', 'release']);
  const [cascaderValue, setCascaderValue] = useState<string[]>(['east', 'shanghai', 'pudong']);
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
  const [pullRefreshCount, setPullRefreshCount] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [compactFiles, setCompactFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [modalSelectValue, setModalSelectValue] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const language = locale.locale === enUS.locale ? 'en-US' : 'zh-CN';
  const messages = playgroundMessages[language];
  const localizedCategories = useMemo(
    () => galleryCategories.map((category) => ({
      ...category,
      ...messages.categories[category.id as keyof typeof messages.categories],
    })),
    [messages],
  );
  const demoLabels = useMemo<Record<string, string>>(
    () => Object.fromEntries(allDemos.map(({ title }) => [
      title,
      language === 'zh-CN' && zhDemoNames[title]
        ? `${zhDemoNames[title]}（${title}）`
        : title,
    ])),
    [language],
  );

  const normalizedSearch = gallerySearch.trim().toLowerCase();
  const activeCategory = localizedCategories.find((category) => category.id === activeSection)
    ?? localizedCategories[0]!;
  const activeDemo = activeCategory.demos.find((item) => item.id === activeDemoId)
    ?? activeCategory.demos[0]!;
  const filteredCategories = useMemo(
    () => localizedCategories.filter((category) =>
      `${category.title} ${category.description} ${category.keywords} ${category.demos.map((item) => demoLabels[item.title]).join(' ')}`
        .toLowerCase()
        .includes(normalizedSearch),
    ),
    [demoLabels, localizedCategories, normalizedSearch],
  );
  const activeSections = useMemo(() => {
    const sourceSection = renderSections.find((section) => section.id === activeDemo.sourceSection);
    return sourceSection
      ? [{
          ...sourceSection,
          title: demoLabels[activeDemo.title] ?? activeDemo.title,
          description: language === 'zh-CN'
            ? (componentGuides[activeDemo.id]?.summary ?? `${activeCategory.title} · ${activeCategory.description}`)
            : (enGuideSummaries[activeDemo.id] ?? `${activeCategory.title} · ${activeCategory.description}`),
        }]
      : [];
  }, [activeCategory.description, activeCategory.title, activeDemo, demoLabels, language]);

  const navigateToCategory = (categoryId: string) => {
    const category = galleryCategories.find((item) => item.id === categoryId);
    if (!category) return;
    const nextDemo = category.demos[0]!;
    setActiveSection(category.id);
    setActiveDemoId(nextDemo.id);
    setExpandedCategoryIds((current) => current.includes(category.id) ? current : [...current, category.id]);
    window.history.replaceState(null, '', `#${category.id}/${nextDemo.id}`);
  };

  const navigateToDemo = (categoryId: string, demoId: string) => {
    const category = galleryCategories.find((item) => item.id === categoryId);
    if (!category) return;
    const selectedDemo = category.demos.find((item) => item.id === demoId);
    if (!selectedDemo) return;
    setActiveSection(category.id);
    setActiveDemoId(selectedDemo.id);
    setMobileSearchOpen(false);
    setExpandedCategoryIds((current) => current.includes(category.id) ? current : [...current, category.id]);
    window.history.replaceState(null, '', `#${category.id}/${selectedDemo.id}`);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryIds((current) => current.includes(categoryId)
      ? current.filter((item) => item !== categoryId)
      : [...current, categoryId]);
  };

  const copyActiveDemoCode = async (title: string, code: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setCopiedCodeTitle(title);
    window.setTimeout(() => setCopiedCodeTitle(undefined), 1600);
  };

  useEffect(() => {
    const syncSectionFromHash = () => {
      const route = getRouteFromHash();
      setActiveSection(route.categoryId);
      setActiveDemoId(route.demoId);
    };
    window.addEventListener('hashchange', syncSectionFromHash);
    return () => window.removeEventListener('hashchange', syncSectionFromHash);
  }, []);

  useLayoutEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0 });
    setExpandedCodeTitle(undefined);
  }, [activeDemoId, activeSection]);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

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
    <LumenProvider locale={locale}>
    <PlaygroundMessagesContext.Provider value={messages}>
    <div
      data-lumen-theme={theme}
      data-color-scheme={colorScheme}
      data-accent={theme === 'clarity' ? accent : undefined}
      data-density="default"
      className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
    >
      <aside className="sidebar">
        <GalleryBrand subtitle={messages.brandSubtitle} />
        <Scrollbar className="sidebar-navigation" size="sm" aria-label={messages.navigationLabel}>
          <GalleryTreeNav
            categories={filteredCategories}
            ariaLabel={messages.navigationLabel}
            getDemoLabel={(title) => demoLabels[title] ?? title}
            activeCategoryId={activeSection}
            activeDemoId={activeDemo.id}
            expandedCategoryIds={expandedCategoryIds}
            collapsed={sidebarCollapsed}
            onToggleCategory={toggleCategory}
            onSelectDemo={navigateToDemo}
          />
        </Scrollbar>
      </aside>

      <Drawer
        open={mobileNavOpen}
        placement="left"
        closeOnSwipe
        drawerId="mobile-navigation"
        aria-label={messages.navigationLabel}
        panelClassName="mobile-nav-panel"
        onRequestClose={() => setMobileNavOpen(false)}
      >
        <div className="mobile-nav-header">
          <GalleryBrand className="mobile-nav-brand" subtitle={messages.brandSubtitle} />
          <Button
            iconOnly
            variant="ghost"
            aria-label={messages.closeNavigation}
            icon={<X size={18} />}
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
        <Scrollbar
          ref={(element) => {
            if (element) element.scrollTop = mobileNavigationScrollTopRef.current;
          }}
          className="mobile-navigation-content"
          size="sm"
          aria-label={messages.mobileNavigationLabel}
          onScroll={(event) => {
            mobileNavigationScrollTopRef.current = event.currentTarget.scrollTop;
          }}
        >
          <GalleryTreeNav
            categories={filteredCategories}
            ariaLabel={messages.navigationLabel}
            getDemoLabel={(title) => demoLabels[title] ?? title}
            activeCategoryId={activeSection}
            activeDemoId={activeDemo.id}
            expandedCategoryIds={expandedCategoryIds}
            onToggleCategory={toggleCategory}
            onSelectDemo={(categoryId, demoId) => {
              navigateToDemo(categoryId, demoId);
              setMobileNavOpen(false);
            }}
          />
        </Scrollbar>
      </Drawer>

      <main className="main">
        <AppHeader
          className="topbar"
          title="Lumen UI Gallery"
          description={messages.appDescription}
          navigation={(
            <>
            <Button
              iconOnly
              variant="ghost"
              className="mobile-menu-button"
              aria-label={messages.openNavigation}
              icon={<Menu size={18} />}
              onClick={() => setMobileNavOpen(true)}
            />
            <Tooltip content={sidebarCollapsed ? messages.expandSidebar : messages.collapseSidebar} placement="bottom">
              <Button
                iconOnly
                variant="ghost"
                className="sidebar-toggle-button"
                aria-label={sidebarCollapsed ? messages.expandSidebar : messages.collapseSidebar}
                aria-expanded={!sidebarCollapsed}
                icon={sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              />
            </Tooltip>
            </>
          )}
          search={(
            <Input
              id="gallery-search"
              className="topbar-search"
              size="md"
              value={gallerySearch}
              onChange={(event) => setGallerySearch(event.target.value)}
              prefix={<Search size={15} />}
              placeholder={messages.searchPlaceholder}
            />
          )}
          actions={(
            <>
            <DropdownMenu
              className="mobile-search-button"
              menuClassName="w-[min(360px,calc(100vw-16px))] p-3"
              align="right"
              onOpenChange={setMobileSearchOpen}
              trigger={({ open, menuId, toggle }) => (
                <Button
                  iconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={open ? messages.closeSearch : messages.openSearch}
                  aria-controls={menuId}
                  aria-expanded={open}
                  aria-haspopup="dialog"
                  icon={open ? <X size={18} /> : <Search size={18} />}
                  onClick={toggle}
                />
              )}
            >
              <Input
                ref={mobileSearchInputRef}
                id="mobile-gallery-search"
                size="md"
                value={gallerySearch}
                onChange={(event) => setGallerySearch(event.target.value)}
                prefix={<Search size={15} />}
                placeholder={messages.searchPlaceholder}
                aria-label={messages.searchPlaceholder}
              />
            </DropdownMenu>
            <DropdownMenu
              menuMode
              className="mobile-more-button"
              menuClassName="w-[min(320px,calc(100vw-16px))] overflow-hidden p-0"
              align="right"
              onOpenChange={(open) => {
                if (!open) setMobileMoreView('root');
              }}
              trigger={({ open, menuId, toggle }) => (
                <Button
                  iconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={messages.moreActions}
                  aria-controls={menuId}
                  aria-expanded={open}
                  aria-haspopup="dialog"
                  icon={<MoreHorizontal size={19} />}
                  onClick={toggle}
                />
              )}
            >
              {({ close }) => (
                <div className="mobile-more-content">
                  {mobileMoreView !== 'root' ? (
                    <div className="flex min-h-12 items-center gap-2 border-b border-[var(--lumen-color-border)] px-2 py-1.5 text-[14px] font-medium text-[var(--lumen-color-text-strong)]">
                      <button
                        type="button"
                        role="menuitem"
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--lumen-color-surface-muted)]"
                        aria-label={language === 'zh-CN' ? '返回更多操作' : 'Back to more actions'}
                        onClick={() => setMobileMoreView('root')}
                      >
                        <ArrowLeft size={17} />
                      </button>
                      <span>
                      {mobileMoreView === 'language'
                        ? (language === 'zh-CN' ? '语言' : 'Language')
                        : (language === 'zh-CN' ? '主题' : 'Theme')}
                      </span>
                    </div>
                  ) : null}
                  {mobileMoreView === 'language' ? (
                    <div className="p-2">
                      {([
                        [zhCN, '简体中文'],
                        [enUS, 'English'],
                      ] as const).map(([option, label]) => (
                        <button
                          key={option.locale}
                          type="button"
                          role="menuitemradio"
                          aria-checked={locale === option}
                          className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] hover:bg-[var(--lumen-color-surface-muted)]"
                          onClick={() => {
                            setLocale(option);
                            close();
                          }}
                        >
                          <span className="flex-1">{label}</span>
                          {locale === option ? <Check size={16} /> : null}
                        </button>
                      ))}
                    </div>
                  ) : mobileMoreView === 'theme' ? (
                    <div className="p-2">
                      {([
                        ['clarity', 'blue', 'Clarity Blue'],
                        ['clarity', 'purple', 'Clarity Purple'],
                        ['paper', null, 'Paper'],
                        ['prism', null, 'Prism'],
                      ] as const).map(([themeValue, accentValue, label]) => {
                        const selected = theme === themeValue
                          && (themeValue !== 'clarity' || accent === accentValue);
                        return (
                          <button
                            key={`${themeValue}-${accentValue ?? 'default'}`}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] hover:bg-[var(--lumen-color-surface-muted)]"
                            onClick={() => {
                              setTheme(themeValue);
                              if (accentValue) setAccent(accentValue);
                              close();
                            }}
                          >
                            <span className="flex-1">{label}</span>
                            {selected ? <Check size={16} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      aria-haspopup="menu"
                      className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] text-[var(--lumen-color-text)] hover:bg-[var(--lumen-color-surface-muted)]"
                      onClick={() => setMobileMoreView('language')}
                    >
                      <Languages size={17} />
                      <span className="flex-1">{language === 'zh-CN' ? '语言' : 'Language'}</span>
                      <span className="text-[12px] text-[var(--lumen-color-text-muted)]">
                        {locale === zhCN ? '简体中文' : 'English'}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      aria-haspopup="menu"
                      className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] text-[var(--lumen-color-text)] hover:bg-[var(--lumen-color-surface-muted)]"
                      onClick={() => setMobileMoreView('theme')}
                    >
                      <Palette size={17} />
                      <span className="flex-1">{language === 'zh-CN' ? '主题' : 'Theme'}</span>
                      <span className="text-[12px] text-[var(--lumen-color-text-muted)]">
                        {theme === 'clarity' ? `Clarity ${accent === 'blue' ? 'Blue' : 'Purple'}` : theme === 'paper' ? 'Paper' : 'Prism'}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] text-[var(--lumen-color-text)] hover:bg-[var(--lumen-color-surface-muted)]"
                      onClick={() => setColorScheme((scheme) => scheme === 'dark' ? 'light' : 'dark')}
                    >
                      {colorScheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                      <span className="flex-1">
                        {colorScheme === 'dark'
                          ? (language === 'zh-CN' ? '切换浅色模式' : 'Use light mode')
                          : (language === 'zh-CN' ? '切换深色模式' : 'Use dark mode')}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] text-[var(--lumen-color-text)] hover:bg-[var(--lumen-color-surface-muted)]"
                      onClick={() => {
                        close();
                        Toast.info(language === 'zh-CN' ? '2 条未读通知' : '2 unread notifications');
                      }}
                    >
                      <Bell size={17} />
                      <span className="flex-1">{language === 'zh-CN' ? '通知' : 'Notifications'}</span>
                      <Badge size="sm" variant="danger">2</Badge>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] text-[var(--lumen-color-text)] hover:bg-[var(--lumen-color-surface-muted)]"
                      onClick={close}
                    >
                      <UserRound size={17} />
                      <span>{language === 'zh-CN' ? '账户' : 'Account'}</span>
                    </button>
                  </div>
                  )}
                </div>
              )}
            </DropdownMenu>
            <div className="desktop-header-actions">
            <DropdownMenu
              menuMode
              menuClassName="locale-menu"
              trigger={({ open, menuId, toggle }) => (
                <Button
                  iconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={locale === zhCN ? '选择语言' : 'Select language'}
                  aria-controls={menuId}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  icon={<Languages size={18} />}
                  onClick={toggle}
                />
              )}
            >
              {({ close }) => (
                <div className="locale-options">
                  {([
                    [zhCN, '简体中文'],
                    [enUS, 'English'],
                  ] as const).map(([option, label]) => (
                    <button
                      key={option.locale}
                      type="button"
                      role="menuitemradio"
                      aria-checked={locale === option}
                      className="locale-option"
                      onClick={() => {
                        setLocale(option);
                        close();
                      }}
                    >
                      <span>{label}</span>
                      {locale === option ? <Check aria-hidden="true" size={15} /> : null}
                    </button>
                  ))}
                </div>
              )}
            </DropdownMenu>
            <DropdownMenu
              menuMode
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
                    <span className="text-[15px] font-medium text-[var(--lumen-color-text-strong)]">通知</span>
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
                          <span className="block truncate text-[14px] font-normal leading-5 text-[var(--lumen-color-text)]">{title}</span>
                          <span className="mt-1 block text-[12px] leading-5 text-[var(--lumen-color-text-placeholder)]">{time}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[var(--lumen-color-surface-muted)] p-2">
                    <button
                      type="button"
                      className="w-full rounded-[6px] px-3 py-2 text-center text-[13px] font-normal text-[var(--lumen-color-primary)] hover:bg-[var(--lumen-color-surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20"
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
            </>
          )}
        />

        <PullToRefresh
          ref={mainScrollRef}
          className="main-scrollbar lumen-scrollbar"
          data-orientation="vertical"
          data-size="sm"
          disabled={activeSection !== 'feedback' || activeDemo.id !== 'pull-to-refresh'}
          onRefresh={() => new Promise<void>((resolve) => {
            window.setTimeout(() => {
              Toast.success(language === 'zh-CN' ? '页面内容已刷新' : 'Page content refreshed');
              resolve();
            }, 800);
          })}
        >
          <div className="main-content">
            <ActiveDemoContext.Provider value={{
              demo: activeDemo,
              expandedCodeTitle,
              copiedCodeTitle,
              onToggleCode: (title) => setExpandedCodeTitle((current) => current === title ? undefined : title),
                onCopyCode: (title, code) => void copyActiveDemoCode(
                  title,
                  language === 'en-US' ? translateDemoText(code) : code,
                ),
            }}>
              <div className="gallery-workspace">
                <div className="gallery-preview">
                  {activeSections.map((section) => {
          if (section.id === 'typography') {
            return (
              <GallerySection key={section.id} section={section}>
                <DemoCard title="Headings">
                  <div className="stack">
                    <Typography variant="h1">H1 运营总览</Typography>
                    <Typography variant="h2">H2 事件处置</Typography>
                    <Typography variant="h3">H3 实时监测</Typography>
                    <Typography variant="h4">H4 设备状态</Typography>
                    <Typography variant="h5">H5 基础配置</Typography>
                    <Typography variant="h6">H6 详细信息</Typography>
                  </div>
                </DemoCard>
                <DemoCard title="Body">
                  <div className="stack">
                    <Typography>正文用于承载主要说明和数据内容。</Typography>
                    <Typography variant="body-sm" tone="secondary">
                      小号正文用于紧凑列表和次要信息。
                    </Typography>
                    <Typography variant="caption" tone="muted">
                      辅助文字用于时间、状态补充和简短提示。
                    </Typography>
                  </div>
                </DemoCard>
                <DemoCard title="Locale" wide>
                    <div className="max-w-[640px] space-y-4">
                      <Select options={[]} value={null} onChange={() => undefined} />
                      <Pagination currentPage={2} totalPages={8} totalItems={72} onPageChange={() => undefined} />
                    </div>
                </DemoCard>
              </GallerySection>
            );
          }
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
                <DemoCard title="Icon only" wide>
                  <div className="fab-example-row">
                    <Fab position="static" size="sm" icon={<Plus size={18} />} aria-label="新建任务" />
                    <Fab position="static" size="md" variant="secondary" icon={<Search size={18} />} aria-label="搜索" />
                    <Fab position="static" size="lg" variant="outline" icon={<Settings size={20} />} aria-label="设置" />
                  </div>
                </DemoCard>
                <DemoCard title="Extended" wide>
                  <div className="fab-example-row">
                    <Fab position="static" icon={<Plus size={18} />} label="新建任务" />
                    <Fab position="static" variant="secondary" icon={<Filter size={18} />} label="筛选条件" />
                  </div>
                </DemoCard>
                <DemoCard title="Expandable" wide>
                  <div className="fab-example-row">
                    <Switch checked={fabExtended} onChange={setFabExtended} label="显示文字" />
                    <Fab
                      position="static"
                      icon={<Plus size={18} />}
                      label="新建任务"
                      extended={fabExtended}
                    />
                  </div>
                </DemoCard>
                <DemoCard title="Badge">
                  <div className="button-row">
                    <Badge variant="info">Info</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                    <Badge variant="outline" shape="square">Outline</Badge>
                  </div>
                </DemoCard>
                <DemoCard title="Avatar">
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
                    <FormField label="访问密码">
                      <Input
                        type="password"
                        passwordToggle
                        autoComplete="current-password"
                        defaultValue="lumen-demo"
                      />
                    </FormField>
                  </div>
                </DemoCard>
                <DemoCard title="NumberInput" wide>
                  <div className="max-w-[420px]">
                    <FormField label="处置时限">
                      <NumberInput
                        aria-label="处置时限"
                        defaultValue={30}
                        min={5}
                        max={120}
                        step={5}
                        suffix="分钟"
                      />
                    </FormField>
                  </div>
                </DemoCard>
                <DemoCard title="Textarea" wide>
                  <div className="max-w-[640px]">
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
                <DemoCard title="Checkbox">
                  <div className="flex flex-wrap items-center gap-5">
                    <Checkbox size="sm" checked={checked} onChange={setChecked} label="Small" />
                    <Checkbox size="md" checked={checked} onChange={setChecked} label="Medium" />
                    <Checkbox size="lg" checked={checked} onChange={setChecked} label="Large" />
                  </div>
                </DemoCard>
                <DemoCard title="Radio">
                  <div className="stack">
                    <div className="flex flex-wrap items-center gap-5">
                      <Radio size="sm" checked label="Small" />
                      <Radio size="md" checked label="Medium" />
                      <Radio size="lg" checked label="Large" />
                    </div>
                    <RadioGroup
                      size="md"
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
                <DemoCard title="Switch">
                  <div className="flex flex-wrap items-center gap-5">
                    <Switch size="sm" checked={enabled} onChange={setEnabled} label="Small" />
                    <Switch size="md" checked={enabled} onChange={setEnabled} label="Medium" />
                    <Switch size="lg" checked={enabled} onChange={setEnabled} label="Large" />
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
                <DemoCard title="Rating" wide>
                  <div className="max-w-[320px]">
                    <FormField label="服务评分">
                      <Rating
                        aria-label="服务评分"
                        value={ratingValue}
                        onChange={setRatingValue}
                        allowHalf
                      />
                    </FormField>
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
                  </div>
                </DemoCard>
                <DemoCard title="TreeSelect" wide>
                  <div className="form-grid">
                    <TreeSelect
                      nodes={treeNodes}
                      value={treeValue}
                      onChange={(value) => setTreeValue(value)}
                      searchable
                      getValue={(node) => node.id}
                      getLabel={(node) => node.label}
                      isNodeSelectable={isTreeNodeSelectable}
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
                      isNodeSelectable={isTreeNodeSelectable}
                      placeholder="选择多个组织"
                    />
                  </div>
                </DemoCard>
                <DemoCard title="Cascader" wide>
                  <div className="max-w-[420px]">
                    <FormField label="所属区域">
                      <Cascader
                        options={cascaderOptions}
                        value={cascaderValue}
                        onChange={setCascaderValue}
                        searchable
                        aria-label="选择所属区域"
                      />
                    </FormField>
                  </div>
                </DemoCard>
                <DemoCard title="DatePicker" wide>
                  <div className="form-grid">
                    <DatePicker value={dateValue} onChange={setDateValue} />
                    <DatePicker value={monthValue} onChange={setMonthValue} mode="year-month" />
                  </div>
                </DemoCard>
                <DemoCard title="TimePicker" wide>
                  <TimePicker value={timeValue} onChange={setTimeValue} minuteStep={5} />
                </DemoCard>
                <DemoCard title="DateTimePicker" wide>
                  <div className="max-w-[420px]">
                    <DateTimePicker label="开始时间" value={dateTimeValue} onChange={setDateTimeValue} minuteStep={5} />
                  </div>
                </DemoCard>
                <DemoCard title="Calendar" wide>
                  <div className="max-w-[320px]">
                    <Calendar value={dateValue} onChange={setDateValue} />
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
                <DemoCard title="Breadcrumb" wide>
                  <Breadcrumb
                    items={[
                      { label: '运营中心', href: '#navigation' },
                      { label: '事件管理', href: '#navigation' },
                      { label: '事件详情' },
                    ]}
                  />
                </DemoCard>
                <DemoCard title="AppBar" wide>
                  <div className="relative mx-auto h-56 w-full max-w-[390px] overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)]">
                    <AppBar
                      position="absolute"
                      title="订单详情"
                      leading={(
                        <Button
                          iconOnly
                          variant="ghost"
                          aria-label="返回"
                          icon={<ArrowLeft size={19} />}
                        />
                      )}
                      actions={(
                        <Button
                          iconOnly
                          variant="ghost"
                          aria-label="更多操作"
                          icon={<MoreHorizontal size={19} />}
                        />
                      )}
                    />
                    <div className="px-5 pt-20">
                      <Typography variant="h3">#LM-20260904</Typography>
                      <Typography variant="caption" color="muted">
                        等待审核
                      </Typography>
                    </div>
                  </div>
                </DemoCard>
                <DemoCard title="Toolbar" wide>
                  <Toolbar
                    ariaLabel="列表操作"
                    className="rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]"
                  >
                    <Button size="sm" variant="ghost" icon={<Search size={15} />}>
                      搜索
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Filter size={15} />}>
                      筛选
                    </Button>
                    <div className="flex-1" />
                    <Button size="sm" icon={<Plus size={15} />}>
                      新建
                    </Button>
                  </Toolbar>
                </DemoCard>
                <DemoCard title="BottomNavigation" wide>
                  <div className="relative mx-auto h-[320px] w-full max-w-[390px] overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)]">
                    <div className="flex h-full flex-col items-center justify-center px-6 pb-16 text-center">
                      <Typography variant="h3">{bottomNavigationValue}</Typography>
                      <Typography variant="caption" color="muted">
                        当前底部导航目标
                      </Typography>
                    </div>
                    <BottomNavigation
                      position="absolute"
                      value={bottomNavigationValue}
                      onChange={setBottomNavigationValue}
                      items={[
                        { value: 'home', label: '首页', icon: Star },
                        { value: 'schedule', label: '日程', icon: CalendarDays },
                        {
                          value: 'messages',
                          label: '消息',
                          icon: Bell,
                          badge: 3,
                          badgeLabel: '3 条未读消息',
                        },
                        { value: 'profile', label: '我的', icon: UserRound },
                      ]}
                    />
                  </div>
                </DemoCard>
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
                <DemoCard title="DropdownMenu">
                  <div className="stack">
                    <DropdownMenu
                      menuMode
                      trigger={({ toggle, open, menuId }) => (
                        <Button
                          type="button"
                          variant="secondary"
                          icon={<MoreHorizontal size={15} />}
                          aria-haspopup="menu"
                          aria-expanded={open}
                          aria-controls={menuId}
                          onClick={toggle}
                        >
                          {open ? '收起菜单' : '打开菜单'}
                        </Button>
                      )}
                    >
                      {({ close }) => (
                        <div className="menu-list">
                          <button type="button" role="menuitem" onClick={close}>
                            <Copy size={15} />
                            复制组件名称
                          </button>
                          <button type="button" role="menuitem" onClick={close}>
                            <Code2 size={15} />
                            查看源码路径
                          </button>
                          <button type="button" role="menuitem" onClick={close}>
                            <Star size={15} />
                            标记为常用
                          </button>
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
                        size="md"
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
                <DemoCard title="DataTable · Sticky Header" wide>
                  <DataTable
                    caption="固定表头公路安全事件表格"
                    stickyHeader
                    maxHeight={280}
                    columns={safetyEventColumns}
                    data={safetyEvents}
                    getRowKey={(event) => event.id}
                  />
                </DemoCard>
                <DemoCard title="DataTable · Embedded" wide>
                  <div className="overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)]">
                    <div className="border-b border-[var(--lumen-color-border)] px-4 py-3">
                      <CardTitle>公路安全事件</CardTitle>
                      <CardDescription>
                        按更新时间排序 · {safetyEvents.length} 条
                      </CardDescription>
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
                  </div>
                  <p className="mt-3 text-[12px] text-[var(--lumen-color-text-muted)]">
                    已选择 {selectedEventKeys.length} 条事件
                  </p>
                </DemoCard>
                <DemoCard title="Pagination" wide>
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
                <DemoCard title="Collapse" wide>
                    <Collapse defaultValue={['road', 'device']}>
                      <CollapseItem value="road" title="路段信息" extra="G65 K18+900">
                        南向双车道，当前平均车速 72 km/h。
                      </CollapseItem>
                      <CollapseItem value="device" title="监测设备" extra="12 台在线">
                        摄像机、雷达和气象监测设备运行正常。
                      </CollapseItem>
                    </Collapse>
                </DemoCard>
                <DemoCard title="Accordion" wide>
                    <Accordion defaultValue="event">
                      <CollapseItem value="event" title="事件详情">
                        异常停车事件已持续 6 分钟，等待现场确认。
                      </CollapseItem>
                      <CollapseItem value="history" title="处置记录">
                        10:26 已通知附近巡检人员前往现场。
                      </CollapseItem>
                    </Accordion>
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
                <DemoCard title="CommandPalette" wide>
                    <Button variant="secondary" icon={<Search size={15} />} onClick={() => setCommandPaletteOpen(true)}>
                      打开 CommandPalette
                    </Button>
                </DemoCard>
                <DemoCard title="Modal" wide>
                    <Button onClick={() => setModalOpen(true)}>打开 Modal</Button>
                </DemoCard>
                <DemoCard title="Drawer" wide>
                    <Button variant="secondary" onClick={() => setDrawerOpen(true)}>打开 Drawer</Button>
                </DemoCard>
                <DemoCard title="ConfirmDialog" wide>
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>打开 Confirm</Button>
                </DemoCard>
                <DemoCard title="Toast" wide>
                    <Button variant="outline" icon={<Bell size={15} />} onClick={() => Toast.success('组件状态已保存')}>
                      Toast
                    </Button>
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
              <DemoCard title="PullToRefresh" wide flush>
                <PullToRefresh
                  aria-label="移动端事件列表"
                  className="h-72 w-full"
                  onRefresh={() => new Promise<void>((resolve) => {
                    window.setTimeout(() => {
                      setPullRefreshCount((count) => count + 1);
                      resolve();
                    }, 800);
                  })}
                >
                  <div className="mx-5 pad:mx-6">
                    <div className="border-b border-[var(--lumen-color-surface-muted)] px-4 py-3 text-[12px] text-[var(--lumen-color-text-muted)]">
                      移动端向下拖动 · 已刷新 {pullRefreshCount} 次
                    </div>
                    <List aria-label="最新事件">
                      {['主线异常停车', '边坡监测预警', '巡检任务已完成', '机电设备状态正常', '隧道照明巡检'].map((title, index) => (
                        <ListItem
                          key={`${title}-${pullRefreshCount}`}
                          title={title}
                          description={`第 ${index + 1} 条更新记录`}
                          meta={`${index + 1 + pullRefreshCount} 分钟前`}
                        />
                      ))}
                    </List>
                  </div>
                </PullToRefresh>
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
              <DemoCard title="SegmentedControl">
                  <SegmentedControl
                    size="md"
                    value={segment}
                    onChange={setSegment}
                    fullWidth
                    options={[
                      { label: '全部', value: 'all' },
                      { label: '启用', value: 'active' },
                      { label: '归档', value: 'archived' },
                    ]}
                  />
              </DemoCard>
              <DemoCard title="Skeleton">
                <div className="stack">
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
                </div>
              </div>
            </ActiveDemoContext.Provider>
          </div>
        </PullToRefresh>
      </main>

      <Modal
        open={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        title="Modal 预览"
        description="用于确认、编辑和短流程任务。当前画廊直接使用组件库 Modal。"
        panelClassName="modal-panel"
      >
        <div className="mt-5">
          <FormField label="负责人">
            <Select
              options={basicSelectOptions}
              value={modalSelectValue}
              onChange={(value) => setModalSelectValue(value as string | null)}
              placeholder="选择负责人"
            />
          </FormField>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setModalOpen(false)}>关闭</Button>
          <Button onClick={() => setModalOpen(false)}>保存</Button>
        </div>
      </Modal>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        enableShortcut
        groups={[
          {
            heading: '组件分类',
            items: galleryCategories.map((category) => ({
              id: category.id,
              label: category.title,
              description: category.description,
              keywords: category.keywords.split(' '),
              icon: <category.icon size={16} />,
              onSelect: () => navigateToCategory(category.id),
            })),
          },
          {
            heading: '组件',
            items: allDemos.map((item) => {
              const category = galleryCategories.find((candidate) => candidate.demos.includes(item))!;
              return {
                id: `component-${item.id}`,
                label: item.title,
                description: category.title,
                keywords: [category.title, item.title],
                onSelect: () => {
                  setActiveSection(category.id);
                  setActiveDemoId(item.id);
                  window.history.replaceState(null, '', `#${category.id}/${item.id}`);
                },
              };
            }),
          },
          {
            heading: '操作',
            items: [
              {
                id: 'toggle-theme',
                label: colorScheme === 'dark' ? '切换到浅色模式' : '切换到深色模式',
                icon: colorScheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
                shortcut: 'T',
                onSelect: () => setColorScheme((scheme) => (scheme === 'dark' ? 'light' : 'dark')),
              },
            ],
          },
        ]}
      />

      <Drawer
        open={drawerOpen}
        closeOnSwipe
        onRequestClose={() => setDrawerOpen(false)}
        aria-label="Drawer 预览"
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
    </PlaygroundMessagesContext.Provider>
    </LumenProvider>
  );
}
