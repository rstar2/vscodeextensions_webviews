import * as vscode from "vscode";
import { getNonce } from "./util";

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "ru-demo.sidebarApp";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      // allow the whole extensions folder
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "message": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "openPanelApp": {
            await vscode.commands.executeCommand("ru-demo.panelApp.create", {
              ...data,
            });
            break;
          }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  public sendMessage() {
    return vscode.window
      .showInputBox({
        prompt: "Enter your message",
        placeHolder: "Hey Sidebar!",
      })
      .then((value) => {
        if (value) {
          this.postWebviewMessage({
            command: "message",
            data: value,
          });
        }
      });
  }
  private postWebviewMessage(msg: { command: string; data?: any }) {
    vscode.commands.executeCommand(
      "workbench.view.extension.ru-demo-sidebarApp-view"
    );
    vscode.commands.executeCommand("workbench.action.focusSideBar");

    this._view?.webview.postMessage(msg);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-media", "js", "main.js")
    );
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-media", "css", "reset.css")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-media", "css", "vscode.css")
    );

    const styleAppUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-web", "css", "app2.css")
    );

    const scriptAppUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-web", "js", "app2.js")
    );

    const scriptVueVendorsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "dist-web",
        "js",
        "chunk-vendors.js"
      )
    );

    const nonce = getNonce();

    const baseUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist-web"))
      .toString()
      .replace("%22", "");

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />

            <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

            <meta name="viewport" content="width=device-width, initial-scale=1" />  
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleAppUri}" rel="stylesheet">  
        <body>
            <h1>Outside of Vue: <span id="count"></span></h1>

            <input type="hidden" data-base-uri="${baseUri}">
            <div id="app"></div>
            <script src="${scriptUri}" nonce="${nonce}"></script>
            <script src="${scriptVueVendorsUri}" nonce="${nonce}"></script>
            <script src="${scriptAppUri}" nonce="${nonce}"></script>
        </body>
        </html>   
    `;
  }
}
