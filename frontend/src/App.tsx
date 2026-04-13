// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import InicioScreen from "./components/pantalla_inicio/InicioScreen";

import LoginScreen from './components/login/LoginScreen';
import InstructorDashboard from './components/dashboard_instructor/InstructorDashboard';
import DashboardAdministrador from './components/dashboard_administrador/AdminDashboard';
import StudentDashboard from './components/dashboard_aprendiz/StudentDashboard';
import ListaAprendices from './components/lista_aprendices/ListaAprendices';
import ListaAprendicesAdmin from './components/dashboard_administrador/lista_aprendices/ListaAprendices';
import ListaInstructoresAdmin from './components/dashboard_administrador/lista_instructores/ListaInstructoresAdmin';
import CambiosDelSistemaAdmin from "./components/dashboard_administrador/cambios-del-sistema/CambiosDelSistemaAdmin";
import HistorialObservacionesAdmin from "./components/dashboard_administrador/cambios-del-sistema/HistorialObservacionesAdmin";
import CrearProyectoInstructor from './components/crear_proyecto/CrearProyecto';
import CrearProyectoAdmin from './components/dashboard_administrador/proyectos_admin/CrearProyectoAdmin';
import AsignarProyecto from './components/asignar_proyecto/AsignarProyecto';
import VerProyectosInstructor from './components/ver_proyectos/VerProyectos';
import VerProyectosAdmin from './components/dashboard_administrador/proyectos_admin/VerProyectos';
import RegistrarUsuariosAdmin from './components/dashboard_administrador/registrar_usuarios_admin/RegistrarUsuariosAdmin';
import RegistrarAprendices from './components/registrar_aprendiz/RegistrarAprendices';
import MiPerfil from './components/mi_perfil/MiPerfilView';
import ActualizarDato from './components/mi_perfil/actualizar_dato/ActualizarDato';
import CambiarPassword from './components/mi_perfil/cambiar_contrasena/CambiarPassword';
import AsignarIntegrantes from './components/asignar_proyecto/registrar_aprendiz/RegistrarAprendiz';
import DetalleProyecto from './components/ver_proyectos/detalle_proyecto/DetalleProyecto';
import EditarIntegrantes from './components/ver_proyectos/detalle_proyecto/editar_integrante/EditarIntegrantes';
import HistoriasUsuario from './components/ver_proyectos/detalle_proyecto/ver_historia_usuario/HistoriasUsuario';
import CriteriosAceptacion from './components/ver_proyectos/detalle_proyecto/ver_historia_usuario/criterios_aceptacion/CriteriosAceptacion';
import VerReuniones from './components/ver_proyectos/detalle_proyecto/ver_reuniones/VerReuniones';
import DetallePlanning from './components/ver_proyectos/detalle_proyecto/ver_reuniones/reunion_planning/DetallePlanning';
import DetalleSprint from './components/ver_proyectos/detalle_proyecto/ver_reuniones/reunion_sprint/DetalleSprint';
import DetalleDaily from './components/ver_proyectos/detalle_proyecto/ver_reuniones/reunion_daily/DetalleDaily';
import DetalleRetrospective from './components/ver_proyectos/detalle_proyecto/ver_reuniones/reunion_retrospective/DetalleRetrospective';
import CrearSugerencia from './components/ver_proyectos/detalle_proyecto/crear_sugerencia/CrearSugerencia';
import MiProyecto from "./components/aprendiz_mi_proyecto/MiProyecto";
import HistoriasUsuarios from "./components/aprendiz_historias/HistoriasUsuarios";
import CriterioAceptacion from "./components/aprendiz_criterios/CriterioAceptacion";
import Reuniones from "./components/aprendiz_reuniones/Reuniones";
import Observaciones from "./components/aprendiz_observaciones/Observaciones";
import HelpSupport from './components/ayuda_soporte/HelpSupport';
import PasswordRecovery from './components/PasswordRecovery';
import MiProyectoDetalle from './components/aprendiz_mi_proyecto/MiProyectoDetalle';



function DashboardByRole() {
  const roleId = (localStorage.getItem('userRoleId') || '').trim();
  const cedula = localStorage.getItem('userCedula');

  if (!cedula) return <Navigate to="/" replace />;
  if (roleId === '3') return <Navigate to="/dashboard-administrador" replace />;
  if (roleId === '2') return <Navigate to="/dashboard-instructor" replace />;
  if (roleId === '1') return <Navigate to="/student-dashboard" replace />;
  return <Navigate to="/dashboard-administrador" replace />;
}

function VerProyectosByRole() {
  const roleId = (localStorage.getItem('userRoleId') || '').trim();
  if (roleId === '3') return <VerProyectosAdmin />;
  return <VerProyectosInstructor />;
}

function CrearProyectoByRole() {
  const roleId = (localStorage.getItem('userRoleId') || '').trim();
  if (roleId === '3') return <CrearProyectoAdmin />;
  return <CrearProyectoInstructor />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InicioScreen />} />
      {/* 1. ruta del login */}
      <Route path="/login" element={<LoginScreen />} />
      {/* 2. ruta dashboard genérica por rol */}
      <Route path="/dashboard" element={<DashboardByRole />} />
      {/* 2.5 dashboard por perfil */}
      <Route path="/dashboard-instructor" element={<InstructorDashboard />} />
      <Route path="/dashboard-administrador" element={<DashboardAdministrador />} />
      {/* 2.1. ruta del dashboard del estudiante */}
      <Route path="/dashboard-aprendiz" element={<StudentDashboard />} />
      {/* 3. ruta de la lista de aprendices */}
      <Route path="/lista-aprendices" element={<ListaAprendices />} />
      <Route path="/lista-aprendices-admin" element={<ListaAprendicesAdmin />} />
      <Route path="/lista-instructores-admin" element={<ListaInstructoresAdmin />} />
      <Route path="/cambios-del-sistema" element={<CambiosDelSistemaAdmin />} />
      <Route
        path="/cambios-del-sistema/historial"
        element={<HistorialObservacionesAdmin />}
      />
      {/* 4. ruta de crear proyecto */}
      <Route path="/crear-proyecto" element={<CrearProyectoByRole />} />
      {/* 5. ruta de asignar proyecto */}
      <Route path="/asignar-proyectos" element={<AsignarProyecto />} />
      {/* 6. ruta de asignar proyecto a ver mas */}
      <Route path="/ver-proyectos" element={<VerProyectosByRole />} />
      {/* 7. ruta de registrar aprendiz */}
      <Route path="/registrar-aprendiz" element={<RegistrarAprendices />} />
      <Route path="/registrar-usuarios-admin" element={<RegistrarUsuariosAdmin />} />
      {/*  ruta de mi perfil */}
      <Route path="/mi-perfil" element={<MiPerfil />} />
      {/*  ruta de actualizar datos */}
      <Route path="/actualizar-dato" element={<ActualizarDato />} />
      {/*  ruta de cambiar contraseña*/}
      <Route path="/actualizar-contrasena" element={<CambiarPassword />} />
      {/*  ruta de añadir integrantes*/}
      <Route path="/asignar-integrantes/:id" element={<AsignarIntegrantes />} />
      {/*  ruta de asignar proyecto a ver mas en ver proyecto */}
      <Route path="/detalle-proyecto/:id" element={<DetalleProyecto />} />
      {/*  ruta de editar integrante - AGREGAR EL :id */}
      <Route path="/editar-integrante/:id" element={<EditarIntegrantes />} />
      {/*  ruta de la historia de usuario :id */}
      <Route path="/ver-historia-usuario/:id" element={<HistoriasUsuario />} />
      {/*  ruta de los criterios de aceptacion :id */}
      <Route path="/criterios-aceptacion/:proId/:id" element={<CriteriosAceptacion />} />
      {/* ruta de ver las reuniones */}
      <Route path="/proyecto/:id/reuniones" element={<VerReuniones />} />
      {/* ruta de detalle planning :id */}
      <Route path="/proyecto/:id/reuniones/planning" element={<DetallePlanning />} />
      {/* ruta de detalle review :id */}
      <Route path="/proyecto/:id/reuniones/sprint" element={<DetalleSprint />} />
      {/* ruta de detalle daily :id */}
      <Route path="/proyecto/:id/reuniones/daily" element={<DetalleDaily />} />
      {/* ruta de detalle Retrospective  :id */}
      <Route path="/proyecto/:id/reuniones/retrospective" element={<DetalleRetrospective />} />
      {/* ruta de sugerencia del instructor :id */}
      <Route path="/sugerencia/:id" element={<CrearSugerencia />} />
      {/* ruta de ayuda y soporte */}
      <Route path="/ayuda-soporte" element={<HelpSupport />} />
      <Route path="/recuperar-contrasena" element={<PasswordRecovery />} />

      <Route path="/aprendiz/mi-proyecto" element={<MiProyecto />} />
      <Route path="/aprendiz/mi-proyecto/detalle" element={<MiProyectoDetalle />} />
      <Route path="/aprendiz/historias-usuario" element={<HistoriasUsuarios />} />
      <Route path="/aprendiz/criterios-aceptacion" element={<CriterioAceptacion />} />
      <Route path="/aprendiz/reuniones" element={<Reuniones />} />
      <Route path="/aprendiz/observaciones" element={<Observaciones />} />



      {/* error: si la ruta falla te manda al login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export default App;
