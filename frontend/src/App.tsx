// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/login/LoginScreen';
import InstructorDashboard from './components/dashboard_instructor/InstructorDashboard';
import DashboardAdministrador from './components/dashboard_administrador/admin_dashboard';
import StudentDashboard from './components/StudentsDashboard/StudentDashboard';
import ListaAprendices from './components/lista_aprendices/ListaAprendices';
import CrearProyecto from './components/crear_proyecto/CrearProyecto';
import AsignarProyecto from './components/asignar_proyecto/AsignarProyecto';
import VerMasProyecto from './components/asignar_proyecto/asignar_proyecto_vermas/VerMasProyecto';
import VerProyectos from './components/ver_proyectos/VerProyectos';
import RegistrarAprendiz from './components/RegistrarAprendiz';

function DashboardByRole() {
  const roleId = localStorage.getItem('userRoleId');
  if (roleId === '3') return <Navigate to="/dashboard-administrador" replace />;
  if (roleId === '2') return <Navigate to="/dashboard-instructor" replace />;
  if (roleId === '1') return <Navigate to="/student-dashboard" replace />;
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      {/* 1. ruta del login */}
      <Route path="/" element={<LoginScreen />} />
      {/* 2. ruta dashboard genérica por rol */}
      <Route path="/dashboard" element={<DashboardByRole />} />
      {/* 2.5 dashboard por perfil */}
      <Route path="/dashboard-instructor" element={<InstructorDashboard />} />
      <Route path="/dashboard-administrador" element={<DashboardAdministrador />} />
      {/* 2.1. ruta del dashboard del estudiante */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      {/* 3. ruta de la lista de aprendices */}
      <Route path="/lista-aprendices" element={<ListaAprendices />} />
      {/* 4. ruta de crear proyecto */}
      <Route path="/crear-proyecto" element={<CrearProyecto />} />
      {/* 5. ruta de asignar proyecto */}
      <Route path="/asignar-proyectos" element={<AsignarProyecto />} />
      {/* 5.1. ruta de asignar proyecto a ver mas */}
      <Route path="/asignar-proyectos-vermas/:id" element={<VerMasProyecto />} />
      {/* 6. ruta de asignar proyecto a ver mas */}
      <Route path="/ver-proyectos" element={<VerProyectos />} />
      {/* 7. ruta de registrar aprendiz */}
      <Route path="/registrar-aprendiz" element={<RegistrarAprendiz />} />
      {/* error: si la ruta falla te manda al login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export default App;
