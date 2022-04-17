// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";

import { WebAppPanel } from "./WebAppPanel";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ru-demo" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("ru-demo.helloWorld", () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from ru-demo!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ru-demo.panelApp.create", () => {
      //show the local WebAppPanel app
      WebAppPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ru-demo.panelApp.doSomething", () => {
      WebAppPanel.current?.doSomething();
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(WebAppPanel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        console.log(`Got state: ${state}`);
        WebAppPanel.revive(webviewPanel, context.extensionUri);
      },
    });
  }


  // for the Sidebar webview 
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  // register opening the sidebar view
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  // register for sending message from the user (through the extension, e.g. this) to the sidebar webview 
  context.subscriptions.push(
    vscode.commands.registerCommand(
        'ru-demo.sideApp.sendMessage', async () => {
            if (sidebarProvider) { 
                await sidebarProvider.sendMessage();
            }
        }
    )
);
}

// this method is called when your extension is deactivated
export function deactivate() {}
