const { spawn } = require('child_process');

function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        const process = spawn('node', [scriptName], { stdio: 'inherit' });

        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${scriptName} exited with code ${code}`));
            }
        });
    });
}

(async () => {
    try {
        console.log('Started...');
        await runScript('deploy-commands.js');

        await runScript('index.js');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();
