import { useState } from 'react'
import DisplayTIF from './DisplayTIF'
import PropTypes from 'prop-types'

const TIFFCarousel = ({ imageUrl }) => {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNextStep = () => {
    // Calculate the next step
    let nextStep = currentStep + 1

    // If it exceeds 4, wrap back to 1
    if (nextStep > 4) {
      nextStep = 1
    }

    // Update the current step
    setCurrentStep(nextStep)
  }

  // TODO: Here shift between different image displays based on currentStep
  // use a switch statement maybe
  return (
    <div>
      <div>
        <DisplayTIF imageUrl={imageUrl} />
        <DisplayTIF imageUrl={imageUrl} />
      </div>

      <button style={{ padding: '0px 6px' }} onClick={handleNextStep}>
        Next Step (Current: {currentStep})
      </button>
    </div>
  )
}

TIFFCarousel.propTypes = {
  imageUrl: PropTypes.string.isRequired
}

export default TIFFCarousel
