import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import './components/UserData.css'
import './components/Hero.css'
import App from './App.jsx'
import store from './store/index.js'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <StrictMode>
        <App />
      </StrictMode>
  </Provider>
,
)
