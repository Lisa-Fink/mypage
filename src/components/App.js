import { AuthProvider } from '../contexts/AuthContext';
import '../styles/App.css';
import Navigation from './Navigation';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import Login from './LogIn';

// Routes used to be Switch
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Navigation />
          <Routes>
            <Route
              exact
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
