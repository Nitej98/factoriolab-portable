#  factoriolab-portable

   A desktop version of Factoriolab


   A desktop-ready, multi-tab version of Factoriolab.
   factoriolab-portable packages the full web version of Factoriolab into a native desktop environment.

## Native Desktop Application

   Runs the full Factoriolab UI inside an Electron-powered container, enabling native behaviors like file persistence.

## Multi-Tab Support

   Open multiple Factoriolab instances at once — each isolated in its own tab.
   Tabs display the relevant icon and recipe name for easier navigation.

## Saved Workspace

   Every time you start the app, it restores all previously open tabs and settings exactly as you left them.
   
## Lightweight

   Uses significantly fewer system resources than running Factoriolab in a web browser.

## Auto-Update Support

   The app can check for updates from GitHub Releases and automatically download/install them.

#  Installation

   (Currently only Windows builds are available.)

   Download the latest release from the Releases section.

   Run the installer.



### Submit bugs and suggestions on the [Issues page](https://github.com/Nitej98/factoriolab-portable/issues) or in our [Discord](https://discord.gg/VMGT4atC)
### If you like this app, consider supporting on [Ko-fi](https://ko-fi.com/nitej)

#  Running Locally (Development)
  
## 1. Clone the repo

    git clone https://github.com/Nitej98/factoriolab-portable.git

    cd factoriolab-portable/factorio-lab-portable

## 2. Install dependencies

    npm install

## 3. Start the app in dev mode

    npm run start

#  Build the App

## 1. Clone the repo

    git clone https://github.com/Nitej98/factoriolab-portable.git

    cd factoriolab-portable/factorio-lab-portable

## 2. Install dependencies

    npm install
    
   (Optional) Use your own/newer build of Factoriolab

   Go to https://github.com/factoriolab/factoriolab

   Follow the instructions there to generate a build.

   Replace the browser folder in /public/factoriolab with your new build.

## 3. Build the desktop app

    npm run dist

   The packaged build will be generated in the releases folder.

#  Credits

   Factoriolab — https://github.com/factoriolab/factoriolab
