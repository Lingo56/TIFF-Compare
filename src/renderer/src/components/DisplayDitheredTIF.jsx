import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { decode } from 'tiff'

// Displays TIFF image in greyscale
function DisplayDitheredTIF({ imageUrl }) {
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

          const ditherMatrix = [
            [0, 2],
            [3, 1]
          ]

          // Ensure the pixel data length matches the expected length for RGB (3 components) data
          const expectedDataLength = 3 * firstIFD.width * firstIFD.height
          if (firstIFD.data.length === expectedDataLength) {
            // Convert RGB data to RGBA format (add an alpha channel)
            const greyscaleData = firstIFD.data
            const rgbaData = new Uint8ClampedArray(4 * firstIFD.width * firstIFD.height)

            for (let y = 0; y < firstIFD.height; y++) {
              for (let x = 0; x < firstIFD.width; x++) {
                const pixelLocation = (y * firstIFD.width + x) * 4
                const rgbIndex = (pixelLocation / 4) * 3

                const greyValue =
                  0.299 * greyscaleData[rgbIndex] +
                  0.587 * greyscaleData[rgbIndex + 1] +
                  0.114 * greyscaleData[rgbIndex + 2]

                // Apply ordered dithering using the dither matrix
                const ditherValue = ditherMatrix[y % 2][x % 2]
                const ditheredValue = greyValue + (ditherValue / 4) * 255

                // Set RGBA values
                rgbaData[pixelLocation] = ditheredValue // Red
                rgbaData[pixelLocation + 1] = ditheredValue // Green
                rgbaData[pixelLocation + 2] = ditheredValue // Blue
                rgbaData[pixelLocation + 3] = 255 // Alpha (fully opaque)
              }
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

DisplayDitheredTIF.propTypes = {
  imageUrl: PropTypes.string.isRequired
}

export default DisplayDitheredTIF
