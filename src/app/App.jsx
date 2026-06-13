
import { AppProvider } from './AppContext'
import LandingPage from '../pages/LandingPage/LandingPage'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'
import Dashboard from '../pages/Dashboard/Dashboard'


function App() {
  const path = window.location.pathname

  function renderPage() {
    if (path === '/login') {
      return <Login />
    }

    if (path === '/signup') {
      return <SignUp />
    }

    if (path === '/dashboard') {
      return <Dashboard />
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
