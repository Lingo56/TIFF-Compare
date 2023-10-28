import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { decode } from 'tiff'

function DisplayTIF({ imageUrl }) {
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
            const rgbData = firstIFD.data
            const rgbaData = new Uint8ClampedArray(4 * firstIFD.width * firstIFD.height)

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

DisplayTIF.propTypes = {
  imageUrl: PropTypes.string.isRequired
}

export default DisplayTIF
