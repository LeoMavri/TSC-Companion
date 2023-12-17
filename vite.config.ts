import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'TSC Spies',
                namespace: 'Torn Stats Central',
                description: 'Companion script for TSC',
                version: '2.0.0',
                icon: 'https://i.imgur.com/8eydsOA.png',
                match: ['https://www.torn.com/profiles.php?*'],
                updateURL:
                    'https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js',
                downloadURL:
                    'https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js',
                'run-at': 'document-end',
                copyright: '2023, diicot.cc',
                author: 'mitza [2549762] && mavri [2402357]',
            },
        }),
    ],
});
