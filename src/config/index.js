const config = {
    authEmail: process.env.AUTH_EMAIL,
    authKey: process.env.AUTH_KEY,
    zoneIdentifier: process.env.ZONE_IDENTIFIER,
    recordName: process.env.RECORD_NAME,
    siteName: process.env.SITE_NAME,
    slackUri: process.env.SLACK_URI,
    discordUri: process.env.DISCORD_URI,

    // Configuration with defaults
    authMethod: process.env.AUTH_METHOD || "token",
    ttl: parseInt(process.env.TTL, 10) || 3600,
    proxy: process.env.PROXY === 'true',
    slackChannel: process.env.SLACK_CHANNEL || ""
};

// Basic validation to ensure required environment variables are set
const requiredVars = ['authEmail', 'authKey', 'zoneIdentifier', 'recordName', 'siteName'];
for (const v of requiredVars) {
    if (!config[v]) {
        console.error(`Error: Missing required environment variable in .env file: ${v.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
        process.exit(1);
    }
}

export default config;