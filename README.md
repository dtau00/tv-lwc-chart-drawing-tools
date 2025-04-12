<!-- markdownlint-disable no-inline-html first-line-h1 -->

<div align="center">
  <a href="https://www.tradingview.com/lightweight-charts/" target="_blank">
    <img width="200" src="https://github.com/tradingview/lightweight-charts/raw/master/.github/logo.svg?sanitize=true" alt="Lightweight Charts logo">
  </a>

  <h1>TradingView Lightweight Charts™ : Chart Drawing Tools plug-in</h1>

</div>

<!-- markdownlint-enable no-inline-html -->

Chart Drawing Tools is a plug-in to allow users to perform one of the most requested functions of the lightweight charts library, add Chart Drawings!  My goal is to build a solid framework that includes the plumbing, so others can focus on simply adding new drawing.  We will start by focusing on the core drawing functionalities, develop more advanced features such as syncing of drawings between charts, then extend it for deeper integration, such as an API to communicate with the plug-in to, say, externally manage orders with drawings in the plug-in.

Check /docs/...drawio.pdf for more informaiton.

This is a very early preview build; the architecture and structure is still being worked on.  So it is still missing a lot of core features, and expect major breaking changes.  We will be adding test cases once the structure is more solidified.

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
* Toolbar for selecting drawings
* Sub-tool bar for styling the drawing (color, opacity)
* Draw, Select, Delete, Edit
* Auto save/load configuration and drawings
* Synced toolbar control between charts
* Synced drawings of the same symbol (buggy)
* Support for basic shapes : line, ray, vertical, horizontal, rectangle, rectangle-extended, etc...

Things to finish for v1 Release
---------------------------------
- Verify handlers are properly disposed (mem leak)
- Add test cases

See /docs for a mini-roadmap of whats to come.

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License.
You may obtain a copy of the License at LICENSE file.
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.