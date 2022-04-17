// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    // To access the VS Code API object, call acquireVsCodeApi inside the webview.
    // This function can only be invoked once per session.
    // You must hang onto the instance of the VS Code API returned by this method,
    // and hand it out to any other functions that need to use it.
    const vscode = acquireVsCodeApi();

    const oldState = /** @type {{ count: number} | undefined} */ (vscode.getState());

    console.log('Initial state', oldState);

    let currentCount = oldState?.count ?? 0;

    setInterval(() => {
        currentCount++;

        // Update state
        vscode.setState({ count: currentCount });

        // Alert the extension when the cat introduces a bug
        if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
            // Send a message back to the extension
            vscode.postMessage({
                command: 'alert',
                text: '🐛' + currentCount
            });
        }
    }, 10000);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'something':
                currentCount = Math.ceil(currentCount * 0.5);
                break;
        }
    });
}());