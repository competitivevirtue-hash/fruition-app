import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model = null;
let isLoading = false;

/**
 * Pre-loads the MobileNet model for offline use.
 * Call this on app startup.
 */
export const loadModel = async () => {
    if (model || isLoading) return;
    try {
        isLoading = true;
        console.log('Loading MobileNet model...');
        // Load the model. This triggers a download of the model files.
        // For true offline support, we'd need to cache these files or bundle them.
        // On the web/PWA, the browser cache usually handles this after first load.
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log('MobileNet model loaded successfully.');
        // Warmup (optional)
        tf.tidy(() => {
            model.classify(tf.zeros([224, 224, 3]));
        });
    } catch (error) {
        console.error('Failed to load MobileNet model:', error);
    } finally {
        isLoading = false;
    }
};

/**
 * Classifies an image element (img, video, canvas).
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} imageElement 
 * @returns {Promise<Array<{className: string, probability: number}>>}
 */
export const identifyFruit = async (imageElement) => {
    if (!model) {
        await loadModel();
    }
    if (!model) return [];

    try {
        const predictions = await model.classify(imageElement);
        // MobileNet returns generic classes (e.g. 'Granny Smith'). 
        // We might want to map these to our simplistic fruit names later.
        console.log('Predictions:', predictions);
        return predictions;
    } catch (error) {
        console.error('Error identifying fruit:', error);
        return [];
    }
};
