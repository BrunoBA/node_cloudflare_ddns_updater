import axios from 'axios';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Sends a notification to Slack and/or Discord
 * @param {string} message The message to send
 * @param {boolean} isSuccess Whether the update was successful
 */
export const sendNotification = async (message, isSuccess) => {
    const siteName = config.siteName;
    const recordName = config.recordName;
    let notificationText;

    if (isSuccess) {
        notificationText = `${siteName} Updated: ${recordName}'s new IP Address is ${message}`;
    } else {
        notificationText = `${siteName} DDNS Update Failed: ${recordName}: ${message}.`;
    }

    if (config.slackUri) {
        const slackPayload = {
            channel: config.slackChannel,
            text: notificationText
        };
        try {
            await axios.post(config.slackUri, slackPayload);
        } catch (error) {
            logger(`Failed to send Slack notification: ${error.message}`, true);
        }
    }

    if (config.discordUri) {
        const discordPayload = {
            content: notificationText
        };
        try {
            await axios.post(config.discordUri, discordPayload, {
                headers: { 'Accept': 'application/json' }
            });
        } catch (error) {
            logger(`Failed to send Discord notification: ${error.message}`, true);
        }
    }
};