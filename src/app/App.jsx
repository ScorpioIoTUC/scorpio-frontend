
import { AppProvider } from './AppContext'
import LandingPage from '../pages/LandingPage/LandingPage'


function App() {

  return (
    <AppProvider>
      <LandingPage />
    </AppProvider>
  )
}

export default App