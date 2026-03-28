# rallysimfans-browser-plugin
Browser extension for [rallysimfans.hu](https://www.rallysimfans.hu/rbr/index.php) website that enhances it with stats and filters.

This is a fork of [rallysimfans-browser-plugin](https://github.com/AnttiLoponen/rallysimfans-browser-plugin)

## Features

#### Performance Metrics
- Adds s/km (seconds per kilometer) to rally results and stage record times with
color coding.
- A summary panel for quickly seeing how you did overall or on a stage with drop downs for seeing
time diffs between drivers who finished.

#### Stage Filters
- filter stages by surface type

#### Rally Search Improvements
- search rallies
- hide password protected rallys
- pin favorite rallies to the top

#### Summary table for overall and stages
- Automatically calculates:
    - Average pace
    - Median pace (your typical performance)
    - Consistency score (mistake indicator)
    - Best delta for class
    - Worst delta for class
    - Driven vs undriven stages
    - Total stages

#### Sub-Classes for certain classes
    - compare times from different eras of WRC cars
    - compare times between AWD and RWD cars in Group B and Group 4
    - compare times between kit/maxi in A7 or pre-kit cars
    - compare times between different eras of A8

## Installation
This extension should work on any browser but the installation process for Firefox
and some others may require extra steps.

### Chrome / Edge / Brave
Download the latest release zip
1. Extract it to a folder
2. Open chrome://extensions
3. Turn on Developer mode
4. Click Load unpacked

### Firefox
There is two ways you can install on Firefox and none of them are straightforward:

#### Temporary (you will need to load after after restart)
1. Download the latest release `.zip` from the releases page
2. Extract the zip to a folder
3. Open Firefox and got to:
```
about:debugging#/runtime/this-firefox
```
4. Click "Load Temporary Add-on"
5. Select the file:
```
manifest.json
```
6. The extension will load immediately

#### Permanent Install (requires Firefox Development Browser)
1. Download the release `.zip` from the release page
2. Rename it to:
```
rallysimfans-browser-plugin.xpi
```
3. Open Firefox and go to:
```
about:config -> xpinstall.signatures.required = false
```
4. Go to:
```
about:addons
```
5. Click the settings icon -> Install Add-On From File
6. Select the `.xpi` file

## Development
Install dependencies
```bash
npm install
```
Build the extension
```bash
npm run build
```
Watch mode (auto rebuild)
```bash
npm run build:watch
```
### Testing
This project uses Vitest.
Run tests
```bash
npm run test
```
Watch mode
```bash
npm run test:watch
```

See the tests in the `test/` directory for what is tested.