export interface ProcessInfo {
  pid: number;
  name: string;
  cpuPercent: number;
  memPercent: number;
  command: string;
}

export interface MemoryInfo {
  totalMb: number;
  usedMb: number;
  freeMb: number;
}

export interface DiskInfo {
  totalMb: number;
  usedMb: number;
  freeMb: number;
}

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: string;
}

export interface PackageInfo {
  name: string;
  version: string;
}

export interface SandboxInspectResponse {
  sandboxId: string;
  uptimeSeconds: number;
  timeoutMs: number;
  runtimeVersion: string;
  memory: MemoryInfo;
  disk: DiskInfo;
  processes: ProcessInfo[];
  files: FileEntry[];
  packages: PackageInfo[];
}

export interface SandboxInspectRequest {
  sandboxId: string;
  path?: string;
}
