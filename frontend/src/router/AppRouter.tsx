import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }                  from '../contexts/AuthContext';
import { Role }                     from '../types/user';
import LoginPage                    from '../pages/LoginPage';
import RegisterPage                 from '../pages/RegisterPage';
import DashboardPage                from '../pages/DashboardPage';
import NewReimbursementPage         from '../pages/NewReimbursementPage';
import EditReimbursementPage        from '../pages/EditReimbursementPage';
import ReimbursementDetailPage      from '../pages/ReimbursementDetailPage';
import CategoriesPage               from '../pages/CategoriesPage';

function PublicRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }: { children: JSX.Element; roles: Role[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/"                        element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/reimbursements/:id"      element={<PrivateRoute><ReimbursementDetailPage /></PrivateRoute>} />

        <Route path="/reimbursements/new"      element={<RoleRoute roles={[Role.COLABORADOR]}><NewReimbursementPage /></RoleRoute>} />
        <Route path="/reimbursements/:id/edit" element={<RoleRoute roles={[Role.COLABORADOR]}><EditReimbursementPage /></RoleRoute>} />
        <Route path="/categories"              element={<RoleRoute roles={[Role.ADMIN]}><CategoriesPage /></RoleRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
