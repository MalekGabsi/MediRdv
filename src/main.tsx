import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="fatal-error"><h1>Impossible d’afficher ces données</h1><p>Une ressource inattendue a interrompu l’affichage. Rechargez l’application pour reprendre la recherche.</p><button className="button primary" onClick={() => window.location.reload()}>Recharger l’application</button></main> : this.props.children; }
}

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>);
