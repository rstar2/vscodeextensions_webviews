import * as vscode from "vscode";
import { getNonce } from "./util";

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from allowed directories.
    localResourceRoots: [
      // for scripts/styles from the extension e.g. VSCode related
      vscode.Uri.joinPath(extensionUri, "media"),

      // the output dir of the Vue app
      vscode.Uri.joinPath(extensionUri, "dist-web"),
    ],
  };
}

export class WebAppPanel {
  public static current: WebAppPanel | undefined;
  public static readonly viewType = "ru-demo.webApp";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    // If we already have a panel, show it.
    if (WebAppPanel.current) {
      WebAppPanel.current._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      WebAppPanel.viewType,
      // shown as title in editor - initially (can be changed later dynamically)
      "Ru Demo",
      // the editor's column where to put the webview
      column || vscode.ViewColumn.One,
      // options
      getWebviewOptions(extensionUri)
    );

    WebAppPanel.current = new WebAppPanel(panel, extensionUri);
  }

  /**
   * Dispose current instance if needed from outside
   */
  public static dispose() {
    WebAppPanel.current?.dispose();
    WebAppPanel.current = undefined;
  }

  /**
   * Recreate a new single instance
   * Can be used when using vscode.window.registerWebviewPanelSerializer in the extension.ts
   * so that the webview to survive VSCode restarts
   * @param panel
   * @param extensionUri
   */
  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    // Reset the webview options so we use latest uri for `localResourceRoots`.
    panel.webview.options = getWebviewOptions(extensionUri);
    WebAppPanel.current = new WebAppPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes (like view dragged from one editor column to another)
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview (the HTML/JS page)
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    WebAppPanel.current = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public doSomething() {
    // Send a message to the webview (the HTML/JS page).
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ command: "something" });
  }

  private async _update() {
    // // Vary the webview's content html/title based on where it is located in the editor.
    // switch (this._panel.viewColumn) {
    //   case vscode.ViewColumn.Two:
    //     break;
    //   case vscode.ViewColumn.Three:
    //     break;
    //   case vscode.ViewColumn.One:
    //   default:
    //     break;
    // }

    // this._panel.title = "Ru Demo updated title"; // can be dynamic again
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
  }

  //   private _getHtmlForWebview(webview: vscode.Webview) {
  //     const styleResetUri = webview.asWebviewUri(
  //       vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
  //     );

  //     const styleVSCodeUri = webview.asWebviewUri(
  //       vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
  //     );
  //     const scriptUri = webview.asWebviewUri(
  //       vscode.Uri.joinPath(this._extensionUri, "dist-web", "js/app.js")
  //     );

  //     const scriptVendorUri = webview.asWebviewUri(
  //       vscode.Uri.joinPath(this._extensionUri, "dist-web", "js/chunk-vendors.js")
  //     );

  //     const nonce = getNonce();
  //     const baseUri = webview
  //       .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist-web"))
  //       .toString()
  //       .replace("%22", "");

  //     return `
  //                 <!DOCTYPE html>
  //                 <html lang="en">
  //                 <head>
  //                     <meta charset="utf-8" />
  //                     <meta name="viewport" content="width=device-width,
  //                         initial-scale=1" />
  //                     <link href="${styleResetUri}" rel="stylesheet">
  //                     <link href="${styleVSCodeUri}" rel="stylesheet">
  //                     <title>Web App Panel</title>
  //                 </head>
  //                 <body>
  //                 <input hidden data-uri="${baseUri}">
  //                     <div id="app"></div>
  //                     <script type="text/javascript"
  //                         src="${scriptVendorUri}" nonce="${nonce}"></script>
  //                     <script type="text/javascript"
  //                         src="${scriptUri}" nonce="${nonce}"></script>
  //                 </body>
  //                 </html>
  //             `;
  //   }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to scripts that should later run in the webview
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "js",
      "vscode.js"
    );

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "css",
      "reset.css"
    );
    const stylesVscodePath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "css",
      "vscode.css"
    );

    // Uri to load scripts/styles into webview
    const scriptUri = webview.asWebviewUri(scriptPath);
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesVscodeUri = webview.asWebviewUri(stylesVscodePath);

    // Uri to load Vue app build scripts/styles
    const stylesVueAppUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-web", "css", "app1.css")
    );
    const scriptVueAppUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-web", "js", "app1.js")
    );
    const scriptVueVendorsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "dist-web",
        "js",
        "chunk-vendors.js"
      )
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    // This will used by the Vue app when it needs to access resources from proper path (e.b. inside the baseUri)
    const baseUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist-web"))
      .toString()
      .replace("%22", "");

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            
            <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
            
            
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            <!-- The VSCode styles -->
            <link href="${stylesResetUri}" rel="stylesheet">
            <link href="${stylesVscodeUri}" rel="stylesheet">

            <!-- The Vue app styles -->
            <link href="${stylesVueAppUri}" rel="stylesheet">
        </head>
        <body>
            <!-- The VSCode script -->
            <script src="${scriptUri}" nonce="${nonce}"></script>

            <h1>Outside of Vue: <span id="count"></span></h1>
            
            <!-- The root of the Vue app-->
            <div id="app"></div>

            <!--
                This will used by the Vue app when it needs to access resources from proper path (e.b. inside the baseUri)
                Like in <img alt="Vue logo" :src="\${baseUri}/img/logo.png">
            -->
            <input type="hidden" data-base-uri="${baseUri}">

            <!-- The Vue app scripts -->
            <script src="${scriptVueVendorsUri}" nonce="${nonce}"></script>  
            <script src="${scriptVueAppUri}" nonce="${nonce}"></script> 
        </body>
        </html>`;
  }
}
