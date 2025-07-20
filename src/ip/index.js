import https from 'https';
import { logger } from '../utils/logger.js';

/**
 * Performs an HTTPS GET request, forcing IPv4 resolution.
 * @param {string} url The URL to request.
 * @returns {Promise<string>} The response body as a string.
 */
const httpsGetIpv4 = (url) => {
    return new Promise((resolve, reject) => {
        // Options object to force IPv4 resolution
        const options = {
            family: 4,
        };

        const request = https.get(url, options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Request failed with status code: ${res.statusCode}`));
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data.trim());
            });
        });

        request.on('error', (err) => {
            reject(err);
        });

        request.end();
    });
};


/**
 * Fetches the public IP address from various services, forcing IPv4.
 * @returns {Promise<string|null>} The public IP address or null if not found.
 */
export const getPublicIp = async () => {
    try {
        const trace = await httpsGetIpv4('https://cloudflare.com/cdn-cgi/trace');
        const ipLine = trace.split('\n').find(line => line.startsWith('ip='));
        if (ipLine) {
            return ipLine.substring(3);
        }
    } catch (error) {
        logger(`Cloudflare trace failed: ${error.message}. Trying other services...`);
    }

    try {
        const ip = await httpsGetIpv4('https://api.ipify.org');
        return ip;
    } catch (error) {
        logger(`api.ipify.org failed: ${error.message}. Trying another service...`);
    }

    try {
        const ip = await httpsGetIpv4('https://ipv4.icanhazip.com');
        return ip;
    } catch (error) {
        logger(`ipv4.icanhazip.com failed: ${error.message}`, true);
    }
    
    return null;
};