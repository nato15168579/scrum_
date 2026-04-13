import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  ClipboardList,
  Users,
  CalendarDays,
  LifeBuoy,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogIn
} from "lucide-react";
import senaLogo from "../../assets/sena.png";
import "./InicioScreen.css";

const InicioScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="inicio-screen">
      <header className="inicio-header">
        <div className="inicio-brand">
          <div className="inicio-brand__logo-box">
            <img src={senaLogo} alt="Logo SENA" className="inicio-brand__logo" />
          </div>

          <div className="inicio-brand__text">
            <h1>Gestión de proyectos</h1>
            <p>Plataforma SENA - ADSO 2998937</p>
          </div>
        </div>

        <div className="inicio-header__actions">
          <button
  className="inicio-btn-aura"
  onClick={() => navigate("/login")}
>
  <span className="inicio-btn-aura__glow"></span>

  <span className="inicio-btn-aura__content">
    <LogIn size={18} className="inicio-btn-aura__icon"/>
    Ingresar
  </span>
</button>
        </div>
      </header>

      <main className="inicio-main">
        <section className="inicio-hero">
          <div className="inicio-hero__left">
            <span className="inicio-hero__eyebrow">PLATAFORMA DE TRABAJO ÁGIL</span>
            <h2>Administra proyectos Scrum de forma clara, rápida y profesional</h2>
            <p>
              Organiza historias de usuario, criterios de aceptación, reuniones,
              observaciones y avances del proyecto en un solo entorno diseñado
              para instructores y aprendices.
            </p>

            <div className="inicio-hero__chips">
              <div className="inicio-chip">
                <FolderKanban size={16} />
                <span>Proyectos</span>
              </div>
              <div className="inicio-chip">
                <ClipboardList size={16} />
                <span>Historias</span>
              </div>
              <div className="inicio-chip">
                <CalendarDays size={16} />
                <span>Reuniones</span>
              </div>
              <div className="inicio-chip">
                <Users size={16} />
                <span>Equipos</span>
              </div>
            </div>
          </div>

          <div className="inicio-hero__right">
            <div className="inicio-summary-card">
              <div className="inicio-summary-card__icon">
                <LayoutDashboard size={38} />
              </div>

              <div className="inicio-summary-card__content">
                <span className="inicio-summary-card__label">SOLUCIÓN INTEGRAL</span>
                <h3>Administración y gestión de proyectos</h3>
                <p>
                  Unifica el seguimiento del proceso formativo, la colaboración
                  del equipo y el control de entregables.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="inicio-guide">
          <div className="inicio-guide__top">
            <div className="inicio-guide__title-wrap">
              <div className="inicio-guide__title-icon">
                <Sparkles size={20} />
              </div>

              <div className="inicio-guide__title-text">
                <h3>Guía rápida</h3>
                <p>Conoce el flujo principal de la plataforma en tres pasos</p>
              </div>
            </div>
          </div>

          <div className="inicio-guide__grid">
            <article className="inicio-guide-card">
              <div className="inicio-guide-card__head">
                <div className="inicio-guide-card__number">01</div>
                <div className="inicio-guide-card__icon inicio-guide-card__icon--blue">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <h4>Accede a tu cuenta</h4>
              <p>
                Ingresa con tus credenciales institucionales para entrar de forma
                segura a la plataforma según tu rol asignado.
              </p>

              <div className="inicio-guide-card__bottom">
                <span>Ingreso seguro</span>
                <ArrowRight size={15} />
              </div>
            </article>

            <article className="inicio-guide-card">
              <div className="inicio-guide-card__head">
                <div className="inicio-guide-card__number">02</div>
                <div className="inicio-guide-card__icon inicio-guide-card__icon--green">
                  <Users size={20} />
                </div>
              </div>

              <h4>Ubica tu equipo y proyecto</h4>
              <p>
                Consulta tu grupo asignado, revisa tu proyecto y visualiza tus
                tareas activas dentro de cada sprint.
              </p>

              <div className="inicio-guide-card__bottom">
                <span>Trabajo colaborativo</span>
                <ArrowRight size={15} />
              </div>
            </article>

            <article className="inicio-guide-card">
              <div className="inicio-guide-card__head">
                <div className="inicio-guide-card__number">03</div>
                <div className="inicio-guide-card__icon inicio-guide-card__icon--orange">
                  <ClipboardList size={20} />
                </div>
              </div>

              <h4>Participa y da seguimiento</h4>
              <p>
                Revisa historias, criterios, reuniones y observaciones para
                mantener el avance del proyecto bajo control.
              </p>

              <div className="inicio-guide-card__bottom">
                <span>Seguimiento continuo</span>
                <ArrowRight size={15} />
              </div>
            </article>
          </div>

          <div className="inicio-guide__footer">
            <button
              className="inicio-support-link"
              onClick={() => navigate("/ayuda-soporte")}
            >
              <LifeBuoy size={15} />
              Ayuda y soporte
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InicioScreen;