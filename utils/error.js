class CustomError extends Error {
    #message
    #frontendMessage
    #statusCode
    constructor(message, frontendMessage, statusCode) {
        this.#message = message
        this.#frontendMessage = frontendMessage
        this.#statusCode = statusCode
    }
    get message() { return this.#message; }
    get frontendMessage() { return this.#frontendMessage; }
    get statusCode() { return this.#statusCode; }
}

module.exports = CustomError;