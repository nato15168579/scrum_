import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, LifeBuoy, Play } from 'lucide-react'; 
import senaLogo from '../assets/sena.png'; 
import './HelpSupport.css';

const HelpSupport = () => {
    const navigate = useNavigate();
    
    // Estado para saber cuál pregunta está seleccionada. 
    // Inicializamos en null o en 1 si quieres que la primera aparezca abierta.
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // DATOS DE LAS PREGUNTAS (Extraídos de tu imagen image_adc34a.png)
    const faqData = [
        {
            id: 1,
            question: "¿Cómo puedo registrarme en la plataforma?",
            answer: "Para registrarte solo necesitas ingresar a la página principal y hacer clic en 'Crear cuenta'. Luego completas tus datos básicos, verificas tu correo y listo, ya puedes entrar al panel principal y empezar a trabajar con tus proyectos. Es un proceso rápido y seguro."
        },
        {
            id: 2,
            question: "¿Qué metodologías soporta?",
            answer: "La plataforma soporta metodologías modernas como Scrum, Kanban y enfoques híbridos, permitiendo organizar tareas por sprints, tableros visuales, flujos de trabajo y métricas de avance. También puedes personalizar el flujo según la forma en que tu equipo trabaje."
        },
        {
            id: 3,
            question: "¿Quién puede crear un proyecto dentro de la plataforma?",
            answer: "Únicamente el instructor puede crear nuevos proyectos, luego, él mismo asigna cada proyecto a los grupos correspondientes, definiendo roles, responsables y fechas. Los estudiantes solo pueden acceder, trabajar y actualizar sus tareas dentro de los proyectos asignados."
        },
        {
            id: 4,
            question: "¿Qué beneficios tiene usar la plataforma frente a métodos tradicionales?",
            answer: "La plataforma centraliza toda la información del proyecto, mejora la comunicación, reduce errores y hace que el seguimiento sea más rápido y visual. Los estudiantes trabajan con flujos estructurados, mientras que el instructor puede monitorear avances en tiempo real sin depender de documentos manuales o reportes externos."
        },
        {
            id: 5,
            question: "¿Cómo se realiza el seguimiento de los entregables?",
            answer: "Cada entregable se registra dentro del proyecto y se asigna con fechas, responsables y estados. El sistema genera alertas, actualiza el progreso automáticamente y muestra reportes para que puedas ver qué está en curso, qué está atrasado y qué ya fue completado."
        }
    ];

    return (
        <div className="help-page">
            {/* --- CABECERA --- */}
            <header className="help-header">
                <ArrowLeft 
                    size={32} 
                    color="white" 
                    className="back-icon" 
                    onClick={() => navigate(-1)} // Volver atrás
                />
                <img src={senaLogo} alt="SENA" className="header-logo" />
                <div className="header-texts">
                    <h1>Gestión de proyectos</h1>
                    <p>Plataforma SENA - ADSO 2998937</p>
                </div>
            </header>

            {/* --- CONTENIDO --- */}
            <main className="help-container">
                
                {/* Título Grande */}
                <div className="help-title-section">
                    <LifeBuoy size={60} strokeWidth={1.5} className="help-main-icon" />
                    <div className="help-title-text">
                        Ayuda<br/>y Soporte
                    </div>
                </div>

                {/* Sección Preguntas */}
                <div className="faq-section-title">
                    <div className="blue-bar"></div>
                    <h2>Preguntas Frecuentes</h2>
                </div>

                {/* LAYOUT IZQUIERDA / DERECHA */}
                <div className="faq-layout">
                    
                    {/* COLUMNA IZQUIERDA: LISTA DE PREGUNTAS */}
                    <div className="questions-list">
                        {faqData.map((item) => (
                            <button 
                                key={item.id}
                                className={`question-btn ${selectedId === item.id ? 'active' : ''}`}
                                onClick={() => setSelectedId(item.id)}
                            >
                                <Play size={12} fill="currentColor" className="triangle-icon"/>
                                {item.question}
                            </button>
                        ))}
                    </div>

                    {/* COLUMNA DERECHA: RESPUESTA */}
                    <div className="answer-panel">
                        {selectedId ? (
                            <>
                                <h3>{faqData.find(q => q.id === selectedId)?.question}</h3>
                                <p className="answer-text">
                                    {faqData.find(q => q.id === selectedId)?.answer}
                                </p>
                            </>
                        ) : (
                            <div className="empty-state">
                                <LifeBuoy size={48} color="#ccc" style={{marginBottom:'10px'}}/>
                                <p>Selecciona una pregunta de la izquierda para ver su respuesta aquí.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="help-footer">
                <div className="contact-info">
                    <strong>¿Necesita más información?</strong>
                    <div className="contact-item">
                        <Phone size={18} />
                        <span>Bogotá: 3430111</span>
                    </div>
                    <div className="contact-item">
                        <span style={{marginLeft: '26px'}}>Resto del país: 018000910270</span>
                    </div>
                </div>
                <div className="copyright">
                    <p>Horario de atención: Lunes a Viernes 7:00 am a 7:00 pm - Sábados 8:00 am a 1:00 pm</p>
                    <p>Todos los derechos reservados - 2006 / 2014</p>
                </div>
            </footer>
        </div>
    );
};

export default HelpSupport;
