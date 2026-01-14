import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ViewPage from './pages/ViewPage'
import UpdatePage from './pages/UpdatePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h2>Convex POC - Real-time React App</h2>
          <div className="nav-links">
            <Link to="/view">View Data</Link>
            <Link to="/update">Update Data</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ViewPage />} />
            <Route path="/view" element={<ViewPage />} />
            <Route path="/update" element={<UpdatePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
