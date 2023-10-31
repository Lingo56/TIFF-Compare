import { useState } from 'react'
import TIFFCarousel from './components/TIFFCarousel'
import FileInput from './components/FileInput'
import CloseButton from './components/CloseButton'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelected = (file) => {
    setSelectedFile(file)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}
    >
      <div style={{ textAlignLast: 'center', margin: 'auto' }}>
        {selectedFile && <TIFFCarousel imageUrl={URL.createObjectURL(selectedFile)} />}

        <div style={{ paddingTop: '20px' }}>
          <FileInput onFileSelected={handleFileSelected} />
          <CloseButton />
        </div>
      </div>
    </div>
  )
}

export default App
