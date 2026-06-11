
import { AppProvider } from './AppContext'
import LandingPage from '../pages/LandingPage/LandingPage'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'


function App() {
  const path = window.location.pathname

  function renderPage() {
    if (path === '/login') {
      return <Login />
    }

    if (path === '/signup') {
      return <SignUp />
    }

    return <LandingPage />
  }

  return (
    <AppProvider>
      {renderPage()}
    </AppProvider>
  )
}

export default App
