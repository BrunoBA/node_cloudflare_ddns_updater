import 'dotenv/config'

import config from './src/config/index.js'
import { logger } from './src/utils/logger.js'
import { getPublicIp } from './src/ip/index.js'
import { getDnsRecord, updateDnsRecord } from './src/api/cloudflare.js'
import { sendNotification } from './src/notifications/index.js'

const ipv4Regex = /([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])/

const run = async () => {
    logger("Check Initiated")

    const ip = await getPublicIp()

    if (!ip || !ipv4Regex.test(ip)) {
        logger("Failed to find a valid IP.", true)
        process.exit(2)
    }

    try {
        const record = await getDnsRecord()

        if (!record) {
            logger(`Record does not exist, perhaps create one first? (${ip} for ${config.recordName})`, true)
            process.exit(1)
        }

        const oldIp = record.content

        if (ip === oldIp) {
            logger(`IP (${ip}) for ${config.recordName} has not changed.`)
            process.exit(0)
        }

        const updateResult = await updateDnsRecord(record.id, ip)

        if (updateResult.success) {
            logger(`${ip} ${config.recordName} DDNS updated.`)
            await sendNotification(ip, true)
            process.exit(0)
        } else {
            const errorMessage = `DDNS failed for ${record.id} (${ip}). DUMPING RESULTS:\n${JSON.stringify(updateResult, null, 2)}`
            logger(errorMessage, true)
            await sendNotification(`${record.id} (${ip})`, false)
            process.exit(1)
        }

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message
        logger(`An unexpected error occurred: ${errorMessage}`, true)
        await sendNotification(`An unexpected error occurred: ${errorMessage}`, false)
        process.exit(1)
    }
}

run()
