# Wintrol

Wintrol is a Windows-based utility that interfaces with XInput devices (controllers) to simulate mouse and keyboard input. It provides a configurable bridge between game controllers and the Windows desktop environment, allowing for smooth cursor control and button mapping.

## Features

*   **XInput integration**: Native support for Xbox-compatible controllers via direct DLL interfacing.
*   **Analog Mouse Emulation**: Implements quadratic acceleration curves on analog sticks for precise cursor positioning.
*   **Configurable Mapping**: Dynamic remapping of controller buttons to mouse clicks (Left, Right, Middle) or keyboard inputs.
*   **Persistent Configuration**: Settings, including sensitivity and mappings, are serialized and persisted locally.
*   **System Tray Integration**: Minimized operation with background processing support.
*   **Hot-Plug Detection**: Automatic handling of device connection and disconnection events.

## Installation

Wintrol is available in two versions: **Installer** (recommended) and **Portable** (Lite).

### Option 1: Installer (Recommended)
Best for most users. Creates shortcuts and an uninstaller.
1.  Download `wintrol Setup.exe`.
2.  Run the installer.
3.  Wintrol will launch automatically.

### Option 2: Portable / Lite (can be download in release 1.0.0)
Best for USB drives or use without administrator rights.
1.  Download `Wintrol Lite.exe`.
2.  Place it anywhere (e.g., `D:\Tools\`).
3.  Double-click to run. No installation required.

> [!NOTE]
> **Windows SmartScreen Warning**: Since this is a free open-source project, it does not have a paid digital signature. 
> If you see a "Windows protected your PC" popup:
> 1. Click **"More Info"**.
> 2. Click **"Run Anyway"**.
> This is a standard check for all new software not from the Microsoft Store.

## Usage

ensure your XInput controller is connected to the PC before or after launching Wintrol. The status indicator in the top-left corner will reflect the device state.

### Default Controls
*   **Left Analog Stick**: Controls mouse cursor movement.
*   **Right Analog Stick**: Controls vertical scrolling.
*   **Buttons (A, B, X, Y, etc.)**: Configurable via the application interface.

### Configuration Interface
The interface provides the following adjustments:
*   **Sensitivity (X/Y)**: Adjusts the speed multiplier for the mouse cursor.
*   **Scroll Speed**: Adjusts the vertical scrolling velocity.
*   **Deadzone**: Sets the threshold for analog stick input to eliminate drift. Higher values require more stick movement to register input.
*   **Mapping**: Select a controller input from the dropdown list to assign a specific mouse or keyboard action.

## Development

### Prerequisites
*   Node.js (LTS version recommended)
*   npm (Node Package Manager)
*   Python (for building native dependencies)
*   Visual Studio Build Tools (C++ workload)

### Build Instructions

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/wintrol.git
    cd wintrol
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run in development mode:
    ```bash
    npm start
    ```

4.  Build for production (generates installer in `dist/`):
    ```bash
    npm run build
    ```

## Architecture

Wintrol is built on the **Electron** framework, utilizing a split-process architecture:
*   **Main Process (`main.js`)**: Handles native API interactions via `koffi` (C-FFI), manages the application lifecycle, and processes XInput polling loops.
*   **Renderer Process (`renderer.js`)**: Manages the user interface and communicates with the main process via efficient IPC channels.

## Troubleshooting

**Issue: Controller not detected**
*   Ensure the controller is a valid XInput device (Xbox 360, Xbox One, Series X/S).
*   Verify the controller is visible in Windows "Game Controllers" settings.
*   Restart Wintrol to re-initialize the XInput polling loop.

**Issue: Cursor drift**
*   Increase the **Deadzone** setting in the configuration panel until the cursor remains stationary when the stick is released.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

