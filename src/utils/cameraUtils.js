import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Capture a photo using the native device camera.
 * Returns the base64 string handling both native and web scenarios if configured.
 */
export const captureFruitPhoto = async () => {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true, // Allow user to crop/edit if they want
            resultType: CameraResultType.Base64, // We need the data to display/save locally
            source: CameraSource.Prompt, // Prompt: Camera or Photos
            saveToGallery: false // We are storing it in our app's private DB
        });

        // Provide a data url for immediate display
        // image.base64String contains just the raw data
        const imageUrl = `data:image/${image.format};base64,${image.base64String}`;

        return imageUrl;
    } catch (error) {
        console.error("Camera capture failed:", error);
        // User might have cancelled, which is fine
        return null;
    }
};
