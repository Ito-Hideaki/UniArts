import { defineConfig } from "vite";
import { resolve } from 'path';

export default defineConfig(({ command }) => {
    if (command === "build") return {
        base: "/UniArts/",
        resolve: {
            alias: {
                "phaser": resolve("./src/phaser-shim.js")
            }
        },
        plugins: [
            {
                name: 'inject-phaser-cdn',
                transformIndexHtml(html) {
                    return html.replace(
                        `</head>`,
                        `
    <script src="https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.min.js"></script>
</head>`
                    );
                }
            }
        ]
    };
    return {};
});