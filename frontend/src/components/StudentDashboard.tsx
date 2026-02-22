import React from 'react';
import { useNavigate } from 'react-router-dom';
import senaLogo from '../assets/sena.png';

const StudentDashboard = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            <nav style={{ backgroundColor: '#39A900', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                     <img src={senaLogo} alt="SENA" style={{height:'40px', filter:'brightness(0) invert(1)'}}/>
                     <h2 style={{margin:0, fontSize:'1.2rem'}}>Panel del Aprendiz</h2>
                </div>
                <button onClick={handleLogout} style={{background:'white', color:'#39A900', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>
                    Cerrar Sesión
                </button>
            </nav>

            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Bienvenido a tu Proyecto</h1>
                <p style={{fontSize:'1.1rem', color:'#555'}}>Aquí verás pronto las historias de usuario y tareas asignadas a tu ficha.</p>
                
                <div style={{ marginTop: '30px', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display:'inline-block' }}>
                    <h3>Estado de tu proyecto</h3>
                    <p>🚧 En construcción...</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;