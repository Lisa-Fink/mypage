import { AuthProvider } from '../contexts/AuthContext';
import '../styles/App.css';
import Navigation from './Navigation';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import Login from './LogIn';
import ForgotPassword from './ForgotPassword';
import UpdateAccount from './UpdateAccount';
import Profile from './Profile';
import EditProfile from './EditProfile';
import Friends from './Friends';
import Search from './Search';
import Footer from './Footer';

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
            <Route
              path="/profile/:id"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/friends/:id"
              element={
                <PrivateRoute>
                  <Friends />
                </PrivateRoute>
              }
            />
            <Route
              path="/search=:searchQuery"
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              }
            />
            2
            <Route
              path="/edit-profile"
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-account"
              element={
                <PrivateRoute>
                  <UpdateAccount />
                </PrivateRoute>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </AuthProvider>
      </Router>
      <div className="bottom-margin">
        <Footer />
      </div>
    </div>
  );
}

export default App;
