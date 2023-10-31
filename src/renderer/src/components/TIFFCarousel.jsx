import { useState } from 'react'
import DisplayTIF from './DisplayTIF'
import DisplayGreyTIF from './DisplayGreyTIF'
import DisplayHalfBrightTIF from './DisplayHalfBrightTIF'
import DisplayHalfBrightGreyTIF from './DisplayHalfBrightGreyTIF'
import DisplayDitheredTIF from './DisplayDitheredTIF'
import DisplayLeveledTIF from './DisplayLeveledTIF'
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

  let displayComponent1, displayComponent2

  // Use a switch statement to determine which component to display
  switch (currentStep) {
    case 1:
      displayComponent1 = <DisplayTIF imageUrl={imageUrl} />
      displayComponent2 = <DisplayGreyTIF imageUrl={imageUrl} />
      break
    case 2:
      displayComponent1 = <DisplayHalfBrightTIF imageUrl={imageUrl} />
      displayComponent2 = <DisplayHalfBrightGreyTIF imageUrl={imageUrl} />
      break
    case 3:
      displayComponent1 = <DisplayGreyTIF imageUrl={imageUrl} />
      displayComponent2 = <DisplayDitheredTIF imageUrl={imageUrl} />
      break
    case 4:
      displayComponent1 = <DisplayTIF imageUrl={imageUrl} />
      displayComponent2 = <DisplayLeveledTIF imageUrl={imageUrl} />
      break
    default:
      displayComponent1 = <DisplayTIF imageUrl={imageUrl} />
      displayComponent2 = <DisplayTIF imageUrl={imageUrl} />
      break
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          height: '520px' // Fixed container height, adjust as needed
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '5px'
          }}
        >
          {displayComponent1}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '5px'
          }}
        >
          {displayComponent2}
        </div>
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
