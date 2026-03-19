# rallysimfans-browser-plugin
Browser Plugin for www.rallysimfans.hu website that enhances it with stats and filters.

This is a fork of [rallysimfans-browser-plugin](https://github.com/AnttiLoponen/rallysimfans-browser-plugin)

## Features

#### Stage Performance Metrics
- Adds s/km (seconds per kilometer) to rally results and stage record times with
color coding.

#### Stage Filters
- filter stages by surface type

#### Rally Search Improvements
- search rallies
- hide password protected rallys
- pin favorite rallies to the top

#### Summary table or stages
- Automatically calculates:
    - Average pace
    - Median pace (your typical performance)
    - Best / Worst stage
    - Consistency score (mistake indicator)
    - Driven vs undriven stages
    - Total kilometers of driven stages

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

What is tested:
- time string parsing
- distance string parsing
- calculations:
    - average
    - median
    - consistency
    - etc.
- formatting logic
