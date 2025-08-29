import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TenantManagementPage from '../modules/tenants/tenant-management/TenantManagementPage';
import UserManagementPage from '../modules/users/user-management/UserManagementPage';
import MainLayout from '../common/components/MainLayout';
import SecretsPage from '../modules/secrets/components/SecretsPage';
import ProtectedRoute from '../common/components/ProtectedRoute';
import { ROLES } from '../common/constants/roles';
import InvoiceManagementPage from '../modules/invoices/components/InvoiceManagementPage';

const HomePagePlaceholder: React.FC = () => <div>Home Page - Welcome!</div>;

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePagePlaceholder />} />
          <Route element={<ProtectedRoute requiredRoles={[ROLES.SUPER_ADMIN]} />}>
            <Route path="/tenant-management" element={<TenantManagementPage />} />
            <Route path="/invoice-management" element={<InvoiceManagementPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
            <Route path="/user-management" element={<UserManagementPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={[ROLES.ADMIN]} />}>
            <Route path="/secrets" element={<SecretsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
