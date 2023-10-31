import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { decode } from 'tiff'

// Displays a TIFF image from provided URL
function DisplayCRTTIF({ imageUrl }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Load the TIFF image
    fetch(imageUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => {
        // Decode the TIFF data
        const ifds = decode(data)

        // Check if there are any IFDs (pages) in the TIFF file
        if (ifds.length > 0) {
          const firstIFD = ifds[0] // Access the first IFD

          // Match canvas size with image
          canvas.width = firstIFD.width
          canvas.height = firstIFD.height

          // Ensure the pixel data length matches the expected length for RGB (3 components) data
          const expectedDataLength = 3 * firstIFD.width * firstIFD.height
          if (firstIFD.data.length === expectedDataLength) {
            // Convert RGB data to RGBA format (add an alpha channel)
            let rgbData = firstIFD.data
            let rgbaData = new Uint8ClampedArray(4 * firstIFD.width * firstIFD.height)

            rgbData = histogramEqualization(rgbData)

            for (let i = 0; i < rgbaData.length; i += 4) {
              const rgbIndex = (i / 4) * 3 // Calculate the RGB index
              rgbaData[i] = rgbData[rgbIndex] // Red
              rgbaData[i + 1] = rgbData[rgbIndex + 1] // Green
              rgbaData[i + 2] = rgbData[rgbIndex + 2] // Blue
              rgbaData[i + 3] = 255 // Alpha (fully opaque)
            }

            // Create an ImageData object from the RGBA data
            const imageData = new ImageData(rgbaData, firstIFD.width, firstIFD.height)

            // Draw the ImageData onto the canvas
            context.putImageData(imageData, 0, 0)
          } else {
            console.error('Error loading TIFF image: Invalid pixel data length.')
          }
        } else {
          console.error('Error loading TIFF image: No IFDs found.')
        }
      })
      .catch((error) => {
        console.error('Error loading TIFF image:', error)
      })
  }, [imageUrl])

  return <canvas ref={canvasRef} />
}

// Function to perform Histogram Equalization on a color image
function histogramEqualization(imageData) {
  // Step 1: Calculate histograms for each color channel (R, G, B)
  const histograms = [[], [], []]

  for (let i = 0; i < imageData.length; i += 4) {
    histograms[0][imageData[i]] = (histograms[0][imageData[i]] || 0) + 1 // Red channel
    histograms[1][imageData[i + 1]] = (histograms[1][imageData[i + 1]] || 0) + 1 // Green channel
    histograms[2][imageData[i + 2]] = (histograms[2][imageData[i + 2]] || 0) + 1 // Blue channel
  }

  // Step 2: Calculate cumulative distribution functions (CDFs) for each channel
  const cdfs = [[], [], []]
  const maxPixelValue = 255 // Maximum pixel value

  for (let channel = 0; channel < 3; channel++) {
    let cumulative = 0
    for (let i = 0; i <= maxPixelValue; i++) {
      if (histograms[channel][i]) {
        cumulative += histograms[channel][i]
      }
      cdfs[channel][i] = (cumulative / imageData.length) * maxPixelValue
    }
  }

  // Step 3: Apply Histogram Equalization to the image
  for (let i = 0; i < imageData.length; i += 4) {
    imageData[i] = cdfs[0][imageData[i]] // Red channel
    imageData[i + 1] = cdfs[1][imageData[i + 1]] // Green channel
    imageData[i + 2] = cdfs[2][imageData[i + 2]] // Blue channel
  }

  return imageData
}

DisplayCRTTIF.propTypes = {
  imageUrl: PropTypes.string.isRequired
}

export default DisplayCRTTIF
