import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { DashboardView } from './pages/dashboard';
import { ExploreView } from './pages/explore';
import Login from './pages/Login';
import ProfileView from './pages/profile/profile-view';
import Signup from './pages/Signup';
import { UsersView } from './pages/users';
import { useAuthStore } from './stores';

function PrivateRoute({ children }: { readonly children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Layout>
              <UsersView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <ProfileView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <PrivateRoute>
            <Layout>
              <ExploreView />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

