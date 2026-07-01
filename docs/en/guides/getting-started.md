# Getting started

## What is Kimi Code CLI

Kimi Code CLI is an AI agent that runs in the terminal, helping you carry out software development tasks and day-to-day terminal operations — reading and modifying code, running shell commands, searching files, fetching web pages, and autonomously planning and adjusting its next steps based on feedback as it works.

It fits scenarios such as:

- **Writing and modifying code**: implementing new features, fixing bugs, completing refactors
- **Understanding a project**: exploring an unfamiliar codebase and answering questions about architecture and implementation
- **Automating tasks**: batch-processing files, running builds and tests, chaining multiple scripts together

The CLI is written in TypeScript, distributed via npm, and runs on Node.js.

## Installation

Two installation options are available: the official install script (recommended, no pre-installed Node.js required) and a global npm install.

::: tip Before you install
Kimi Code CLI is a fully interactive TUI application. For the best visual experience, run it in a terminal with true-color and ligature support, such as [Kitty](https://sw.kovidgoyal.net/kitty/) or [Ghostty](https://ghostty.org/).
:::

### Install script (recommended)

- **macOS / Linux**:

```sh
curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

- **Windows (PowerShell)**:

```powershell
irm https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.ps1 | iex
```

> On Windows, install [Git for Windows](https://gitforwindows.org/) before first launch. Super Kimi Code uses the bundled Git Bash as its shell environment; if Git Bash is installed in a custom location, set `KIMI_SHELL_PATH` to the absolute path of `bash.exe`.

The script checks out this GitHub source repository, builds the CLI, and places the `skimi` executable on your `PATH`. It requires Git and Node.js 24.15.0 or later.

### Source install details

The source installer accepts environment overrides for automation:

```sh
SUPER_KIMI_REF=main SUPER_KIMI_COMMAND=skimi \
  curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

It checks out the repository under `~/.super-kimi-code/source` by default.

## Upgrade and uninstall

After installation, verify that the executable is ready:

```sh
skimi --version
```

**Upgrade**: re-run the install script. It updates the source checkout, reinstalls dependencies, and rebuilds the CLI.

**Uninstall**: delete the `skimi` executable and the source checkout under `~/.super-kimi-code/source`.

## First launch

Move into your project directory and run `skimi` to start the interactive UI:

```sh
cd your-project
skimi
```

To run a single instruction without entering the interactive UI, use `-p`:

```sh
skimi -p "Take a look at this project's directory structure"
```

To resume the previous session, add `-c`:

```sh
skimi -c
```

On first launch you need to configure an API source. In the interactive UI, enter `/login` to begin the login flow:

```
/login
```

`/login` opens a platform selector supporting two options:

- **Kimi Code (OAuth)** — device-code flow; open the link on any device, sign in, and enter the code to authorize
- **Kimi Platform API key** — enter an API key from `platform.kimi.com` or `platform.kimi.ai`

To sign out, enter `/logout` to clear the current credentials.

::: tip Using other AI providers
If you want to connect Anthropic, OpenAI, Google, or other providers, open `/provider` in the TUI or use `kimi provider catalog add` / `kimi provider custom add` from the shell. For teams with multiple accounts or API keys, `kimi provider key add`, `kimi provider oauth add`, and `kimi provider route auto` can create quota-aware fallback routes without exposing secrets. See [Providers and models](../configuration/providers.md) for details.
:::

## Your first conversation

Once logged in, describe a task in natural language. A good starting point is to let Kimi Code CLI familiarize itself with the project:

```
Take a look at this project's directory structure and briefly describe what each directory is for.
```

Kimi Code CLI automatically calls file-reading, search, and other tools to browse the relevant content before responding. Read-only operations are executed automatically by default without requiring confirmation. For operations that modify files or run shell commands, it asks for your confirmation before proceeding.

You can also describe a more concrete task directly:

```
Add a function in src/utils that converts any string to kebab-case, and add a unit test for it.
```

Kimi Code CLI plans the steps, modifies the code, runs the tests, and tells you what it did at each step.

::: tip Not sure what to do? Type `/help`
Type `/help` at any time to open the built-in command and keyboard shortcut panel. Use `↑`/`↓` to browse and `Esc` to close. To exit, type `/exit`, press `Ctrl-C` twice, or press `Ctrl-D` with the input box empty.
:::

## Common commands and keyboard shortcuts

For a first-time user, the following is all you need to know:

**Session commands**

| Command | Description |
| --- | --- |
| `/new` | Start a new session, clearing the current context |
| `/sessions` | Browse session history and choose one to resume |
| `/model` | Switch the current model |
| `/compact` | Manually compress the context to free up tokens |
| `/fork` | Fork the current session, keeping history but continuing independently |

**Most-used keyboard shortcuts**

| Shortcut | Description |
| --- | --- |
| `Esc` | Interrupt streaming output / close a popup |
| `Ctrl-C` | Interrupt output; press twice while idle to exit |
| `Shift-Tab` | Toggle Plan mode |
| `Ctrl-S` | Inject a message mid-stream without waiting for the current response to finish |
| `Ctrl-O` | Collapse / expand tool output |

For the full list, type `/help` or visit [Slash commands reference](../reference/slash-commands.md) and [Keyboard shortcuts](../reference/keyboard.md).

## Where data is stored

Kimi Code CLI stores its local data under `~/.kimi-code/` by default — config files, session records, logs, and the update cache. To move it elsewhere, point to a new path via the `KIMI_CODE_HOME` environment variable. For the full directory layout, see [Data locations](../configuration/data-locations.md) and [Environment variables](../configuration/env-vars.md).

## Next steps

- [Interaction and input](./interaction.md) — input box operations, approval flow, Plan mode, and YOLO mode explained
- [Sessions and context](./sessions.md) — resuming sessions, compressing context, exporting sessions
- [Common use cases](./use-cases.md) — prompt examples for typical tasks
