# tmuxracer

A falling hotkeys typing game built with Kontra.js, hotkeys-js, and Vite.

## Development Setup

This project uses a Dev Container for a consistent development environment.

### Prerequisites

- Docker Desktop (for Dev Containers)
- Visual Studio Code with the "Dev Containers" extension

### Getting Started

1. **Open in Dev Container:**
   - Open the project in VS Code
   - Press `F1` and select "Dev Containers: Reopen in Container"
   - Wait for the container to build and start

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   (This runs automatically via `postCreateCommand`)

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The game will be available at `http://localhost:5173`

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Game Play

Press the key combinations shown on falling hotkeys before they reach the bottom of the screen. Build your score and combo to progress through levels!

## Technologies

- **Kontra.js** - Lightweight game library for rendering and game loops
- **hotkeys-js** - Keyboard input handling
- **Vite** - Fast build tool and dev server
 - **Zustand** - State management (available for future use)
