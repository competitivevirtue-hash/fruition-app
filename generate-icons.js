
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputFile = path.resolve('public/fruition-logo.png');
const output192 = path.resolve('public/pwa-192x192.png');
const output512 = path.resolve('public/pwa-512x512.png');

async function resizeIcons() {
    try {
        if (!fs.existsSync(inputFile)) {
            console.error("Input file not found:", inputFile);
            return;
        }

        await sharp(inputFile)
            .resize(192, 192)
            .toFile(output192);
        console.log("Created pwa-192x192.png");

        await sharp(inputFile)
            .resize(512, 512)
            .toFile(output512);
        console.log("Created pwa-512x512.png");
    } catch (error) {
        console.error("Error creating icons:", error);
    }
}

resizeIcons();
