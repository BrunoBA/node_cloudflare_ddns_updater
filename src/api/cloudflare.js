import axios from 'axios';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

const getAuthHeaders = () => {
    const headers = {
        'X-Auth-Email': config.authEmail,
        'Content-Type': 'application/json'
    };

    if (config.authMethod === 'global') {
        headers['X-Auth-Key'] = config.authKey;
    } else {
        headers['Authorization'] = `Bearer ${config.authKey}`;
    }
    return headers;
};

/**
 * Fetches the DNS 'A' record from Cloudflare.
 * @returns {Promise<object|null>} The DNS record object or null.
 */
export const getDnsRecord = async () => {
    const apiUrl = `https://api.cloudflare.com/client/v4/zones/${config.zoneIdentifier}/dns_records?type=A&name=${config.recordName}`;
    const headers = getAuthHeaders();

    try {
        const response = await axios.get(apiUrl, { headers });
        const data = response.data;

        if (!data.success) {
            logger(`Failed to fetch DNS record. Errors: ${JSON.stringify(data.errors)}`, true);
            return null;
        }

        if (data.result.length > 0) {
            return data.result[0];
        }

        return null;
    } catch (error) {
        logger(`Error fetching DNS record: ${error.message}`, true);
        throw error;
    }
};

/**
 * Updates the DNS 'A' record in Cloudflare.
 * @param {string} recordId The ID of the record to update.
 * @param {string} ip The new IP address.
 * @returns {Promise<object>} The result from the Cloudflare API.
 */
export const updateDnsRecord = async (recordId, ip) => {
    const apiUrl = `https://api.cloudflare.com/client/v4/zones/${config.zoneIdentifier}/dns_records/${recordId}`;
    const headers = getAuthHeaders();
    const payload = {
        type: 'A',
        name: config.recordName,
        content: ip,
        ttl: config.ttl,
        proxied: config.proxy
    };

    try {
        const response = await axios.patch(apiUrl, payload, { headers });
        return response.data;
    } catch (error) {
        logger(`Error updating DNS record: ${error.message}`, true);
        throw error;
    }
};
