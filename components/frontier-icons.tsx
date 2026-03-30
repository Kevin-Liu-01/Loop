import type { ComponentProps } from "react";

import {
  Activity,
  ArrowRight,
  Bot,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Clipboard,
  Clock,
  Code,
  CreditCard,
  Download,
  Eye,
  FileCode,
  FilePenLine,
  Globe,
  Hash,
  KeyRound,
  Link2,
  ListTree,
  LogOut,
  MessageSquare,
  PanelLeft,
  PencilLine,
  Play,
  Plus,
  Radar,
  RefreshCw,
  RotateCcw,
  Scan,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Square,
  Tag,
  Terminal,
  TriangleAlert,
  User,
  Wallet,
  Workflow,
  Zap,
  type LucideIcon
} from "lucide-react";

type IconProps = ComponentProps<typeof Radar> & {
  title?: string;
};

function wrapIcon(Component: LucideIcon) {
  return function LoopIcon({ title, strokeWidth = 1.7, ...props }: IconProps) {
    return (
      <Component
        absoluteStrokeWidth
        aria-hidden={title ? undefined : true}
        aria-label={title}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  };
}

export const RadarIcon = wrapIcon(Radar);
export const CubeStackIcon = wrapIcon(Boxes);
export const PulseIcon = wrapIcon(Activity);
export const SearchIcon = wrapIcon(Search);
export const SparkIcon = wrapIcon(Sparkles);
export const WalletIcon = wrapIcon(Wallet);
export const FlowIcon = wrapIcon(Workflow);
export const TimelineIcon = wrapIcon(ListTree);
export const ShieldIcon = wrapIcon(ShieldCheck);
export const ArrowRightIcon = wrapIcon(ArrowRight);
export const DownloadIcon = wrapIcon(Download);
export const LinkIcon = wrapIcon(Link2);
export const PencilIcon = wrapIcon(PencilLine);
export const EditFileIcon = wrapIcon(FilePenLine);
export const RefreshIcon = wrapIcon(RefreshCw);
export const SettingsIcon = wrapIcon(Settings);
export const PlusIcon = wrapIcon(Plus);
export const TerminalIcon = wrapIcon(Terminal);
export const CodeIcon = wrapIcon(Code);
export const FileCodeIcon = wrapIcon(FileCode);
export const PlayIcon = wrapIcon(Play);
export const StopIcon = wrapIcon(Square);
export const SendIcon = wrapIcon(Send);
export const ChevronDownIcon = wrapIcon(ChevronDown);
export const ChevronRightIcon = wrapIcon(ChevronRight);
export const ShareIcon = wrapIcon(Share2);
export const ClockIcon = wrapIcon(Clock);
export const MessageIcon = wrapIcon(MessageSquare);
export const UserIcon = wrapIcon(User);
export const BotIcon = wrapIcon(Bot);
export const CreditCardIcon = wrapIcon(CreditCard);
export const ZapIcon = wrapIcon(Zap);
export const LogOutIcon = wrapIcon(LogOut);
export const PanelLeftIcon = wrapIcon(PanelLeft);
export const KeyIcon = wrapIcon(KeyRound);
export const GlobeIcon = wrapIcon(Globe);
export const ClipboardIcon = wrapIcon(Clipboard);
export const CheckIcon = wrapIcon(Check);
export const ChevronUpIcon = wrapIcon(ChevronUp);
export const ResetIcon = wrapIcon(RotateCcw);
export const TagIcon = wrapIcon(Tag);
export const HashIcon = wrapIcon(Hash);
export const EyeIcon = wrapIcon(Eye);
export const ScanIcon = wrapIcon(Scan);
export const CircleDotIcon = wrapIcon(CircleDot);
export const TriangleAlertIcon = wrapIcon(TriangleAlert);
