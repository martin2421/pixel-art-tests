// Load required libraries
const { createCanvas, loadImage } = require('canvas');

// Function to extract the top 5 colors from an image
async function extractTopColors(imagePath) {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    const img = await loadImage(imagePath);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const colorMap = new Map();
    for (let i = 0; i < imageData.length; i += 4) {
        const color = `rgb(${imageData[i]}, ${imageData[i + 1]}, ${imageData[i + 2]})`;
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }

    const sortedColors = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);
    return sortedColors.slice(0, 16).map(color => color[0]);
}

// Function to create a 64x64 pixel art using the top 5 colors
async function createPixelArt(topColors, imagePath) {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixelData.data;

    // Convert each pixel to one of the top colors
    for (let i = 0; i < data.length; i += 4) {
        let pixelColor = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
        if (!topColors.includes(pixelColor)) {
            // Find the closest color in the topColors array
            let closestColor = topColors.reduce((prev, curr) => {
                const prevDiff = Math.abs(parseInt(prev.slice(4, -1).split(',')[0]) - data[i]) +
                    Math.abs(parseInt(prev.slice(4, -1).split(',')[1]) - data[i + 1]) +
                    Math.abs(parseInt(prev.slice(4, -1).split(',')[2]) - data[i + 2]);
                const currDiff = Math.abs(parseInt(curr.slice(4, -1).split(',')[0]) - data[i]) +
                    Math.abs(parseInt(curr.slice(4, -1).split(',')[1]) - data[i + 1]) +
                    Math.abs(parseInt(curr.slice(4, -1).split(',')[2]) - data[i + 2]);
                return prevDiff < currDiff ? prev : curr;
            });
            pixelColor = closestColor;
        }

        const colorValues = pixelColor.slice(4, -1).split(',').map(Number);
        data[i] = colorValues[0]; // Red
        data[i + 1] = colorValues[1]; // Green
        data[i + 2] = colorValues[2]; // Blue
    }

    ctx.putImageData(pixelData, 0, 0);
    return canvas.toDataURL(); // Returns a data URL representing the image
}

// Main function to run the genetic algorithm
async function runGeneticAlgorithm(imagePath) {
    try {
        const topColors = await extractTopColors(imagePath);
        const pixelArt = await createPixelArt(topColors, imagePath);
        console.log('Top Colors:', topColors);
        console.log('Pixel Art:', pixelArt);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example usage
const imagePath = 'cat2.png';
runGeneticAlgorithm(imagePath);