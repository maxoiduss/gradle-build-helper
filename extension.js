const vscode = require("vscode");
const fs = require("fs");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "gradle.build.helper",
    async function () {
      const isMultiProject = vscode.workspace.getConfiguration("gradle.build.helper").get("isMultiProject");

      if (isMultiProject) {
        const selectedDir = await selectDirectory();
        await executeGradleCommand(selectedDir);
      } else {
        await executeGradleCommand();
      }
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * 최상위 프로젝트 직속 하위 디렉토리를 QuickPick에 리스트업
 * @returns {string} 선택한 디렉토리
 */
async function selectDirectory() {
  const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const excludeDirs = vscode.workspace.getConfiguration("gradle.build.helper").get("excludeDirectory", []);

  // 디렉토리 읽기
  const subDirs = fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        !dirent.name.startsWith(".") && // 숨김 디렉토리 제외
        !excludeDirs.includes(dirent.name) // 제외할 디렉토리 제외
    )
    .map((dirent) => dirent.name);

  const options = ["Root Project", ...subDirs];

  const selectedDir = await vscode.window.showQuickPick(options, {
    placeHolder: "Select a directory",
    matchOnDescription: true,
  });

  return selectedDir === "Root Project" ? "" : selectedDir;
}

async function executeGradleCommand(directory) {
  const config = vscode.workspace.getConfiguration("gradle.build.helper");
  const gradleTasks = config
    .get("tasks", [])
    .map((task) => `${task}`);

  // [Custom] 항목 추가
  gradleTasks.push("[Custom]");

  const selectedTask = await vscode.window.showQuickPick(gradleTasks, {
    placeHolder: "Select a Gradle task",
  });

  if (!selectedTask) return;

  let terminal = vscode.window.terminals.find(
    (term) => term.name === "gradle-build-helper"
  );
  if (!terminal) {
    terminal = vscode.window.createTerminal("gradle-build-helper");
  }

  let command = ``;

  if (selectedTask === "[Custom]") {
    const customTask = await vscode.window.showInputBox({
      placeHolder: "Enter the custom Gradle task",
      prompt: "Type the Gradle task you want to execute.",
    });

    if (!customTask) return;
    command += `${customTask}`;
  } else if (selectedTask.includes("$profile")) {
    let profiles = config.get("profiles", []);

    // Profile 입력 처리
    let selectedProfile;
    if (profiles.length > 0) {
      selectedProfile = await vscode.window.showQuickPick(profiles, {
        placeHolder: "Select a profile",
      });
    } else {
      selectedProfile = await vscode.window.showInputBox({
        placeHolder: "Type a profile name",
        prompt: "Please type your profile.",
      });
    }

    if (!selectedProfile) return;

    command += `${selectedTask.replace("$profile", `-Pprofile=${selectedProfile}`)}`;
  } else {
    command += `${selectedTask}`;
  }

  if (directory) {
    command += ` -p ${directory}`;
  }

  terminal.show();
  terminal.sendText(command);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
