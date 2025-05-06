# LightDM Corporate Glassmorphism Theme

<video src='https://github.com/user-attachments/assets/7e27d011-f7a9-4a40-8243-b74517b0ae44' width=180 muted=true></video>

## Installation Guide
1. Install any of the available web greeters ([web-greeter](https://github.com/JezerM/web-greeter), [nody-greeter](https://github.com/JezerM/nody-greeter), [sea-greeter](https://github.com/JezerM/sea-greeter)). Below is the instruction for web-greeter.
2. `git clone` this repo into `/usr/share/web-greeter/themes`
3. Set theme name (folder name in `themes`) in `/etc/lightdm/web-greeter.yml`

## Notes
1. Semi-transparent clock is disabled because it can't be rendered on an outdated version of the browser that web-greeter runs. It should be possible to run it after web-greeter is upgraded to Qt6.
2. Adaptive design could be implemented better.
