const readline = require('readline');

class tui {
    constructor(callbacks, onError) {
        this.terminal = null
        this.internalCallbacks = {}
        this.needToExit = false
        this.ConstructInteralCallbacks(callbacks)
        this.onError = onError
    }
    ConstructInteralCallbacks(callbacks) {
        for (const [key, value] of Object.entries(callbacks)) {
            this.internalCallbacks[key] = value
        }
        this.internalCallbacks['exit'] = {
            description: "Stops IO processing and stops all companies",
            callback: async () => {
                this.needToExit = true
                if ('exit' in callbacks) {
                    await callbacks['exit'].callback()
                }
            }
        }
    }
    CreateTerminalIfNeeded() {
        if (this.terminal) { return }
        this.terminal = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    async CallManually(input) {
        if (input in this.internalCallbacks) {
            try {
                await this.internalCallbacks[input].callback()
            } catch (error) {
                this.onError(error)
            }
        }
        else {
            this.terminal.write(`Unknown value \"${input}\"\r\n`)
            for (const [key, value] of Object.entries(this.internalCallbacks)) {
                this.terminal.write(`   \"${key}\"\r\n     Description : ${value.description}\r\n`)
            }
        }
    }
    async AskOnce() {
        return new Promise((resolve, reject) => {
            this.terminal.question('$ ', (input) => {
                resolve(input)
            })
        })
    }
    async Run() {
        this.CreateTerminalIfNeeded()
        while (!this.needToExit) {
            const input = await this.AskOnce()
            if (input.length != 0) {
                if (input in this.internalCallbacks) {
                    try {
                        await this.internalCallbacks[input].callback()
                    } catch (error) {
                        this.onError(error)
                    }
                }
                else {
                    this.terminal.write(`Unknown value \"${input}\"\r\n`)
                    for (const [key, value] of Object.entries(this.internalCallbacks)) {
                        this.terminal.write(`   \"${key}\"\r\n     Description : ${value.description}\r\n`)
                    }
                }
            }
        }
        this.terminal.close()
    }
}

module.exports = tui