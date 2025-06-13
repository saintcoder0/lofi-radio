# lofiterminal - A Retro Terminal Lofi Player

Welcome to Lofi OS, a fully interactive, retro-themed lofi radio player built with React. This application provides a nostalgic, command-line interface experience, complete with a custom boot-up sequence, sound effects, and a variety of lofi streams to help you focus, study, or relax.

! website link :- lofiterminal.tech

## ✨ Features

* **Retro Terminal UI:** A classic green-on-black terminal aesthetic with pixel-perfect details and a CRT scanline overlay.
* **Immersive Startup Animation:** A custom boot-up sequence that mimics an old computer starting up, complete with synthesized sound effects using the Web Audio API.
* **Multiple Lofi Stations:** Easily switch between a curated list of live YouTube lofi streams using player controls or keyboard shortcuts.
* **Synced Visuals:** The background GIF changes automatically every time you switch stations, creating a unique vibe for each one.
* **Dynamic Audio Visualizer:** A simulated "beat wave" visualizer that animates next to the station name when music is playing.
* **Full Player Controls:** Full control over playback, volume, station shuffling, and fullscreen mode.
* **Productivity Tools:** Includes a hideable Pomodoro timer and a to-do list to help you stay organized and focused.
* **Customizable Themes:** Cycle through multiple retro color palettes (Terminal, Amber, Arctic, Vaporwave) to change the look and feel of the application.
* **Keyboard Shortcuts:** Control the player using familiar keyboard commands for a true terminal experience.
* **Social & Support Links:** Easily connect with the creator or show your support.

## 🛠️ Built With

* **React:** A modern JavaScript library for building user interfaces.
* **Vite:** A fast and lightweight build tool for modern web projects.
* **Web Audio API:** Used to generate the boot-up and glitch sound effects natively in the browser.
* **YouTube IFrame Player API:** For embedding and controlling the live lofi radio streams.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need to have [Node.js](https://nodejs.org/en/) (which includes npm) installed on your computer.

### Installation

1.  **Clone the repo:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```
2.  **Navigate into the project directory:**
    ```sh
    cd your-repo-name
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Move Assets:** If you have local images (like a profile photo), place them inside the `public` folder in the root of your project.
5.  **Start the local development server:**
    ```sh
    npm run dev
    ```

After running the last command, your terminal will show you a local URL (usually `http://localhost:5173`). You can open this URL in your web browser to see the application running.

## ⚙️ How to Customize

This project is designed to be easily customizable. All major data is located at the top of the `src/App.jsx` file.

* **Change the Lofi Stations:** Open `src/App.jsx` and modify the `YOUTUBE_STREAMS` array. You can add, remove, or reorder stations by changing the `name` and YouTube video `id`.

* **Update the Background GIFs:** In the same file, you can change the links in the `SCENES` array to use your own collection of GIFs. Make sure to use direct links to the image files (ending in `.gif`, `.png`, etc.).

* **Update Social Links:** In the `RightPanel` component within `src/App.jsx`, replace the placeholder URLs for GitHub and Twitter (`https://github.com/your-github`, `https://x.com/your-twitter`) with your own profile links. You can also update the "Support Me" link to your own donation page.

* **Update Profile Photo:** To change the profile photo, replace the placeholder URL in the `RightPanel` component's `<img>` tag with a direct link to your photo, or place your image in the `public` folder and reference it with a leading slash (e.g., `/your-photo.jpeg`).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/lofi-radio/issues).

## 📄 License

This project is open source and available to everyone.

## 🙏 Acknowledgements

* Inspired by the incredible work of the lofi.cafe team.
* All lofi streams are credited to their respective creators on YouTube.
* A big thank you to the open-source community for the tools and libraries that made this project possible.



