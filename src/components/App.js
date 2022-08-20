import { AuthProvider } from '../contexts/AuthContext';
import '../styles/App.css';
import Navigation from './Navigation';
import SignUp from './SignUp';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Navigation />
        <SignUp />
      </AuthProvider>
    </div>
  );
}

export default App;
