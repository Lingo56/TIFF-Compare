import { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { decode } from 'tiff'

// Displays a TIFF image from the provided URL
function DisplayTIF({ imageUrl }) {
  const canvasRef = useRef(null)
  const spinnerCanvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const spinnerCanvas = spinnerCanvasRef.current
    const context = canvas.getContext('2d')
    const spinnerContext = spinnerCanvas.getContext('2d')

    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    spinnerContext.clearRect(0, 0, spinnerCanvas.width, spinnerCanvas.height)

    // Set loading to true when a new image is requested
    setLoading(true)

    // Load the TIFF image
    fetch(imageUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => {
        // Decode the TIFF data
        const ifds = decode(data)

        // Check if there are any IFDs (pages) in the TIFF file
        if (ifds.length > 0) {
          const firstIFD = ifds[0] // Access the first IFD

          // Get image dimensions
          const imageWidth = firstIFD.width
          const imageHeight = firstIFD.height

          // Set canvas dimensions to match the image
          canvas.width = imageWidth
          canvas.height = imageHeight

          spinnerCanvas.width = imageWidth
          spinnerCanvas.height = imageHeight

          // Ensure the pixel data length matches the expected length for RGB (3 components) data
          const expectedDataLength = 3 * imageWidth * imageHeight
          if (firstIFD.data.length === expectedDataLength) {
            // Convert RGB data to RGBA format (add an alpha channel)
            const rgbData = firstIFD.data
            const rgbaData = new Uint8ClampedArray(4 * imageWidth * imageHeight)

            for (let i = 0; i < rgbaData.length; i += 4) {
              const rgbIndex = (i / 4) * 3 // Calculate the RGB index
              rgbaData[i] = rgbData[rgbIndex] // Red
              rgbaData[i + 1] = rgbData[rgbIndex + 1] // Green
              rgbaData[i + 2] = rgbData[rgbIndex + 2] // Blue
              rgbaData[i + 3] = 255 // Alpha (fully opaque)
            }

            // Create an ImageData object from the RGBA data
            const imageData = new ImageData(rgbaData, imageWidth, imageHeight)

            // Draw the ImageData onto the canvas
            context.putImageData(imageData, 0, 0)

            // Set loading to false when the image is loaded and displayed
            setLoading(false)

            // Save image dimensions in state
            setImageDimensions({ width: imageWidth, height: imageHeight })
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

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <canvas
          ref={spinnerCanvasRef}
          width={imageDimensions.width}
          height={imageDimensions.height}
          style={{ display: 'block' }}
        >
          Loading...
        </canvas>
      )}
      <canvas ref={canvasRef} style={{ display: loading ? 'none' : 'block' }} />
    </div>
  )
}

DisplayTIF.propTypes = {
  imageUrl: PropTypes.string.isRequired
}

export default DisplayTIF
