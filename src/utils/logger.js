/**
 * A simple logger
 * @param {string} message The message to log
 * @param {boolean} isError Whether the message is an error
 */
export const logger = (message, isError = false) => {
    const prefix = "DDNS Updater:";
    if (isError) {
        console.error(`${prefix} ${message}`);
    } else {
        console.log(`${prefix} ${message}`);
    }
};
