import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'Torn Spies Central Companion',
                namespace: 'TSC',
                description: 'Companion script for Torn Spies Central',
                version: '2.0.4',
                icon: 'https://i.imgur.com/8eydsOA.png',
                match: ['https://www.torn.com/profiles.php?*'],
                updateURL:
                    'https://raw.githubusercontent.com/LeoMavri/torn-stats-central-script/main/dist/stat-estimate-api.user.js',
                downloadURL:
                    'https://raw.githubusercontent.com/LeoMavri/torn-stats-central-script/main/dist/stat-estimate-api.user.js',
                'run-at': 'document-end',
                copyright: '2024, diicot.cc',
                author: 'mitza [2549762] && mavri [2402357]',
            },
        }),
    ],
});
