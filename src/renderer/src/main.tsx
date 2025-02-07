import './assets/main.css'

import ReactDOM from 'react-dom/client'
import App from './App'

import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <FluentProvider theme={webDarkTheme} style={{ width: '100vw', height: '100vh'}}>
    <App />
  </FluentProvider>
)
