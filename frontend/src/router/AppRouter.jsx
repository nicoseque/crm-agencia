import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import AuditUsers from '../pages/AuditUsers';
import Ranking from '../pages/Ranking';
import SalesHistory from '../pages/SalesHistory';
import GestionComercial from '../pages/GestionComercial';
import Clients from '../pages/Clients'; // ✅ NUEVO
import ProtectedRoute from './ProtectedRoute';
import DashboardLikeLayout from '../components/layout/DashboardLikeLayout';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* APP INTERNA */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLikeLayout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* CLIENTES */}
          <Route path="clients" element={<Clients />} />

          {/* SECCIONES */}
          <Route path="ranking" element={<Ranking />} />
          <Route path="sales-history" element={<SalesHistory />} />
          <Route path="gestion-comercial" element={<GestionComercial />} />
          <Route path="users" element={<Users />} />
          <Route path="audit/users" element={<AuditUsers />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
