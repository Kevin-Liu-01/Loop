import type { Sandbox } from "@vercel/sandbox";
import { tool } from "ai";
import { z } from "zod";

async function getStdout(
  result: Awaited<ReturnType<Sandbox["runCommand"]>>
): Promise<string> {
  try {
    return await result.stdout();
  } catch {
    return "";
  }
}

async function getStderr(
  result: Awaited<ReturnType<Sandbox["runCommand"]>>
): Promise<string> {
  try {
    return await result.stderr();
  } catch {
    return "";
  }
}

function buildExecuteCodeTool(sandbox: Sandbox) {
  return tool({
    description:
      "Write and execute code in the sandbox. Output is captured from stdout (console.log for JS, print for Python). " +
      "Specify packages to auto-install them before execution. Code runs in a fresh invocation each time — persist state via files if needed.",
    execute: async ({ code, language, packages }) => {
      if (packages && packages.length > 0) {
        const installer = language === "python" ? "pip" : "npm";
        const args =
          language === "python"
            ? ["install", ...packages]
            : ["install", "--no-save", ...packages];
        const installResult = await sandbox.runCommand({
          args,
          cmd: installer,
        });
        if (installResult.exitCode !== 0) {
          return {
            exitCode: installResult.exitCode,
            phase: "install",
            stderr: await getStderr(installResult),
            stdout: "",
          };
        }
      }

      const cmd = language === "python" ? "python3" : "node";
      const result = await sandbox.runCommand({ args: ["-e", code], cmd });

      return {
        exitCode: result.exitCode,
        phase: "run",
        stderr: await getStderr(result),
        stdout: await getStdout(result),
      };
    },
    inputSchema: z.object({
      code: z
        .string()
        .describe(
          "The code to execute. Use console.log (JS) or print (Python) to produce output visible in the result."
        ),
      language: z.enum(["javascript", "python"]).describe("Execution runtime"),
      packages: z
        .array(z.string())
        .optional()
        .describe(
          "npm (JS) or pip (Python) packages to install before running, e.g. ['lodash'] or ['requests', 'beautifulsoup4']"
        ),
    }),
  });
}

function buildRunCommandTool(sandbox: Sandbox) {
  return tool({
    description:
      "Run a shell command in the sandbox and return stdout, stderr, and exit code. " +
      "Use for system operations: curl for HTTP requests, ls/cat for file inspection, git for repos, npm/pip for package management.",
    execute: async ({ command, args }) => {
      const result = await sandbox.runCommand({
        args: args ?? [],
        cmd: command,
      });

      return {
        exitCode: result.exitCode,
        stderr: await getStderr(result),
        stdout: await getStdout(result),
      };
    },
    inputSchema: z.object({
      args: z
        .array(z.string())
        .optional()
        .describe(
          "Arguments passed to the command, e.g. ['-s', 'https://api.example.com/data']"
        ),
      command: z
        .string()
        .describe("The executable to run (e.g. 'curl', 'ls', 'git', 'npm')"),
    }),
  });
}

function buildWriteFileTool(sandbox: Sandbox) {
  return tool({
    description:
      "Create or overwrite a file in the sandbox. Parent directories are created automatically. " +
      "Use to scaffold project files, write configs, save generated output, or prepare input for executeCode.",
    execute: async ({ path, content }) => {
      const escaped = content.replaceAll("'", "'\\''");
      const result = await sandbox.runCommand({
        args: [
          "-c",
          `mkdir -p "$(dirname '${path}')" && printf '%s' '${escaped}' > '${path}'`,
        ],
        cmd: "bash",
      });

      return {
        exitCode: result.exitCode,
        path,
        stderr: await getStderr(result),
        success: result.exitCode === 0,
      };
    },
    inputSchema: z.object({
      content: z.string().describe("Complete file content to write"),
      path: z
        .string()
        .describe(
          "Absolute or relative path in the sandbox, e.g. '/app/index.js' or 'output.json'"
        ),
    }),
  });
}

function buildReadFileTool(sandbox: Sandbox) {
  return tool({
    description:
      "Read a file's contents from the sandbox. Use to inspect generated output, verify writes, check configs, or debug file state.",
    execute: async ({ path }) => {
      const result = await sandbox.runCommand({
        args: [path],
        cmd: "cat",
      });

      return {
        content: await getStdout(result),
        exitCode: result.exitCode,
        stderr: await getStderr(result),
      };
    },
    inputSchema: z.object({
      path: z.string().describe("Path to the file to read"),
    }),
  });
}

export function buildSandboxTools(sandbox: Sandbox) {
  return {
    executeCode: buildExecuteCodeTool(sandbox),
    readFile: buildReadFileTool(sandbox),
    runCommand: buildRunCommandTool(sandbox),
    writeFile: buildWriteFileTool(sandbox),
  };
}
