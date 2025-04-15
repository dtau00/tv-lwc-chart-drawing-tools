<!-- markdownlint-disable no-inline-html first-line-h1 -->

<div align="center">
  <a href="https://www.tradingview.com/lightweight-charts/" target="_blank">
    <img width="200" src="https://github.com/tradingview/lightweight-charts/raw/master/.github/logo.svg?sanitize=true" alt="Lightweight Charts logo">
  </a>

  <h1>TradingView Lightweight Charts™ : Chart Drawing Tools plug-in</h1>

</div>

<!-- markdownlint-enable no-inline-html -->

Chart Drawing Tools is a plug-in that allows users to perform one of the most requested functions of the lightweight charts library, add Chart Drawings!  My goal is to build a solid framework that includes the plumbing, so others can focus on simply adding new drawing.  We will start by focusing on the core drawing functionalities, develop more advanced features such as syncing of drawings between charts, then extend it for deeper integration, such as an API to communicate with the plug-in to, say, externally manage orders with drawings in the plug-in.

This is an early release build.  Most of the basic drawings and funcitonality are implemented.  Useful for those that just want a basic drawing package.

## Installing

1. Clone the repository:
    ```bash
    git clone https://github.com/dtau00/tv-lwc-chart-drawing-tools.git
    ```

2. Navigate into the project directory:
    ```bash
    cd tv-lwc-chart-drawing-tools
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Run the development server:
    ```bash
    npm run dev
    ```

5. Open your browser and visit: `http://localhost:5173/`


## Features
* Toolbar for selecting different drawing tools
* Sub-tool bar for styling the drawing (color, opacity, thickness, line style, etc..)
* Draw, Select, Delete, Edit
* Auto save/load configuration and drawings
* Synced toolbar control between charts
* Synced drawings of the same symbol
* Support for basic shapes : line, ray, vertical, horizontal, rectangle, etc...

## Using
See /src/examples/example-adding-data-html for an exaample of adding live data.  Basically, dont add directly add new bars to the chart, update the plugin instead.  This is needed to pad the chart for extended drawings. 

Things to finish for v1 Release
---------------------------------
- Verify handlers are properly disposed (mem leak)
- Add test cases

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License.
You may obtain a copy of the License at LICENSE file.
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.