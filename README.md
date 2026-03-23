# Hyprland Visual Shortcut Builder

A modern, interactive web application to visually build and manage your Hyprland window manager shortcuts. Stop memorizing syntax and start building your `hyprland.conf` with ease.

![Hyprland Logo](https://hyprland.org/logo.png)

## ✨ Features

- **Interactive Keyboard Capture**: Press keys on your physical keyboard or click the visual keyboard to capture shortcuts.
- **Smart Conflict Detection**: Automatically detects if a shortcut or action is already assigned, offering options to replace or edit existing entries.
- **Action Categories**:
  - **Open App**: Launch any terminal command or application.
  - **Window Action**: Close, fullscreen, float, or pin windows.
  - **Workspace**: Switch to or move windows to specific workspaces.
  - **System**: Lock screen, logout, or suspend.
  - **Custom Command**: Full control over dispatchers and parameters.
- **Advanced Flags**: Support for `locked` (l), `repeat` (e), and `release` (r) bind flags.
- **Saved List**: Manage all your generated shortcuts in one place, with one-click copy to clipboard.
- **Responsive Design**: Beautiful "Tubelight" navigation and glassmorphism UI that works on all screen sizes.

## 🚀 Tech Stack

- **Framework**: [React 18+](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Custom glassmorphism components and specialized UI primitives.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hyprland-shortcut-builder.git
   cd hyprland-shortcut-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

1. **Capture Shortcut**: Click the "Press your shortcut" button and use your keyboard or click the keys on the screen.
2. **Select Action**: Choose a category (e.g., "Open App") and fill in the details (e.g., `kitty`).
3. **Configure Flags**: (Optional) Open "Advanced Options" to set repeat, release, or locked flags.
4. **Build & Save**: Click "Build Config" to see the generated line. If satisfied, click "Save to List".
5. **Apply**: Copy the generated code from your "Saved Shortcuts" list and paste it into your `~/.config/hypr/hyprland.conf`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---
Built with ❄️ for the Hyprland community.
