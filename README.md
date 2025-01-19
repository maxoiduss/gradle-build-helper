# Gradle Build Helper Extension

Gradle Build Helper is a Visual Studio Code extension that simplifies running Gradle tasks, especially for multi-project Gradle builds. This extension allows you to select and execute tasks interactively through the Command Palette.

![Gradle Build Helper Screenshot](https://raw.githubusercontent.com/hwantage/gradle-build-helper/refs/heads/main/images/screenshot.png)

---

## Features

- Select a Gradle task to execute from a predefined list.
- Supports multi-project Gradle builds.
- Excludes specific directories from selection.
- Configure available Gradle tasks, profiles, and the build command.
- Fully customizable via the extension settings.

---

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by pressing `Ctrl+Shift+X` (or `Cmd+Shift+X` on macOS).
3. Search for "Gradle Build Helper" and install the extension.

---

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
2. Type and select `Gradle Build Helper`.
3. Select a directory (if multi-project is enabled).
4. Choose a Gradle task to execute.
5. If the selected task includes `$profile`, select one from the available profiles. The selected task will be executed with the profile appended, e.g., `-Pprofile=dev`.

---

## Configuration

This extension provides the following configurable options:

### Multi-Project Support
**Property**: `gradle.build.helper.isMultiProject`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable or disable multi-project support.

---

### Profiles
**Property**: `gradle.build.helper.profiles`

- **Type**: `array`
- **Default**: `["css", "dev"]`
- **Description**: List of available Gradle profiles. If a task includes `$profile`, you will be prompted to select a profile, and the task will be executed with the selected profile, e.g., `-Pprofile=dev`.

---

### Tasks
**Property**: `gradle.build.helper.tasks`

- **Type**: `array`
- **Default**:
  ```json
  [
    "gradlew build",
    "gradlew clean build",
    "gradlew build -t",
    "gradlew clean",
    "gradlew clean build $profile",
    "gradlew appRun"
  ]
  ```
- **Description**: List of available Gradle tasks. Tasks containing `$profile` will require selecting a profile before execution, and the command will be modified to include the profile, e.g., `-Pprofile=dev`.

- Note: If you are using MacOS or Linux, replace gradlew with ./gradlew in the task list. For example:

  ```json
  [
    "./gradlew build",
    "./gradlew clean build",
    ...
  ]
  ```
---

### Excluded Directories
**Property**: `gradle.build.helper.excludeDirectory`

- **Type**: `array`
- **Default**: `[]`
- **Description**: List of directories to exclude from selection (only applicable if multi-project support is enabled).

---

## Example Configuration
Add the following configuration to your VS Code `settings.json` file to customize the extension:

```json
{
  "gradle.build.helper.profiles": ["css", "dev", "prod"],
  "gradle.build.helper.tasks": [
    "gradlew build",
    "gradlew clean build",
    "gradlew clean",
    "gradlew clean build $profile",
    "gradlew test",
    "gradlew deploy"
  ],
  "gradle.build.helper.isMultiProject": true,
  "gradle.build.helper.excludeDirectory": [".git", "node_modules"]
}
```

---

## Contribution
Feel free to submit issues or contribute to the repository. Any feedback or suggestions are welcome!

---

## License
This project is licensed under the MIT License.

