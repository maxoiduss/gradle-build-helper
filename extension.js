const vscode = require("vscode");
const fs = require("fs");
const { promises } = require("timers");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "gradle.build.helper",
    async function () {
      const isMultiProject = vscode.workspace.getConfiguration("gradle.build.helper").get("isMultiProject");

      if (isMultiProject) {
        const selectedDir = await selectDirectory();
        if (selectDirectory !== undefined) {
          await executeGradleCommand(selectedDir);
        }         
      } else {
        await executeGradleCommand();
      }
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * List the top-level project's direct subdirectories in QuickPick
 * @returns {string} Selected directory
 */
async function selectDirectory() {
  if (vscode.workspace.workspaceFolders === undefined) {
    vscode.window.showErrorMessage("[gradle-build-helper] Error. No opened folder!")
    return;
  }
  const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const excludeDirs = vscode.workspace.getConfiguration("gradle.build.helper").get("excludeDirectory", []);

  // Read directory
  const subDirs = fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        !dirent.name.startsWith(".") && // Exclude hidden directories
        !excludeDirs.includes(dirent.name) // Exclude directories to exclude
    )
    .map((dirent) => dirent.name);

  const currentDir = "Current Project in Terminal"
  const options = [currentDir, ...subDirs];

  const selectedDir = await vscode.window.showQuickPick(options, {
    placeHolder: "Select a directory",
    matchOnDescription: true
  });

  return selectedDir === currentDir ? "" : selectedDir;
}

async function executeGradleCommand(directory) {
  const config = vscode.workspace.getConfiguration("gradle.build.helper");
  const gradleTasks = config
    .get("tasks", [])
    .map((task) => `${task}`);

  // [Custom] Add Item
  const customWholeTask = "[Custom]";
  gradleTasks.push(customWholeTask);
  
  // [Custom] Add Gradlew Item
  const customArgTask = "[Gradlew Custom]";
  gradleTasks.push(customArgTask);

  const selectedTask = await vscode.window.showQuickPick(gradleTasks, {
    placeHolder: "Select a Gradle task",
  });

  if (!selectedTask) return;

  const extensioName = "gradle-build-helper";
  let terminal = vscode.window.terminals.find(
    (term) => term.name === extensioName
  );
  if (!terminal) {
    terminal = vscode.window.createTerminal(extensioName);
  }

  let command = ``;

  if (selectedTask === customWholeTask) {
    const customTask = await vscode.window.showInputBox({
      placeHolder: "Enter the custom Gradle task",
      prompt: "Type the Gradle task you want to execute.",
    });

    if (!customTask) return;
    command += `${customTask}`;
  } else if (selectedTask === customArgTask) {
    const customTask = await vscode.window.showInputBox({
      placeHolder: "Enter the custom arg for Gradle task",
      prompt: "Type the arg for Gradle task you want to execute.",
    });

    if (!customTask) return;
    command += `gradlew ${customTask}`;
  } else if (selectedTask.includes("$profile")) {
    let profiles = config.get("profiles", []);

    // Profile Input processing
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
    command = `cd ${directory}\n${command}`;
  }

  const no_arg = "...";
  let args = config.get("extrargs", []);
  args = [no_arg, ...args];

  let selectedExtraArg = await vscode.window.showQuickPick(args, {
    placeHolder: "Select an extra arg.",
  });

  if (selectedExtraArg) {
    if (selectedExtraArg === no_arg) {
      selectedExtraArg = '';
    }
    command += ` ${selectedExtraArg}`;
  }
  terminal.show();
  terminal.sendText(command);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
