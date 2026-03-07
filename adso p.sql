/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 10.4.32-MariaDB : Database - pro_scrum
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`pro_scrum` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `pro_scrum`;

/*Table structure for table `criterios_aceptacion` */

DROP TABLE IF EXISTS `criterios_aceptacion`;

CREATE TABLE `criterios_aceptacion` (
  `cri_ID` int(11) NOT NULL COMMENT 'id de criterio de aceptacion',
  `his_ID_FK` int(11) NOT NULL COMMENT 'id de la historia de usuario',
  `pro_ID_his_FK` int(11) NOT NULL COMMENT 'id del proyecto',
  `usu_cedula_FK` int(11) NOT NULL COMMENT 'cedula del usuario',
  `estado_FK` int(11) NOT NULL COMMENT 'Estado del criterio (pendiente, en proceso, finalizado)',
  `cri_tiempo` varchar(50) DEFAULT NULL COMMENT 'defina cuanto tiempo en horas va a ejercer cada criterio',
  `cri_descripcion` varchar(500) DEFAULT NULL COMMENT 'descripcion del criterio de aceptacion',
  PRIMARY KEY (`cri_ID`,`his_ID_FK`,`pro_ID_his_FK`),
  KEY `usu_cedula_FK` (`usu_cedula_FK`),
  KEY `cri_ID` (`cri_ID`),
  KEY `estado_FK` (`estado_FK`),
  KEY `his_ID_FK_2` (`his_ID_FK`,`pro_ID_his_FK`),
  CONSTRAINT `criterios_aceptacion_ibfk_2` FOREIGN KEY (`estado_FK`) REFERENCES `detalle_parametro` (`det_par_ID`),
  CONSTRAINT `criterios_aceptacion_ibfk_3` FOREIGN KEY (`his_ID_FK`, `pro_ID_his_FK`) REFERENCES `historia_usuario` (`his_ID`, `pro_ID_FK`),
  CONSTRAINT `criterios_aceptacion_ibfk_4` FOREIGN KEY (`usu_cedula_FK`) REFERENCES `usuario` (`usu_cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `criterios_aceptacion` */

insert  into `criterios_aceptacion`(`cri_ID`,`his_ID_FK`,`pro_ID_his_FK`,`usu_cedula_FK`,`estado_FK`,`cri_tiempo`,`cri_descripcion`) values 
(1,1,1,1046696769,1,'5 horas','tendrá que presionar la opción \"registrar aprendiz\" y se redireccionara a una vista donde tendrá que llenar los datos obligatorios de cada aprendiz y si están los campos correctos se genera un alerta \"registro exitoso\"'),
(1,1,2,1043134580,1,'6 horas','En caso que se quiera añadir a un nuevo aprendiz	Cuando se complete el formulario de inscripción	Se almacenan los datos basicos (Nombre, identificacón, etc)'),
(1,1,3,1048069515,1,'16 horas','La aplicación tendrá una interfaz simple y eficaz para una mejor experiencia de digitación'),
(1,1,4,1081914694,1,'4 horas','En caso que se ingresen los datos necesarios del inicio de sesión correctamente Cuando se de click en iniciar sesión A continuación mostrará un mensaje donde se muestre que inició correctamente y redireccionar a la página principal.'),
(1,1,5,1048068189,1,'4 horas','El usuario ingresa su credenciales, al dar click en el botón ingresar se hace la validación de sus credenciales y si están correctas ingresa el usuario'),
(2,1,1,1046696769,1,'5 horas','tendrá que presionar la opción \"registrar aprendiz\", en caso de que hayan campos obligatorios con entradas vacías se generara una alerta de \"registro fallido\"'),
(2,1,2,1043134580,1,NULL,'En caso de que se deba añadir un acudiente para un aprendiz	cuando se registre al acudiente al sistema	Se almacenan los datos de los acudientes como nombre, identificacion, contacto y relación con el aprendiz'),
(2,1,3,1048069515,1,'16 horas','La interfaz muestra un flujo lógico de tareas, ordenadas como se realizan en la vida real.\n- Las funciones relacionadas se agrupan visual y funcionalmente.\n- Se siguen principios de diseño centrado en el usuario, priorizando accesibilidad, legibilidad y claridad'),
(2,1,4,1081914694,1,'4 horas','En caso que ingrese uno de los datos del inicio de sesión incorrectamente Cuando se de click en iniciar sesión A continuación mostrará una alerta en el campo donde el dato esté incorrecto.\r\n'),
(2,1,5,1048068189,1,'5 horas','El usuario ingresa a sus credenciales,  al dar clic en el botón ingresar si la validación es incorrecta se envía un mensaje de error'),
(3,1,2,1043134580,1,NULL,'En caso de que se quiera añadir la ubicación del aprendiz	Cuando ingrese la dirrección del aprendiz	Se almacenera la ubicación de residencia'),
(3,1,3,1048069515,1,'16 horas','Se aplica una paleta de colores con tonos derivados de Green-900'),
(3,1,4,1081914694,1,'6 horas','En caso de que el usuario olvide la contraseña Cuando se de click en el botón de olvido de contraseña A continuación, se solicitará el correo electrónico con el que se registró y \r\ndeberá escribirlo en un campo. Se enviará un link a una página personalizada donde se realizará el cambio de contraseña'),
(3,2,1,1044607427,1,'5 horas','tendrá que presionar la opción de ingresar, escribe los datos requeridos y presiona el botón ingresar para acceder correctamente a la interfaz principal'),
(3,2,5,1048068189,1,'4 horas','El usuario inicia sesión en la plataforma y al dar clic en el botón ingresar se despliega la interfaz de usuario principal'),
(4,1,2,1043134580,1,NULL,'Se quiera consultar o editar los datos de los aprendices o acudientes	Cuando se acceda la ficha del aprendiz	Permitir al sistema consultar y editar los datos almacenados de los aprendices y acudientes'),
(4,1,3,1048069515,1,'16 horas','Los componentes deben ser altamente reutilizables,configurables.                               Los componentes deben ser altamente reutilizables,configurables.                                                  -los componentes cumplen con los estandares de accesibilidad'),
(4,1,4,1081914694,1,'5 horas','En caso de que el usuario no tenga credenciales de incio de sesión Cuando se de click en el botón de registrarse A continuación, se realizará una encuesta para solicitar los datos necesarios para el registro en la aplicación'),
(4,2,1,1044607427,1,'5 horas','al presionar la opción de ingresar y dejar campos vacíos o ingresar datos incorrectos se muestra un error \"usuario y/o contraseña incorrecta\"'),
(4,3,5,1048068189,1,'5 horas','El usuario entra a la interfaz de usuario, al dar click en el botón de ficha se despliega la interfaz de ficha'),
(5,1,3,1048069515,1,'16 horas ','Las pruebas identifican puntos de fricción como pasos innecesarios y errores\n- Se valida que las tareas esenciales se pueden completar de forma eficiente.\n- Se recoge un feedback que permita implementar mejoras antes del lanzamiento'),
(5,2,1,1044607427,1,'7 horas','al presionar la opción de ingresar, si tienes 3 intentos fallidos se mostrara una alerta donde le diga al usuario que tendrá que esperar 5 minutos para intentar nuevamente el ingreso'),
(5,2,2,1043134580,1,'10 horas','En caso de que se requiera consultar el historial del comité	Cuando se acceda a la ficha del aprendiz o comité	El sistema mostrara historial de los comites relacionados con la ficha seleccionada'),
(5,2,4,1010006601,1,'7 horas','En caso que se ingresen los datos necesarios del inicio de sesión correctamente Cuando se de click en iniciar sesión A continuación mostrará un mensaje donde se muestre que inició correctamente y redireccionar a la página principal del psicólogo.'),
(5,4,5,1047222805,1,'5 horas','El usuario está en la interfaz de usuario al dar click en el botón asistencia se despliega la interfaz de asistencia'),
(6,1,3,1048069515,1,'16 horas','que tenga la paleta de colores  Green-900'),
(6,2,2,1043134580,1,'7 horas','En caso de que requiera consultar el historial del comité a un aprendiz en especifico	Cuando se acceda a la ficha del aprendiz	Consultará los registros historicos de los comité relacionado con ese aprendiz'),
(6,2,4,1010006601,1,'4 horas','En caso que ingrese uno de los datos del inicio de sesión incorrectamente Cuando se de click en iniciar sesión A continuación mostrará una alerta en el campo donde el dato esté \r\nincorrecto.\r\n'),
(6,3,1,1130267265,1,'7 horas','al presionar la opción ayuda y soporte que esta en la interfaz principal, se redirecciona a una vista donde habrán unas preguntas frecuentes con su respuesta rápida'),
(6,5,5,1047222805,1,'4 horas','El usuario está en la interfaz de usuario al dar clic en el botón de horario ambiente se despliega la interfaz de horario'),
(7,2,3,1044619072,1,'6 horas','La aplicación incluirá toda la información especificada de la plantilla y la compilará en un formato más legible.'),
(7,2,4,1010006601,1,'5 horas','En caso de que el usuario olvide la contraseña Cuando se de click en el botón de olvido de contraseña A continuación, se solicitará el correo electrónico con el que se registró y deberá escribirlo en un campo. Se enviará un link a una página personalizada donde se realizará el cambio de contraseña\r\n'),
(7,3,2,1043134580,1,'6 horas','En caso de que un aprendiz no asista a una clase	Cuando marque la inasistencia en el sistema	El sistema registrará la inasistencia con fecha y horas especificas'),
(7,4,1,1130267265,1,'7 horas','El usuario presiona la opción \"olvide mi contraseña\" y se redirecciona a otra vista donde tendrá que seleccionar el tipo de documento y digitar el numero de identificación y presionar la opción \"siguiente\"'),
(7,6,5,1047222805,1,'3 horas','El usuario está en la interfaz de usuario Al dar clic en el botón de calificaciones se despliega la interfaz de calificaciones'),
(8,2,3,1044619072,1,'6 horas','Se debe documentar cada campo, tipo de dato, validaciones existentes, cálculos automáticos, y relaciones entre secciones para asegurar migración completa.'),
(8,3,2,1043134580,1,'7 horas','En caso de que un aprendiz llegue tarde a clase	Cuando marque en retardos en el sistema	El sistema registrará la inasistencia con fecha y horas especificas'),
(8,3,4,1010006601,1,'7 horas','En caso que el usuario desee ver la gran variedad de enfermedades mentales Cuando presione el nombre o recuadro de la enfermedad A continuación lo redireccionará hacia una página que describa detalladamente sobre la enfermedad\r\n'),
(8,4,1,1130267265,1,'5 horas','el usuario presiona la opción \"siguiente\" y se redirecciona a una vista donde tendrá que confirmar el correo ya registrado, al cual se le enviara un código de 6 dígitos	cuando presione la opción \"siguiente\" se redireccionara a una interfaz donde tendrá que colocar el código que se le envió al correo, el cual tendrá validación de 60 segundos'),
(8,7,5,1042251558,1,'2 horas','El usuario inicia sesión y accede a la interfaz de fichas utiliza la barra de búsqueda, la cual muestra solo las fichas que cumplen con los criterios de búsqueda permitiendo una navegación más eficiente'),
(9,2,3,1044619072,1,'6 horas','El formulario debe presentar campos organizados en secciones lógicas, validar datos en tiempo real, mostrar ayudas contextuales, y permitir navegación fluida entre secciones con indicador de progreso.'),
(9,3,2,1043134580,1,'10 horas','En caso de que un aprendiz presente una excusa justificando su inasistencia o retardo	Cuando ingrese la excusa en el sistema	El sistema permitira adjuntar la excusa dada (documento) registrado por la fecha'),
(9,4,1,1130267265,1,'5 horas','el usuario presiona la opción \"siguiente\", en caso de no colocar el código en el tiempo estipulado por el sistema, tendrá que presionar la opción \"reenviar código\", le llegara un nuevo código al correo y tendrá que digitarlo y presionar la opción \"siguiente\"'),
(9,4,4,1129534383,1,'5 horas','En caso que el psicólogo desee ver sus notificaciones de solicitud de cita o mensaje  Cuando presione el icono de notificación A continuación desplegará una ventanilla donde estará dividido entre las solicitudes de citas y mensajes directos con los \r\nusuarios'),
(9,8,5,1042251558,1,'5 horas','El Usuario sesión y accede a la interfaz de fichas, utiliza la barra de búsqueda y le da opción filtro disponible por estado, fecha de inicio, etc. La interfaz solo muestra la fecha que cumplen con los criterios'),
(10,2,3,1044619072,1,'6 horas','El sistema debe calcular automáticamente índices (IMC, porcentaje graso, etc.), validar rangos de valores normales, mostrar alertas para valores atípicos, y actualizar campos dependientes en tiempo real.'),
(10,3,2,1043134580,1,'7 horas','En caso de que quiera generar un reporte de asistencia 	Cuando soliciten el reporte del aprendiz	El sistema generará un reporte detallado con las inasistencias, retardos y excusas por fechas y horas'),
(10,4,1,1130267265,1,'4 horas','el usuario presiona la opción \"siguiente\", se redirecciona a una vista donde tendrá que crear una nueva contraseña y confirmarla al presionar la opción \"guardar\", se mostrara un mensaje emergente que diga \"contraseña cambiada correctamente\"'),
(10,5,4,1129534383,1,'6 horas','En caso de que el psicólogo desee cambiar el estado de la historia Cuando presione el botón cambiar estado Desplegará una lista de opciones: atendido, en proceso\r\n'),
(10,9,5,1042251558,1,'3 horas','El usuario inicia sesión y accede a la interfaz de fichas, Hace click en el nombre de la ficha y se abre una vista detallada de la ficha que incluye información básica, lista de aprendices inscritos, acceso a la bitácora y horarios'),
(11,3,2,1043134580,1,'11 horas','En caso de que el aprendiz acumule un numero critico de inasistencias o retardos	Cuando alcance el limite de inasistencias o retardos	El sistema enviara una alerta a los integrantes del comité y al aprendiz cuando supere el limite'),
(11,3,3,1044600666,1,'8 horas','Un bot automatizado envía el correo al cliente para recordarle sobre la fecha'),
(11,4,1,1130267265,1,'4 horas','se muestra el mensaje emergente exitoso, si presiona la opción \"ir al inicio\", se redirecciona a la vista del Loguin'),
(11,5,4,1129534383,1,'5 horas','En caso de que el psicólogo quiera filtrar el orden de las historias Cuando presione el botón orden Desplegará una lista de opciones para ordenar por fecha, estado y identificación\r\n'),
(11,10,5,1042251558,1,'2 horas','El usuario inicia sesión y accede a la interfaz de asistencia presiona el botón descargar y descarga el PDF con la información de las asistencias'),
(12,3,3,1044600666,1,'8 horas','El sistema debe revisar todas las citas programadas, identificar aquellas que están dentro del rango de recordatorio (24h, 48h, 1 semana), y marcarlas para envío de recordatorio.\r\n'),
(12,4,1,1130267265,1,'6 horas','el usuario presiona la opción \"siguiente\", en caso de que hayan campos con entradas vacías se mostrara el campo vacío en rojo, indicando que debe colocar información'),
(12,4,2,1043134580,1,'6 horas','En caso de que se este debatiendo una situación en el comité	Cuando se proponga una situacion de debate y decisión	El sistema permitira aprobar o desaprobar con un voto o comentario\r\n'),
(12,6,4,1129534383,1,'4 horas','En caso de que la persona desee recibir notificaciones Cuando presione  la opción de aceptar se mostrara una opcion que le permita decidir el medio por el cual desea recibir la notificacion'),
(12,11,5,1049931166,1,'5 horas','El usuario inicia sesión y entra a la interfaz de asistencia selecciona registro de asistencia y hace editar se cargó un formulario con la información del registro, al modificar y guardar el registro se actualiza y refleja el cambio'),
(13,3,3,1044600666,1,'8 horas','El sistema debe verificar que no se haya enviado ya un recordatorio para esa cita, calcular el tiempo apropiado según el tipo de valoración, y preparar el mensaje personalizado.'),
(13,4,2,1043134580,1,'2 horas','En caso de que se requiera un análisis o comentario sobre la situación	Cuando se presente una situación para análisis remoto	El sistema permitirá que el usuario agregue un concepto o análisis relacionado con la situación'),
(13,5,1,1130267265,1,'6 horas','tendrá que presionar el botón que indica su perfil que esta en la parte superior derecha, el cual mostrara un ventana emergente con dos opciones \"mi perfil\" y \"salir\"'),
(13,6,4,1129534383,1,'4 horas','Cuando se envie alguna informacion desde  y sobre la app Cuando presione la notificacion Se mostrara un mensaje con informacion \r\nenviada \r\n'),
(13,12,5,1049931166,1,'3 horas','El usuario inicia sesión y entrar a interfaz de horario da click en el botón creación de horario y se carga la interfaz donde está una tabla vacía que se llena cada recuadro para ponerlos datos requeridos'),
(14,3,3,1044600666,1,'8 horas',' El mensaje debe incluir fecha y hora de la cita, tipo de valoración, instrucciones de preparación si las hay, datos de contacto del gimnasio, y opción de confirmación o reprogramación.'),
(14,4,2,1043134580,1,'7 horas','En caso de que la situación requiera votación o comentarios	Cuando el usuario vote o emita un concepto	El sistema registrará las votaciones (Aprobar/Desaprobar) o emita un concepto en tiempo real'),
(14,5,1,1130267265,1,'6 horas','al presionar la opción \"mi perfil\", se mostrara una vista donde se mostrará nombre completo, email, teléfono, documento y dos opciones \"editar perfil\" y \"cambiar contraseña\"'),
(14,6,4,1080570745,1,'6 horas','La persona no desea recibir notificaciones Cuando presione la opcion de no permitir Se le remitira de maner automatica al inicio de la plataforma '),
(14,12,5,1049931166,1,'1 horas','El usuario Iniciar sesión y entrar a la interfaz se da click en el botón guardar y se guarda el horario de los ambientes'),
(15,3,3,1044600666,1,'8 horas ','El panel debe mostrar recordatorios pendientes, enviados y fallidos, permitir cancelación manual de recordatorios específicos, y mostrar estadísticas de efectividad (confirmaciones recibidas).'),
(15,4,2,1043134580,1,'17 horas','En caso de que el usuario no este presente fisicamente en el comité	Cuando se habilite la opcion de participación remota	El sistema permitira la participacion remota en la pagina web'),
(15,5,1,1130267265,1,'3 horas','al presionar la opción \"editar perfil\"	se muestra un modal donde podrá editar el email, teléfono'),
(15,7,4,1080570745,1,'4 horas','En caso de que el psicólogo desee editar la historia Cuando presione la historia Abrirá a detalle la historia y podrá editarla'),
(15,13,5,1049931166,1,'5 horas','El usuario inicia sesión y entra al interfaz de soporte técnico da clic en el botón soporte de fichas se carga una interfaz en la que se puede reportar errores y comunicarse con los administradores'),
(16,4,2,1043134580,1,'9 horas','En caso de que se deba consultar los resultados de las votaciones o conceptos	Cuando se cierre el proceso de votación o debate	El sistema generará un resumen de las decisiones tomadas'),
(16,4,3,1043665064,1,'11 horas','El sistema valida los campos, encripta la contraseña y registra al nuevo usuario. Debe mostrar mensaje de éxito o error y almacenar el registro en la base de datos.'),
(16,5,1,1130267265,1,'3 horas','al presionar la opción \"cambiar contraseña\", se muestra un modal donde tendrá que escribir la contraseña actual, la contraseña nueva y confirmar la contraseña'),
(16,7,4,1080570745,1,'4 horas','En caso de que se desee agregar una historia nueva Cuando presione crear historia Desplegará una ventana donde se le permitirá al psicólogo ingresar datos personales del aprendiz, sus gustos y registrar su estado de ánim, la cual dicha ficha se guarda correctamente, quedando disponible para las consultas siguientes y así ver el avance.\r\n'),
(16,14,5,1044604785,1,'5 horas','El usuario inicia sesión y entra al interfaz de soporte técnico da clic en el soporte de horarios se cargó una interfaz en la que se puede reportar errores y comunicarse con los administradores'),
(17,4,3,1043665064,1,'11 horas','El sistema vincula correctamente el rol al usuario. El usuario tendrá acceso únicamente a las secciones asignadas a su rol.'),
(17,5,2,1043134580,1,'17 horas','En caso de que se requiera generar un reporte de aptitud de etapa productiva	Cuando el coordinador seleccione la opcion de reporte de aptitud	El sistema mostrará un listado de aprendices que hayan cumplido con todos los requisitos academicos\r\n'),
(17,6,1,1130267265,1,'3 horas','El instructor presiona la opción \"lista de aprendiz\" que esta en la barra lateral de la vista, se redireccionara a la vista donde esta el listado de todos los aprendices, en esta vista podrá filtrar la información por nombre, apellido, documento, programa y ficha'),
(17,7,4,1080570745,1,'5 horas','En caso de que se desee eliminar una historia \r\nCuando presione el botón eliminar Desplegará una mensaje, diciendo que se eliminó exitosamente la historia'),
(17,15,5,1044604785,1,'5 horas','El usuario inicia sesión y entra al interfaz de soporte técnico da clic en el soporte de asistencia se cargó una interfaz en la que se puede reportar errores y comunicarse con los administradores'),
(18,4,3,1043665064,1,'11 horas','El sistema permite registrar roles nuevos con nombre, descripción, y validación. Permite editar o eliminar roles existentes con control de errores.\r\n'),
(18,5,2,1043134580,1,'11 horas','En caso de que se desee filtrar por fechas o programas específicos	Cuando se aplique un filtro (por programa o fecha)	El sistema generará un reporte filtrado por programa académico o fechas específicas\r\n'),
(18,7,1,1130267265,1,'3 horas','tendrá que presionar la opción \"crear proyectos\", se redirecciona a otra vista donde tendrá que llenar datos como, \"nombre del proyecto\", \"objetivo general\", \"fecha de creación\", \"programa\" y \"creado por\" y presionar el botón guardar y se muestra una alerta donde diga \"proyecto creado correctamente\"'),
(18,7,4,1080570745,1,'4 horas','El aprendiz o persona ingresa a la app para solicitar orientación o seguimiento. La app solicita al aprendiz que registre su estado de ánimo al entrar.  Lograr guardar el estado de ánimo actual del aprendiz. El cual será reflejado en su ficha personalizada, actualizando automáticamente la información para el psicólogo.\r\n'),
(18,16,5,1044604785,1,'4 horas','El usuario inicia sesión entrar a interfaz de soporte técnico da click en soporte de inicio de sesión y se carga una interfaz en la que se puede reportar errores y comunicarse con los administradores'),
(19,4,3,1043665064,1,'11 horas','El sistema presenta lista de permisos. El administrador selecciona funcionalidades mediante checkboxes. Se guardan en la BD y se aplican automáticamente a los usuarios con ese rol.'),
(19,5,2,1043134580,1,'5 horas','En caso de que se quiera ver el detalle de un aprendiz específico	Cuando se seleccione un aprendiz en el reporte	El sistema mostrará los detalles del aprendiz, incluyendo su progreso académico, asistencia y evaluaciones'),
(19,7,1,1130267265,1,'8 horas','al presionar el botón guardar y tener campos con entradas vacías, se mostrara una alerta de \"creación fallida\"'),
(19,7,4,1080570745,1,'5 horas','El psicólogo necesita revisar la información de un aprendiz antes de una sesión de orientación.  El psicólogo accede al registro de fichas guardads de la app y selecciona la ficha del aprendiz.	Se muestran todos los datos de la ficha, incluyendo el estado de ánimo más reciente, gustos y datos personales. El \r\npsicólogo puede usar esta información para una orientación más precisa.'),
(19,17,5,1047222805,1,'2 horas','El usuario está en la interfaz de inicio de sesion el usuario da click en el boton de nombre \"soporte tecnico\" se carga una interfaz en la que se ven las diferentes opciones	'),
(20,4,3,1043665064,1,'11 horas','El sistema actualiza la información del usuario o bloquea su acceso. El estado se refleja claramente en la interfaz. No se elimina físicamente el registro.'),
(20,5,2,1043134580,1,'10 horas','En caso de que se requiera un informe en formato descargable	Cuando se solicite la descarga del reporte	El sistema generará un archivo descargable (PDF o Excel) con los datos de los aprendices aptos para la etapa productiva'),
(20,7,1,1130267265,1,'8 horas','al presionar el botón guardar y encontrar en el sistema un proyecto con el mismo nombre, se mostrara una alerta de \"proyecto existente\"'),
(20,8,4,1044607032,1,'5 horas','El aprendiz ingresa a la app para agendar una sesión. Elegir una fecha y hora disponibles en la app. A continuación, mostrará un mensaje comentando que la cita está a la espera de ser aceptada.\r\n'),
(21,4,3,1043665064,1,'11 horas','El sistema verifica el rol del usuario en cada acción. Si no tiene permiso, muestra “Acceso denegado” y registra el intento en el log para auditoría.\r\n'),
(21,5,2,1043134580,1,'7 horas','En caso de que un aprendiz haya cumplido con todos los requisitos	Cuando un aprendiz cumpla con los requisitos 	El sistema enviará una alerta automática al aprendiz y al coordinador indicando que está apto para la etapa productiva'),
(21,8,1,1130267265,1,'8 horas','cuando presione la opción \"asignar proyectos\" que esta en el lado lateral de la vista, se redirecciona a una vista donde aparecerá los proyectos ya creados dependiendo del área del instructor, tendrá el nombre, un código, fecha de creación, estado, programa y un botón de \"ver mas\", al presionar el botón \"ver mas\" se redireccionara otra vista donde este el proyecto mas detallado y un botón de \"solicitar proyecto\"'),
(21,8,4,1044607032,1,'4 horas','La sesion agendada por el aprendiz se aproxima   La app envía recordatorios al aprendiz y al psicólogo antes de la sesión programada.   llega mensaje de notificación automática a ambas partes con un recordatorio antes de la sesión, para asegurar que estén preparados, y en caso de que no, cancelar la sesión o en su defecto aplazarla \r\n'),
(22,5,3,1047336800,1,'12 horas','La aplicación almacenará los datos de las valoraciones de los clientes en una base de datos.'),
(22,6,2,1043134580,1,'7 horas','En caso de que se deba evaluar los conocimientos y habilidades técnicas de un aprendiz	Cuando se inicie el proceso de evaluación técnica	El sistema permitirá evaluar al aprendiz en diversas competencias técnicas (por ejemplo: uso de herramientas, solución de problemas)'),
(22,8,1,1130267265,1,'4 horas','al presionar el botón \"solicitar proyecto\", se le enviara una notificación al administrador para que de el permiso de que ese instructor pueda asignar ese proyecto y si el administrador permite el permiso, se le notificara al instructor que puede asignar ese proyecto'),
(22,9,4,1044607032,1,'6 horas','En caso de que, el profesional desee habilitarle la opción de realizar el test	al precionar la \r\nopción habilitar Se mostrará un mensaje mostrando que la autoevaluación ha sido activada.\r\n'),
(23,5,3,1047336800,1,'12 horas','El modelo debe incluir tablas para clientes, valoraciones, ejercicios, citas, etc con relaciones bien definidas, índices apropiados, y capacidad de escalabilidad futura.'),
(23,6,2,1043134580,1,'6 horas','En caso de que se quiera evaluar las actitudes y comportamientos del aprendiz	Cuando se realice la evaluación actitudinal	El sistema permitirá calificar aspectos como trabajo en equipo, puntualidad, compromiso y responsabilidad'),
(23,8,1,1130267265,1,'4 horas','en caso de asignar un proyecto, tendrá que seleccionarlo y presionar el botón \"asignar\"; luego se mostrara un stepper donde el instructor tendrá que seleccionar una ficha, seleccionar los aprendices para crear un grupo y por ultimo asignarle el rol a cada aprendiz'),
(23,9,4,1044607032,1,'4 horas','Al habilitar el test, una notificación debe aparecer automáticamente al inicio de la app, invitando al aprendiz a completarlo.'),
(24,5,3,1047336800,1,'12 horas ','La base de datos debe crear todas las tablas con constraints apropiados, establecer relaciones foreign key, configurar respaldos automáticos, y optimizar para consultas de valoración.'),
(24,6,2,1043134580,1,'2 horas','En caso de que el evaluador quiera ofrecer feedback sobre el desempeño del aprendiz	Cuando se complete la evaluación	El sistema permitirá al evaluador dejar comentarios y observaciones sobre los puntos a mejorar'),
(24,9,1,1130267265,1,'4 horas','cuando presione la opción \"ver proyectos\" que esta en el lado lateral de la vista, se mostraran todas las fichas activas y un botón de detalle, al presionarlo se redireccionara a una vista donde estén todos los proyectos asignados a esa ficha y/o programa y se podrá buscar por medio de un filtrado'),
(24,10,4,1044607032,1,'6 horas','Se mostrará una sección dedicada a la educación sobre enfermedades mentales, accesible desde el menú principal'),
(25,5,3,1047336800,1,'12 horas','Las APIs deben manejar operaciones CRUD completas, validar datos de entrada, manejar errores gracefully, y mantener logs de auditoría para cambios críticos.'),
(25,6,2,1043134580,1,'4 horas','En caso de que se necesite un informe completo de la evaluación	Cuando se solicite la generación del informe	El sistema generará un informe combinando los aspectos técnicos y actitudinales, con notas y retroalimentación detallada'),
(25,9,1,1130267265,1,'5 horas','al presionar el botón \"detalle\"	se redireccionara a una vista donde habrá un listado con todos los proyectos pertenecientes a esa ficha y un botón de \"ver mas\"'),
(25,10,4,1044607032,1,'8 horas','En caso de que el usuario desee saber sobre una enfermedad en especial de la lista Debe clickear sobre el nombre de la enfermedad A continuación, la página se deslizará hasta donde se encuentre esta información\r\n'),
(26,5,3,1047336800,1,'12 horas','El sistema debe validar formato de emails, números de teléfono, rangos de mediciones corporales y fechas coherentes.'),
(26,6,2,1043134580,1,'6 horas','En caso de que un aprendiz necesite mejorar en alguno de los aspectos evaluados	Cuando el aprendiz reciba una evaluación baja en ciertos aspectos	El sistema enviará una alerta para que el coordinador o el instructor realicen un seguimiento al aprendiz\r\n'),
(26,9,1,1130267265,1,'5 horas','al presionar el botón \"ver más\"	 se redireccionara a una vista donde habrá mas información detallada del proyecto, los miembros, el objetivo general y 4 botones \"editar aprendiz\", \"historias de usuarios\", \"criterios de aceptación\", \"ver reuniones\" y \"crear sugerencias\"'),
(26,11,4,1010006601,1,'6 horas','Se mostrarán las opiniones de las personas que escriban en este blog, de forma cronológica'),
(27,6,3,1047336800,1,'12 horas','La base de datos almacenará la base de datos de los clientes de manera local.'),
(27,7,2,1042852867,1,'11 horas','Buscar y seleccionar el perfil del aprendiz que \nha recibido la atención en clase\"	Buscar aprendices por nombre, ficha o programa	\"Lista de aprendices coincidentes al ingresar los\n criterios de búsqueda\"'),
(27,9,1,1130267265,1,'4 horas','si quiere agregar mas aprendices al grupo de trabajo tendrá que presionar el botón \"editar integrantes\", se redireccionará a una vista donde estarán los integrantes del grupo y dos botones \"añadir aprendiz\" y \"eliminar aprendiz\"'),
(27,11,4,1010006601,1,'4 horas','En caso de que el \r\nusuario desee ingresar una opinión sobre un comentario Debe presionar el botón comentar Se desplegará el campo donde comentará'),
(28,6,3,1047336800,1,'12 horas',' La instalación debe configurar automáticamente una base de datos local (SQLite/Postgres), crear estructura inicial, e inicializar con datos básicos sin requerir conexión a internet.\r\n'),
(28,7,2,1042852867,1,'10 horas','Generar items de llamado de atención	Crea un nuevo ítem de llamado de atención.	\"Mostrar el ítem\nde llamado de atención\"\r\n'),
(28,9,1,1130267265,1,'4 horas','al presionar el botón \"añadir aprendiz\"	se mostrara una lista de todos los aprendices de esa ficha donde tendrá que seleccionar los aprendices que desee, al presionar el botón \"aceptar\" se mostrara una alerta donde confirme la accion anterior'),
(28,11,4,1010006601,1,'7 horas','En caso de que el usuario quiera comentar, tendrá un campo donde podrá escribir su opinión'),
(29,6,3,1047336800,1,'12 horas','Todos los datos sensibles deben encriptarse automáticamente antes del almacenamiento usando algoritmos seguros.'),
(29,7,2,1042852867,1,'6 horas','Generar automaticamente ID del registro	\"Se asigna un ID único a\n cada registro de llamado de atención al ser creado.\"	Se visualiza el ID único \r\n'),
(29,9,1,1130267265,1,'4 horas','al presionar el botón \"eliminar aprendiz\", se mostraran los aprendices que conforman el grupo de proyecto donde puede seleccionar el aprendiz que desee eliminar, al presionar el botón \"aceptar\" se mostrara una alerta donde confirme la acción anterior'),
(29,11,4,1010006601,1,'5 horas','En caso de que el aprendiz/usuario desee buscar  deberá dar click en el icono de buscar A continuación, desplegará el campo donde deberá escribir lo que desee buscar, y como resultado, se deslizará hacia el comentario que contenga lo buscado anteriormente'),
(30,6,3,1047336800,1,'12 horas','El sistema debe requerir autenticación obligatoria, mantener sesiones con timeout automático, y registrar todos los accesos para auditoría.'),
(30,7,2,1042852867,1,'7 horas','Enviar notificación automática al \ndepartamento de Bienestar una vez que se \nhaya registrado el llamado de atención\"	\"Se envía automáticamente una\n notificación al departamento de\n Bienestar.\"	\"La notificación llega al\n departamento de bienestar\n de inmediato.\"\r\n'),
(30,10,1,1130267265,1,'4 horas','al presionar la opción ver proyectos se muestra la vista donde están todos los proyectos por fichas y programas, presiona la opción detalles y se muestra la vista de todos los proyectos de esa ficha, al presionar ver mas se muestra la vista con todo el detalle del proyecto y 5 botones, al presionar historia de usuario se redirecciona el listado de todas las historias de usuarios con el id, titulo, descripción y puntaje'),
(30,12,4,1010006601,1,'7 horas','En caso de que el usuario quiera ingresar a ver su perfil Deberá presionar el icono de perfil A continuación, redireccionará al usuario a una página donde mostrará sus datos'),
(31,6,3,1047336800,1,'12 horas','La documentación debe incluir procedimientos de backup, cambio de contraseñas, actualizaciones de seguridad, y protocolos en caso de incidentes de seguridad.'),
(31,8,2,1042852867,1,'9 horas','Acceso al historial de reportes del aprendiz	Acceder a todos los reportes de un aprendiz.	\"Se despliega un rubro de \ntodos los resportes del \naprendiz\"'),
(31,11,1,1130267265,1,'4 horas','al presionar la opción ver proyectos se muestra la vista donde están todos los proyectos por fichas y programas, presiona la opción detalles y se muestra la vista de todos los proyectos de esa ficha, al presionar ver mas se muestra la vista con todo el detalle del proyecto y 5 botones, al presionar criterios de aceptación se redirecciona el listado de todas los criterios de aceptación con el id, id de la historia de usuario, descripción, estado, tiempo y responsable'),
(31,12,4,1010006601,1,'7 horas','En caso de que el usuario desee añadir o editar  su información  Cuando de click sobre el botón \"Editar información\" Se redireccionará al \r\nusuario una página donde podrá añadir o editar su información'),
(32,7,3,1043665064,1,'13 horas','El login debe darle acceso al administrador correspondiente al aplicativo'),
(32,8,2,1042852867,1,'3 horas','Marcar el estado de un caso como \"Pendiente\", \"En seguimiento\" y \"Cerrado\"	\"Marcar en una opción designada\nel estado del caso\"	\"Los casos se actualizan con su\n estado actual\"'),
(32,12,1,1130267265,1,'4 horas','tendrá que presionar la opción \"ver proyectos\" se redireccionara a una vista donde estarán 5 botones y deberá presionar el botón \"ver reuniones\"	se redireccionara a una vista donde estén las reuniones clasificadas según el tipo, es decir, \"planning\", \"sprint\", \"daily\", \"retrospectiva\" y \"review\".'),
(32,12,4,1010006601,1,'4 horas','En caso de que el aprendiz/usuario desee añadir una foto a su perfil, deberá dar click en la foto predeterminada, y se mostrará un campo de tipo archivo donde se elegirá la foto'),
(33,7,3,1043665064,1,'13 horas','El sistema debe validar credenciales contra base de datos encriptada, implementar protección contra ataques de fuerza bruta, mantener sesiones seguras, y proporcionar logout seguro'),
(33,8,2,1042852867,1,'6 horas','Colocar un comentario describiendo el proceso que se le realiza al aprendiz	Añadir información adicional al caso del aprendiz que se guarda junto con el caso.	\"Se añade correctamente la \ninformación y es visible para \nlos miembros\"'),
(33,12,1,1130267265,1,'4 horas','al presionar el cuadro de reuniones \"planning\" se redireccionara a una vista donde se mostrara una lista con todas las reuniones realizadas por ese grupo de proyecto y la opción de filtrar por fecha '),
(33,12,4,1129534383,1,'5 horas','En caso de que el aprendiz/usuario desee buscar deberá dar click en el icono de buscar A continuación, desplegará el campo donde deberá escribir lo que desee buscar, y como resultado, se deslizará hacia el comentario que contenga lo buscado anteriormente'),
(34,7,3,1043665064,1,'13 horas','El sistema debe definir roles claros (Administrador, Valoradora, Fisioterapeuta), asignar permisos granulares por funcionalidad, y permitir modificación de roles por administradores\r\n'),
(34,8,2,1042852867,1,'8 horas','Filtrar los reportes de un aprendiz\npor estado\"	\"filtrar los reportes según el estado\n seleccionado (Pendiente, En seguimiento, Cerrado).\"	\"Se despliega la lista de los\nreportes por un estado\npre-seleccionado\"'),
(34,12,1,1130267265,1,'4 horas','al presionar el cuadro de reuniones \"sprint\" se redireccionara a una vista donde se mostrara una lista con todas las reuniones realizadas por ese grupo de proyecto y la opción de filtrar por fecha '),
(34,13,4,1129534383,1,'9 horas','Se le dará a elegir al usuario el nombre del profesional disponible en bienestar, y la razón por la cuál desea escribirle a esta persona'),
(35,7,3,1043665064,1,'13 horas',' El middleware debe interceptar todas las solicitudes, verificar permisos del usuario actual, denegar acceso si no está autorizado, y registrar intentos de acceso no autorizado\r\n'),
(35,9,2,1042852867,1,'12 horas','Buscar el perfil del aprendiz	\"Buscar aprendiz por \nnombre, ficha o programa\"	\"Lista de aprendices coincidentes al ingresar los\n criterios de búsqueda\"'),
(35,12,1,1130267265,1,'4 horas','al presionar el cuadro de reuniones \"daily meeting\", se redireccionara a una vista donde se mostrara una lista con todas las reuniones realizadas por ese grupo de proyecto y la opción de filtrar por fecha'),
(35,13,4,1129534383,1,'4 horas','Estará el campo siempre presente para la \r\nescritura, cuando se de click en el icono de envíar, se enviará el mensaje'),
(36,7,3,1043665064,1,'13 horas','La sesión debe expirar automáticamente después de inactividad, requerir re-autenticación para operaciones sensibles, y invalidar sesiones al cerrar la aplicación.\r\n'),
(36,9,2,1042852867,1,'9 horas','Visualizar el estado de un caso	\"Se ingresa al perfil y al registro de \nreportes del aprendiz\"	\"Se visualiza en que estado\nse encuentra el caso del\naprendiz\"'),
(36,12,1,1130267265,1,'4 horas','al presionar el cuadro de reuniones \"retrospectiva\", se redireccionara a una vista donde se mostrara una lista con todas las reuniones realizadas por ese grupo de proyecto y la opción de filtrar por fecha '),
(36,14,4,1129534383,1,'4 horas','En el inicio se mostrara un menú en donde se le muestre la opción de ver los videos, al hacer click se le redireccionara a una página en la cual se le mostraran los videos disponibles'),
(37,7,3,1043665064,1,'13 horas','La app debe ser capaz de mandar correos al momento de finalizar una valoración\r\n'),
(37,9,2,1042852867,1,'8 horas','Visualizar el proceso de un caso	\"Se ingresa al perfil y al registro de \nreportes del aprendiz\"	Se visualiza el comentario del caso del aprendiz'),
(37,12,1,1130267265,1,'10 horas','al presionar el cuadro de reuniones \"review\", se redireccionara a una vista donde se mostrara una lista con todas las reuniones realizadas por ese grupo de proyecto y la opción de filtrar por fecha '),
(37,15,4,1044607032,1,'5 horas','se le pedira al usuario un test diario para la evaluacion continua sobre su seguimiento se le hara llegar al usuario una notificacion de un test pendiente A continuacion el usuario sera redirigido a un test'),
(38,8,3,1043665064,1,'15 horas','El sistema debe conectar exitosamente con el servidor, autenticarse correctamente, y permitir envío de correos\r\n'),
(38,10,2,1042852867,1,'9 horas','Un espacio específico para que puedan públicar sus aportes	\"El usuario ingresa al apartado específico\npara publicar sus aportes\"	Mensaje de confirmación de que los documentos se publicaron correctamente.'),
(38,13,1,1130267265,1,'8 horas','tendrá que presionar la opción \"ver proyectos\", se redireccionara a una vista donde estarán 5 botones y deberá presionar el botón \"crear sugerencia\" donde tendrá que llenar campos como titulo y descripción'),
(38,15,4,1044607032,1,'4 horas','se le otorgara uan serie de preguntas que nos permitan evaluar su salud emocional en el momento Cuando presione click en presentar test se le planteara al usuario un test tipo encuesta con el que buscamos descifrar sus sintomas'),
(39,8,3,1043665064,1,'15 horas',' El sistema debe detectar automáticamente la finalización de la valoración, generar el correo con los resultados, y enviarlo al email del cliente registrado en un máximo de 5 minutos.\r\n'),
(39,10,2,1042852867,1,'3 horas','Visualizar la fecha y hora límite\npara la públicación de los aportes\"	\"Se muestra la fecha y hora \nlímite en la sección de aportes.\"	Fecha y hora predeterminda'),
(39,14,1,1130267265,1,'9 horas','tendrá que iniciar sesión correctamente aparecerá la interfaz principal y al presionar \"inicio\" le mostrara un resumen de las tareas activas, completadas, participación en reuniones, retroalimentaciones recibidas y diagramas representando el análisis de la participación en el proyecto'),
(39,15,4,1044607032,1,'6 horas','En \r\ncaso de que el usuario no resuelva todas las interrogantes del test Cuando presione click en enviar sin tener todas las respuestas en este momento le saltara una alerta en la que se requiere que todos los campos sean contestados correctamente'),
(40,8,3,1043665064,1,'5 horas',' El correo debe incluir logo del gimnasio, datos personalizados del cliente, resumen de resultados, recomendaciones, y información de contacto. Debe ser compatible con diferentes clientes de correo.\r\n'),
(40,10,2,1042852867,1,'17 horas','Los aportes deben ser visibles	Ingresar a la sección de aportes de una reunión	Acceder a los aportes públicados'),
(40,15,1,1130267265,1,'8 horas','tendrá que presionar la opción \"mi proyecto\" se redirecciona a una vista se mostrara cuantos aprendices conforman el grupo, la fecha asignada por el instructor, fecha fin, descripción, diagramas de entregables y avance del proyecto'),
(40,15,4,1044607032,1,'4 horas','cuando el usuario haya resuelto todas y cada una de las preguntas presentadas Presionara enviar con todo el test resuelto en este momento el usuario sera redirigido a la siguiente funcionalidad'),
(41,8,3,1043665064,1,'15 horas','El sistema debe registrar fecha/hora de envío, estado (enviado/fallido), destinatario, y tipo de correo. Debe mostrar estos datos en un log accesible para el administrador.\r\n'),
(41,11,2,1042852867,1,'15 horas','Crear una cuenta con correo eléctronico/usuario\n y contraseña\"	Creación de una cuenta con un correo electrónico y una contraseña válida.	\"Correo de confirmación de\nregistro\"'),
(41,16,1,1130267265,1,'10 horas','tendrá que presionar la opción \"historias de usuario\", se mostrara una vista donde estará un listado de todas las historias de usuarios con su id, titulo, descripción, puntaje y tres botones, \"crear\", \"editar\" y \"eliminar\"'),
(41,16,4,1080570745,1,'5 horas ','A continuacion el algoritmo va a evaluar las respuestas Se calculara cada una de las respuestas Conforme los parametros establecidos se le dara una respuesta la cual se le retornara un veredicto'),
(42,9,3,1048069515,1,'17 horas','La funcion se debe exportar de manera satisfactoria y sin comprometer la integridad de los datos\r\n'),
(42,11,2,1042852867,1,'11 horas','La contraseña debe cumplir con requisitos de\nseguridad\"	\"Aparece un indicativo de los \nrequisitos para la contraseña\"	\"La contraseña según las\ninstrucciones es válida\"'),
(42,16,1,1130267265,1,'9 horas','si quiere crear una historia de usuario	tendrá que presionar el botón \"crear\" y se redirecciona a otra vista donde tendrá que llenar los campos \"como\", \"quiero\", \"para\" , \"puntaje\" y presionar el botón guardar, en caso de tener campos con entradas vacías se mostrara un mensaje donde indique que campo esta vacío'),
(42,16,4,1080570745,1,'4 horas','Los resultados se regiran a unos porcentajes a consideracion de los especialistas de la \r\nsalud mental Se mostrara el porcentaje de su resultado El usuario podra ver el resultado con una escala de color la cual le dara un mejor entendimiento desde lo visual'),
(43,9,3,1048069515,1,'17 horas','La aplicación debe generar un reporte filtrado que incluya únicamente las valoraciones dentro del rango seleccionado, manteniendo el formato profesional y añadiendo información del período consultado en el encabezado del documento.\r\n'),
(43,11,2,1042852867,1,'10 horas','Iniciar sesión mediante correo/usuario\ny contraseña\"	\"iniciar sesión con las credenciales\n proporcionadas\"	acceder al sistema sin problemas'),
(43,16,1,1130267265,1,'5 horas','si quiere editar una historia de usuario tendrá que presionar el botón \"editar\", se redirecciona a una vista donde estarán dichos campos mencionados anteriormente y al presionar el botón \"guardar\" se mostrara un mensaje \"guardado exitosamente\"'),
(43,16,4,1080570745,1,'4 horas','En caso de que el resultado no sea critico se le haran llegar una serie de herramientas para controlar su salud mental y emocional Se mostrara las recomendaciones El usuario se le mostrara las herramientas propias de la aplicación como videos, articulos, chat, reuniones de salud mental o se le agendara cita con una de nuestras profesionales de la salud'),
(44,9,3,1048069515,1,'17 horas','La aplicación debe generar un reporte filtrado que incluya únicamente las valoraciones dentro del rango seleccionado, manteniendo el formato profesional y añadiendo información del período consultado en el encabezado\r\n'),
(44,11,2,1042852867,1,'9 horas','Mostrar mensaje de error si el usuario introduce\ncredenciales incorrectas\"	\"Se muestra un mensaje de error si las credenciales son\n incorrectas\"	\"Con un intento de 3 veces, se\ningresa nuevamente los datos\nhasta ser válidos\"'),
(44,16,1,1130267265,1,'10 horas','si quiere eliminar una historia de usuario tendrá que seleccionar la HU y presionar el botón \"eliminar\" y aparecerá una alerta confirmando esa acción'),
(44,16,4,1080570745,1,'4 horas','En caso de que el resultado de un porcentaje alto o muy alto se le dara la posibilidad de llamar a urgencias para ser atendido	Se redirigira a la app de llamas del movil	a continuacion se le dara la orden al usuario \r\nde dirigirse a un centro de salud mental para evitar autolesiones, mutilaciones, etc.'),
(45,9,3,1048069515,1,'17 horas','\"El sistema genera un gráfico lineal que muestre la evolución de métricas clave con:\n\n-Fechas \n\n-Puntos de datos marcados\n\nDescarga disponible como PNG o PDF, manteniendo calidad y legibilidad\n\n\"'),
(45,11,2,1042852867,1,'7 horas','Modificar contraseña desde configuración\n\"	\"Cambiar la contraseña desde\n la sección de configuración\"	\"Se modifica la contraseña\ncorrectamente\"'),
(45,17,1,1130267265,1,'8 horas','tendrá que presionar la opción \"criterios de aceptación\", se mostrara una vista donde estará un listado de todos los criterios de aceptación con su id, id de la HU, descripción, estado, tiempo, responsable y tres botones, \"crear\", \"editar\" y \"eliminar\"'),
(45,17,4,1010006601,1,'5 horas','A continuacion el usuario se dirigira a el apartado de funciones donde tendra diferentes opciones y elegira diario personal Se abrira la interfaz en donde estaran todas las anteriores anotaciones a continuacion el usuario podra decidir en ver anotaciones anteriores o crear un nuevo documento'),
(46,9,3,1048069515,1,'17 horas','La aplicación debe crear un gráfico multi-línea con diferentes colores para cada métrica seleccionada, incluyendo una leyenda clara que identifique cada línea y escalas apropiadas para permitir la comparación visual efectiva'),
(46,11,2,1042852867,1,'2 horas','Opción para recuperar la contraseña al iniciar sesión en la parte de abajo.	\"Presionar el botón de recuperación y\nen el correo llega los pasos a seguir\npara recuperar la contraseña\"	Recuperar contraseña'),
(46,17,1,1130267265,1,'9 horas','si quiere crear un criterio de aceptación, tendrá que presionar el botón \"crear\" y se redirecciona a otra vista donde tendrá que llenar los campos \"contexto\", \"evento\", \"resultado\", \"estado\", \"tiempo\", \"responsable\" y presionar el botón guardar, en caso de tener campos con entradas vacías se mostrara un mensaje donde indique que campo esta vacío'),
(46,17,4,1010006601,1,'5 horas','el usuario podra crear un nuevo documento en el cual se le presentara una secciones como situaciones, emociones y aprendizaje Se abrira una hoja de texto basada en una plantilla El usuario organizara mejor sus ideas mediante una plantilla que lo ayudara a plasmar todo su sentir y que aprendiizaje podra tomar de ello'),
(47,9,3,1048069515,1,'17 horas','El sistema debe permitir descargar el gráfico en alta resolución, manteniendo la calidad visual y incluyendo información contextual como el nombre del cliente, fechas del análisis y título descriptivo del gráfico'),
(47,12,2,1048277496,1,'10 horas','Estando en la interfaz de reporte.	Cuando seleccione una ficha	se muestran todas las actas correspondienes a esa ficha.'),
(47,17,1,1130267265,1,'8 horas','si quiere editar un criterio de aceptación, tendrá que presionar el botón \"editar\" y se redirecciona a una vista donde estarán dichos campos mencionados anteriormente y al presionar el botón \"guardar\" se mostrara un mensaje \"guardado exitosamente\"'),
(47,17,4,1080570745,1,'5 horas','El usuario podra darle una categoria a su anotacion para filtrar mucho mejor sus \r\nsituaciones diarias Se mostrara las anotaciones con un sistema de etiquetas El usuario podra acceder e identificar las anotaciones para asi mejorar su autoanalisis'),
(48,9,3,1048069515,1,'17 horas',' La aplicación debe mostrar junto al gráfico un panel con estadísticas relevantes como promedios, mejoras porcentuales, valores máximos y mínimos, y tendencias calculadas automáticamente a partir de los datos visualizados'),
(48,12,2,1048277496,1,'8 horas','Estando en la interfaz.	Cando presiono fecha.	Se muestran las actas dentro del rango de fechas.'),
(48,17,1,1130267265,1,'8 horas','si quiere eliminar un criterio de aceptación, tendrá que seleccionar el CA y presionar el botón \"eliminar\" y aparecerá una alerta confirmando esa acción'),
(48,17,4,1080570745,1,'5 horas','El usuario guardara el recordatorio en una interfaz simulando un diario fisico Se guardara el recordatorio y se mostrara como pagina a continuacion el documento guardado y anexado tendra la fecha y hora del momento que fue creado junto a las etiquetas puestas por el usuario'),
(49,10,3,1044600666,1,'19 horas','La imagen es añadida al reporte final de la valoración\r\n'),
(49,12,2,1048277496,1,'17 horas','Estando en las actas.	Cuando hago clic en una de ellas.	Se abre una vista detallada del documento.'),
(49,18,1,1130267265,1,'8 horas','tendrá que presionar la opción \"reuniones\", se mostrara una vista donde estará el listado de las reuniones con detalles específicos y un botón de \"crear reunión\"'),
(49,18,4,1129534383,1,'6 horas','En caso de que el usuario desee ver su historial de progresos escritos en el diario Se dará click en una opción llamada \"ver mi seguimiento\" A continuación, se desplegará una nueva ventana donde estará plasmado el historial de las notas escritas en el diario'),
(50,10,3,1044600666,1,'19 horas',' El sistema debe mostrar una galería organizada por categorías (ejercicios, anatomía, posturas), con vista de miniaturas, búsqueda por nombre o descripción, y previsualización al hacer hover.\r\n'),
(50,13,2,1048277496,1,'9 horas','Implementar un sistema de firma digital que utilice metodos seguros, como autenticacion de dos factores o certificados digitales, para validar la identidad del instructor	El sistema debe registrar la firma digital y la fecha, creando un historial para asegurar la trazabilidad.	Una vez firmada, el sistema debe enviar una notificacion informando que el acta ha sido firmada.'),
(50,18,1,1130267265,1,'8 horas','al querer crear una reunión, tendrá que presionar el botón \"crear reunión\", se redireccionara a una vista donde tendrá que llenar campos como, \"fecha y hora\", \"tipo de reunión\", \"lugar\", \"responsable, \"descripción\" y 1 botón de \"guardar\"'),
(50,18,4,1129534383,1,'6 horas','En \r\ncaso de que el usuario quiera realizar una busqueda por fecha Dará click en el icono de buscar A continuación mostrará el resultado de la busqueda'),
(51,10,3,1044600666,1,'19 horas','El sistema debe permitir añadir título, descripción detallada, tags/etiquetas, categoría, y notas de uso. Debe validar que todos los campos obligatorios estén completos.\r\n'),
(51,14,2,1048277496,1,'8 horas','La interfaz debe permitir seleccionar el aprendiz y acceder rapidamente a su informacion.	Debe incluir escala de ESAID para evaluar el compotamiento del aprendiz.	permitir al instructor agregar observaciones  cualitativas sobre el comportamiento y rendimiento del aprendiz.'),
(51,19,4,1081914694,1,'4 horas','En caso de que el usuario desee abandonar la app y borrar sus datos Se dará click en una opción llamada \"eliminar cuenta\" A continuación, se le pedira que ingrese la contraseña para eliminar la cuenta'),
(52,10,3,1044600666,1,'19 horas',' Debe abrirse un modal con la biblioteca de imágenes, permitir selección múltiple, mostrar vista previa antes de confirmar, y insertar las imágenes seleccionadas en la posición correcta del reporte.\r\n'),
(52,14,2,1048277496,1,'5 horas','Facilitar el registro de evaluaciones trimestrales, permitiendo que el instructor revise y compare el rendimiento a lo largo del tiempo	Proporcionar graficos o tablas que muestren el progreso del aprendiz en el tiempo, tanto en aspectos academicos como comportamentales.	permitir la exportacion de las evaluaciones y observaciones.'),
(52,18,1,1130267265,1,'8 horas','al presionar el botón \"guardar\", se mostrara una alerta de \"guardado exitosamente\" donde habrá dos botones \"aceptar\" y \"ver reunión\"'),
(52,19,4,1081914694,1,'4 horas','el usuario se le hara pregunta de confirmacion y se le mostrara el mensaje de que esta accion es irreversible se le mostrara un mensaje de \"estas seguro que quiere continuar\" El usuario podra decidir si quiere continuar con el proceso o retraerse'),
(53,10,3,1044600666,1,'19 horas ','Las imágenes deben cargarse progresivamente, mostrar thumbnails optimizados para navegación rápida, y comprimir automáticamente imágenes grandes sin perder calidad visual significativa.\r\n'),
(53,15,2,1048277496,1,'17 horas','La herramienta debe mostrar una lista clara de todas las competencias requeridas y aquellas que estan pendientes.	Permitir a los profesionales realizar evaluaciones en linea para cada competencia pendiente, proporcionando retroalimentacion inmediata sobre su desempeño.	Registrar el historial de evaluaciones realizadas, permitiendo a los usuarios ver su progreso y resultados a lo largo del tiempo.'),
(53,18,1,1130267265,1,'8 horas','al presionar el botón \"aceptar\", se quedara en la vista de crear reunión'),
(53,19,4,1044607032,1,'4 horas','El usuario decide no continuar con el proceso de eliminacion de cuenta	Se rediriga al inicio de la app	El usuario podra seguir \r\ncon su usuario y su informacion intacta'),
(54,10,3,1044600666,1,'19 horas','El sistema verifica el rol del usuario en cada acción. Si no tiene permiso, muestra “Acceso denegado” y registra el intento en el log para auditoría.'),
(54,16,2,1016011848,1,'8 horas','Analizar cada ficha incluyendo actividades que realizaron, resultados hasta la fecha y reunir informacion como avances y desempeño de la ficha.	Al finalizar la recopilacion y el analisis de los datos de cada ficha.	Se obtiene un resumen del estado de la ficha en general.'),
(54,18,1,1130267265,1,'8 horas','al presionar el botón \"ver reunión\", se redireccionara a la vista anterior que es donde se almacenaran todas las reuniones creadas en el sistema'),
(54,19,4,1044607032,1,'4 horas','El usuario decidio seguir con su procedimiento y elimina su usuario de inicio de secion El usuario saldra de la app a continuacion el usuario perderá su incio de seccion y la posibilidad de acceder a su informacion'),
(55,16,2,1016011848,1,'11 horas','redactar el acta siguiendo la estructura (encabezado, cuerpo, conclusion), siendo claro y con la informacion necesaria sobre el estado de la ficha.	Al momento de la redaccion del acta.	Se genera el documento que refleja los avances de la ficha.'),
(55,19,1,1130267265,1,'8 horas','tendrá que presionar la opción \"reuniones\", se mostrara una vista donde estará el listado de las reuniones con detalles específicos y un botón referente al estado'),
(56,16,2,1016011848,1,'6 horas','Enviar el acta a todos los miembros para su revisión final y aprobación.	Al enviar el acta para revisión y aprobación a los responsables.	Se confirma que todos los interesados están de acuerdo con el contenido'),
(56,19,1,1130267265,1,'8 horas','al presionar el botón referente al estado, si el estado es \"pendiente\" se mostrara un modal donde tendrá que llenar los campos relacionados con cada reunión y dos botones \"guardar\" y \"ver reuniones\"'),
(57,16,2,1016011848,1,'9 horas','Asegura que la información relevante esté accesible para todos, facilitando el seguimiento y mejorando la continuidad y eficiencia del trabajo de la ficha.	Después de la aprobación del acta final. 	Se asegura el acceso y la disponibilidad del acta para futuras consultas'),
(57,19,1,1130267265,1,'8 horas','al presionar \"guardar\" se mostrara un mensaje de éxito'),
(58,17,2,1016011848,1,'3 horas','Revisar el desempeño académico y el comportamiento de los aprendices para reconocer a quienes han destacado.	Se revisen las asistencias y los informes de comportamiento académico.	Se identifica a los aprendices que han demostrado un comportamiento ejemplar y disciplina.'),
(58,19,1,1130267265,1,'8 horas','en caso de dejar campos obligatorios con entradas vacías, se mostrara un mensaje de completar los campos'),
(59,17,2,1016011848,1,'4 horas','Redactar un mensaje de felicitación que resalte los logros y la importancia del buen comportamiento.	Luego de la selección de los aprendices con un buen desempeño academico	Se genera un documento oficial de reconocimiento que será registrado en la hoja de vida de cada aprendiz.'),
(59,19,1,1130267265,1,'8 horas','al presionar el botón \"ver reuniones\", se mostrara una vista donde estará el listado de todas las reuniones creadas, dependiendo del tipo de reunión que sea'),
(60,17,2,1016011848,1,'6 horas','Presentar oficialmente el reconocimiento a los aprendices, celebrando su esfuerzo y registrando su logro en su hoja de vida	Se entrega el reconocimiento a los aprendices durante una sesión especial o evento.	Los aprendices se sienten valorados y motivados, y su logro queda registrado oficialmente, fomentando un ambiente positivo en el grupo.'),
(60,20,1,1130267265,1,'8 horas','tendrá que presionar la opción \"observaciones\", se mostrara una vista donde estará la descripción de la observación, el área en donde se tiene que corregir, la fecha y el instructor que hizo la observación'),
(61,18,2,1016011848,1,'11 horas','Se inicia el acta registrando la fecha, hora y asistentes de la reunión	Al inicio de la reunión, se registra la fecha, hora y lista de asistentes.	Se establece un documento oficial que servirá de base para registrar los acuerdos y decisiones tomadas'),
(61,21,1,1130267265,1,'8 horas','en todas las vistas estara la opcion de ayuda y soporte en la parte lateral izquierda de cada vista	al presionar esa opcion	se redireccioonara a la vista de ayuda y soporte'),
(62,18,2,1016011848,1,'10 horas','Se documentan todos los acuerdos, decisiones y acciones asignadas durante la reunión.	Durante el desarrollo de la reunión, se documentan todos los acuerdos y decisiones que se tomen	Se crea un registro claro y detallado de lo discutido, útil para el seguimiento posterior.'),
(63,18,2,1016011848,1,'8 horas','Se concluye el acta, revisando su contenido y asegurando que todos los participantes firmen.	Al finalizar la reunión, se revisa el contenido del acta y se obtienen las firmas de los participantes.	El acta se convierte en un documento oficial y firmado, garantizando que todos los acuerdos quedan registrados y validados por los miembros del comité'),
(64,19,2,1016011848,1,'6 horas','Cada día, el instructor registra la asistencia de los aprendices. Se revisan las inasistencias para identificar la insasistencia como \"con excusa\" o \"sin excusa\" según la normativa establecida.	 Al registrar las asistencias diariamente	Se identifica a los aprendices que han acumulado más de dos inasistencias consecutivas sin justificación.'),
(65,19,2,1016011848,1,'7 horas','Al detectar que un aprendiz ha tenido más de dos inasistencias consecutivas y sin excusa, se activa un sistema automatizado que genera un mensaje de alerta.	Cuando se detecta que un aprendiz tiene más de dos inasistencias.	Se envía una notificación a coordinación informando sobre la situación del aprendiz.'),
(66,19,2,1016011848,1,'10 horas','Esto puede incluir revisar el historial del aprendiz, analizar posibles razones de las inasistencias y establecer contacto con el aprendiz para indagar sobre su situación.	Coordinación recibe la alerta y evalúa el caso del aprendiz.	Se implementan acciones preventivas para abordar la situación y reducir el riesgo de deserción, como contacto con el aprendiz o entrevistas de seguimiento.'),
(67,20,2,1016011848,1,'17 horas','El instructor accede al sistema utilizando sus credenciales (usuario y contraseña). Este proceso asegura que solo los usuarios autorizados puedan ingresar y gestionar la información de sus fichas	El instructor accede al sistema utilizando sus credenciales.	El sistema autentica al usuario y permite el acceso a la interfaz de gestión.'),
(68,20,2,1016011848,1,'8 horas','Una vez dentro, el sistema presenta automáticamente una lista que incluye solo las fichas activas asignadas al instructor. Este proceso de selección elimina cualquier información relacionada con fichas inactivas o históricas, asegurando que el instructor pueda concentrarse en las fichas importantes	Al ingresar, el sistema automáticamente muestra únicamente las fichas que están activas bajo la responsabilidad del instructor.	El instructor visualiza solo los datos relevantes de sus fichas activas,'),
(69,21,2,1042254436,1,'12 horas','El usuario accede al plataforma para revisar las anotaciones de los instructores.	El usuario selecciona una competencia específica (técnica o transversal).	Se muestran todas las anotaciones disponibles correspondientes a esa competencia sin errores, categorizadas de manera clara y completa.'),
(70,21,2,1042254436,1,'14 horas','El usuario necesita guardar las anotaciones para revisarlas offline o compartirlas.	El usuario selecciona la opción de exportar anotaciones en el formato deseado (PDF, Excel, etc.).	El sistema genera un archivo descargable con la información seleccionada, en el formato correcto y sin pérdida de datos.'),
(71,21,2,1042254436,1,'10 horas','Un usuario autorizado accede a la plataforma para revisar anotaciones.	El sistema verifica el rol del usuario y los permisos correspondientes.	El usuario solo puede acceder a las anotaciones que le corresponden según su rol, garantizando la protección de datos sensibles y evitando accesos no autorizados.'),
(72,22,2,1042254436,1,'6 horas','El usuario responsable (como un coordinador o administrador) necesita convocar a un comité extraordinario.	El usuario accede a la interfaz de convocatoria e introduce los detalles del comité (fecha, hora, motivo, participantes).	El sistema genera una convocatoria exitosa, mostrando todos los detalles introducidos sin errores y permitiendo su envío a los participantes.'),
(73,22,2,1042254436,1,'15 horas','El usuario necesita seleccionar los miembros del comité que deben asistir.	El usuario elige a los participantes de una lista predefinida o introduce sus datos manualmente.	El sistema permite seleccionar correctamente a los participantes relevantes para el comité, sin omitir a ningún miembro clave.'),
(74,22,2,1042254436,1,'3 horas','Un participante o administrador necesita consultar los detalles del comité extraordinario convocado	El usuario busca la información del comité dentro del sistema.	El sistema muestra de manera clara y rápida los detalles completos del comité (fecha, lugar, participantes, agenda) sin fallos.'),
(75,22,2,1042254436,1,'11 horas','Tras la reunión del comité, se requiere registrar los acuerdos y decisiones tomadas.	El organizador o secretario del comité introduce el acta o minuta de la reunión en la plataforma.	El sistema guarda correctamente el acta del comité, permitiendo que los participantes la consulten posteriormente.'),
(76,23,2,1042254436,1,'9 horas','el sistema programa un comité cada 3 meses	Se configura el sistema para crear comités periódicos con una frecuencia de tres meses.	El comité se programa automáticamente de manera puntual cada 3 meses sin intervención manual, respetando el calendario previsto.'),
(77,23,2,1042254436,1,'7 horas','Los participantes necesitan ser recordados sobre el comité antes de la fecha programada.	El sistema envía un recordatorio a los instructores y líderes de ficha con antelación (por ejemplo, una semana antes).	Los participantes reciben un recordatorio de la reunión con tiempo suficiente para organizar su asistencia, asegurando que la información sea clara y accesible.'),
(78,23,2,1042254436,1,'17 horas','Puede ser necesario ajustar la fecha o la hora del comité ya programado.	El sistema permite al usuario modificar la fecha o detalles del comité en caso de cambios imprevistos.	Las modificaciones se reflejan correctamente, y los participantes reciben una notificación con la actualización de la programación del comité.'),
(79,24,2,1042254436,1,'12 horas','Un administrador necesita crear una cuenta de usuario en el sistema y asignarles privilegios específicos según su rol.	\"El administrador ingresa los datos del usuario y selecciona su rol (como instructor, líder, o administrador).\n\"	El sistema crea el usuario correctamente y asigna los permisos adecuados según el rol, permitiendo acceso solo a las áreas relevantes del sistema.'),
(80,24,2,1042254436,1,'14 horas','Un administrador necesita modificar los privilegios de un usuario ya existente (añadir o retirar permisos).	El administrador accede a la interfaz de control de usuarios y cambia los privilegios asignados a un usuario específico.	El sistema actualiza los privilegios del usuario de manera inmediata, reflejando los cambios en tiempo real sin errores.'),
(81,24,2,1042254436,1,'17 horas','Un usuario intenta acceder a una sección o funcionalidad específica del sistema.	El usuario inicia sesión e intenta realizar una acción acorde a su rol.	El sistema valida los permisos del usuario y le permite o deniega el acceso dependiendo de los privilegios que le hayan sido asignados.'),
(82,25,2,1042254436,1,'8 horas','Un instructor o administrador necesita registrar una novedad de un estudiante.	El usuario accede al sistema e introduce la información relevante sobre la novedad (por ejemplo, ausencias, problemas de comportamiento, cambios de asignatura).	El sistema guarda la novedad de manera correcta, vinculándola al perfil del estudiante correspondiente'),
(83,25,2,1042254436,1,'10 horas','Los instructores o líderes de ficha deben ser informados automáticamente de las novedades relevantes de los estudiantes.	Se registra una novedad importante sobre un estudiante en el sistema.	Los instructores y líderes de ficha reciben una notificación automática con los detalles de la novedad'),
(84,25,2,1042254436,1,'9 horas','Solo usuarios autorizados (como instructores o líderes de ficha) deben poder ver, modificar o registrar novedades de estudiantes.	Un usuario intenta acceder a la funcionalidad de registro o consulta de novedades.	El sistema verifica los permisos del usuario y solo permite el acceso o las modificaciones a aquellos con los privilegios adecuados');

/*Table structure for table `detalle_parametro` */

DROP TABLE IF EXISTS `detalle_parametro`;

CREATE TABLE `detalle_parametro` (
  `det_par_ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id del detalle parametro',
  `det_par_descripcion` varchar(500) DEFAULT NULL COMMENT 'descripcion del detalle parametro',
  `par_ID_FK` int(11) DEFAULT NULL COMMENT 'id del parametro',
  PRIMARY KEY (`det_par_ID`),
  KEY `par_ID_FK` (`par_ID_FK`),
  CONSTRAINT `detalle_parametro_ibfk_1` FOREIGN KEY (`par_ID_FK`) REFERENCES `parametro` (`par_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_parametro` */

insert  into `detalle_parametro`(`det_par_ID`,`det_par_descripcion`,`par_ID_FK`) values 
(1,'por hacer',1),
(2,'en progreso',1),
(3,'hecho',1),
(4,'product owner',2),
(5,'scrum master',2),
(6,'scrum team',2),
(7,'aprendiz',3),
(8,'instructor',3),
(9,'administrador',3),
(10,'planificacion del sprint',4),
(11,'scrum diario',4),
(12,'revision del sprint',4),
(13,'retrospectiva del sprint ',4),
(14,'iniciar sesion',5),
(15,'ver proyectos asignados',5),
(16,'visualizar backlog',5),
(17,'ver y gestionar tareas asignadas',5),
(18,'reportar avances diarios',5),
(19,'subir entegrables del sprint',5),
(20,'presentar avances',5),
(21,'asignar proyectos a grupos de aprendices',5),
(22,'retroalimentar los proyectos',5),
(23,'visualizar el control de avance en cada grupo',5),
(24,'enviar notificaciones masivas o individuales',5),
(25,'habilitar o deshabilitar funciones del sistema',5),
(26,'gestionar copias de seguridad y actualizaciones',5),
(27,'administrar el ingreso de todos los usuarios',5),
(28,'crear proyectos formativos',5);

/*Table structure for table `historia_usuario` */

DROP TABLE IF EXISTS `historia_usuario`;

CREATE TABLE `historia_usuario` (
  `his_ID` int(11) NOT NULL COMMENT 'id de la historia de usuario',
  `pro_ID_FK` int(11) NOT NULL COMMENT 'El id del proyecto',
  `his_titulo` varchar(255) DEFAULT NULL COMMENT 'titulo de la historia de usuario',
  `his_descripcion` varchar(500) DEFAULT NULL COMMENT 'prioridada de la historia de usuario',
  `his_prioridad` varchar(50) DEFAULT NULL COMMENT 'numero de sprint de historia de usuario',
  `his_puntaje` int(20) DEFAULT NULL COMMENT 'puntaje de la historia de usuario',
  `his_numero_sprint` int(20) DEFAULT NULL COMMENT 'Es el número de sprint que se encuentra',
  `det_par_ID_estado_FK` int(11) DEFAULT NULL COMMENT 'Estado de la HU (To Do, Doing, Done)',
  PRIMARY KEY (`his_ID`,`pro_ID_FK`),
  KEY `pro_ID_FK` (`pro_ID_FK`),
  KEY `fk_hu_estado` (`det_par_ID_estado_FK`),
  CONSTRAINT `fk_historia_usuario_proyecto` FOREIGN KEY (`pro_ID_FK`) REFERENCES `proyecto` (`pro_ID`),
  CONSTRAINT `fk_hu_estado` FOREIGN KEY (`det_par_ID_estado_FK`) REFERENCES `detalle_parametro` (`det_par_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `historia_usuario` */

insert  into `historia_usuario`(`his_ID`,`pro_ID_FK`,`his_titulo`,`his_descripcion`,`his_prioridad`,`his_puntaje`,`his_numero_sprint`,`det_par_ID_estado_FK`) values 
(1,1,'registro','como instructor quiero registrar al aprendiz en el sistema para que acceda a la pagina','10',10,1,3),
(1,2,'almacenar datos','Como instructor, quiero guardar datos del estudiante y acudientes para notificar en caso de comité',NULL,5,NULL,3),
(1,3,'Registrar aprendiz','Como instructor quiero registrar datos del aprendiz para tener su información básica en el sistema','8',8,1,1),
(1,4,'Inicio de sesion como usuario\n','como usuario necesito iniciar sesion con la finalidad de poder acceder a la aplicacion','10',10,NULL,1),
(1,5,'inicio de sesion','como usuario ingreso las credenciales correctamente, si esta correcto me permite el ingreso','8',8,1,1),
(2,1,'iniciar sesion','como usuario quiero iniciar sesion para acceder al contenido principal','9',10,1,2),
(2,2,'Consultar historial de comités','Como instructor, quiero consultar historial de comités por ficha o aprendiz para verificar información.',NULL,5,NULL,1),
(2,3,'Registrar acudiente','Como instructor quiero registrar datos del acudiente para tener contacto en caso de emergencia','8',8,1,1),
(2,4,'Inicio de sesion como psicologo\n','como psicologo necesito iniciar sesion con la finalidad de acceder a la aplicacion','10',10,NULL,1),
(2,5,'interfaz de usuario','como usuario quiero acceder a la interfaz de usuario','8',8,1,1),
(3,1,'ayuda y soporte','como usuario del sistema quiero ver ayuda y soporte para guiarme al ingresar a la plataforma','8',8,1,2),
(3,2,'Reportar inasistencias y retardos con excusas','como instructor quiero reportar las inasistencias de cada aprendiz por horas y fecha a demas de los retardos y excusas para Controlar la deserción de los aprendices',NULL,5,NULL,1),
(3,3,'Registrar ubicación','Como instructor quiero registrar la ubicación del aprendiz para saber dónde reside','7',7,1,1),
(3,4,'material sobre la salud mental\n','como psicologo quiero que el aprendiz al entrar a la app pueda ver materail que trate de salud mental con la finalidad de orientar a los aprendices','10',10,NULL,1),
(3,5,'interfaz de ficha','como usuario quiero acceder a la interfafaz de ficha para ver la gestion de las fichas','7',7,NULL,1),
(4,1,'Recuperar Contraseña','como usuario quiero recuperar mi contraseña para recuperar el acceso al sistema','8',10,1,1),
(4,2,'Aprobación y conceptos remotos sobre temas a debatir','como coordinador quiero Aprobar, desaprobar o conceptuar remotamente para controlar situaciones sin presencia físic',NULL,5,NULL,1),
(4,3,'Consultar y editar datos','Como instructor quiero consultar y editar los datos de los aprendices o acudientes en cualquier momento','9',9,1,1),
(4,4,'notificaciones visibles\n','como psicologo quiero que exista una campana de notificaciones acerca de alguna solicitud de cita o mensaje con la finalidad de garantizar una atencion oportuna hacia los aprendices','9',9,NULL,1),
(4,5,'asistencia','como usuario quiero registrar la asistencia de los aprendices en la bitacora para mantener un seguimiento de su participacion','8',8,NULL,1),
(5,1,'perfil_usuario','como Usuario del sistema quiero ingresar a mi perfil para cambiar mis datos o cambiar de contraseña','8',7,1,1),
(5,2,'Reporte de aprendices aptos para etapa productiva','como asistencias quiero Reporte de aprendices aptos para etapa productiva para identificar qué aprendices han cumplido con los requisitos académicos y están preparados para iniciar la etapa productiva de su formación',NULL,5,NULL,1),
(5,3,'Consultar historial de comités','Como instructor quiero consultar el historial del comité para evaluar decisiones pasadas','9',9,1,1),
(5,4,'historial de registros de atencion\n','como psicologo quiero que se pueda delar un registro de atenciones tanto por citas, mensajes, etc con la finalidad de tener informacion detallada de los anteriores pacientes','10',10,NULL,1),
(5,5,'interfaz de horario','como usuario quiero poder ver los horarios de ambientes para poder ver que dias estan disponibles','9',9,NULL,1),
(6,1,'listado-aprendices','como instructor quiero ver el listado de todos los aprendices para saber cuantos hay en cada ficha','9',10,1,1),
(6,2,'Evaluar aspectos tecnicos - actitudinales\r\n\r\n\r\n\r\n\r\n','como asistencias quiero Evaluar aspectos tecnicos y actitudinales para valuar no solo el conocimiento técnico de los aprendices, sino también sus comportamientos, actitudes y competencias blandas, lo cual es esencial para su desarrollo profesional',NULL,5,NULL,1),
(6,3,'Consultar historial por aprendiz','Como instructor quiero consultar el historial del comité por aprendiz específico','8',8,1,1),
(6,4,'recibir notificacion por otras plataformas\n','como psicologo quiero recibir una notificacion ya sea por whatsapp, correo cuando se envie alguna informacion desde la aplicacion para estar al tanto de las acciones realizadas con la finalidad de estar al tanto en tiempo real sin necesidad de abrir la app','8',8,NULL,1),
(6,5,'Interfaz de calificaciones ','como usuario quiero poder gestionar las calificacionnes de los aprendices para saber las calificaciones ','7',7,NULL,1),
(7,1,'crear_proyectos','como instructor quiero crear proyectos formativos para ponerlos en desarrollo','8',10,1,1),
(7,2,'Reportar en comité llamados de atención a aprendices','como instructor, quiero reportar aprendices al comité para seguimiento con Bienestar',NULL,5,NULL,1),
(7,3,'Registrar inasistencias','Como instructor quiero registrar las inasistencias para tener control de la asistencia de los aprendices','10',10,1,1),
(7,4,'perzonalisacion de historias para claridad de datos','como psicologo quiero crear historias personalizadas de cada persona con sus datos personales, gustos y estados de animos al momento de entrar a la app para tener informacion mas concreta de cada uno a la hora de solicitar orientacion','10',10,NULL,1),
(7,5,' Busqueda de fichas','como usuario quiero buscar fichas especificas para poder encontrar rapidamente la informacion necesaria','9',9,NULL,1),
(8,1,'asignar_proyectos','como instructor quiero asignar los proyectos formativo a los grupos de aprendices para que cada aprendiz tenga y cumpla un proyecto en la duración del programa tecnólogo','10',8,1,1),
(8,2,'Acceder al historial del aprendiz','como bienestar quiero acceder al historial de aprendiz para gestionar cada caso de manera más eficiente',NULL,5,NULL,1),
(8,3,'Registrar retardos','Como instructor quiero registrar los retardos con sus respectivas horas','9',8,1,1),
(8,4,'agendacion de citas\n','como psicologo quiero que cada aprendiz pueda agendar sus visitas en la app, ya sea por chat o hablar directamente con el profesional para poder tener sesiones de orinetacion segun la disponibilidad','10',10,NULL,1),
(8,5,'Filtrado de ficha','como usuario quiero filtrar fichas especificas para poder encontrar rapidamente la informacion necesaria','7',7,NULL,1),
(9,1,'ver_proyectos','como instructor quiero ver los proyectos formativos por ficha para ver el proceso de cada grupo','10',9,1,1),
(9,2,'Historial de seguimiento en Bienestar','como instructor quiero  Ver en el sistema el seguimiento que Bienestar hace tras un llamado de atención o plan de mejoramiento para hacerle seguimiento al \naprendiz',NULL,5,NULL,1),
(9,3,'Subir excusas','Como instructor quiero permitir subir excusas justificando inasistencia o retardo','8',8,1,1),
(9,4,'testing para monitoreo de emociones\n','como psicologo quiero que la app tenga la opcion de realizar un test de ansiedad y adiccion para poder identificar de manera rapida y efectiva el nivel de ansiedad de cada uno y brindarles apoyo adecuado','10',10,NULL,1),
(9,5,'Detalles de ficha','como usuario quiero acceder a los detalles de una ficha en especifico para revisar la informacion relevante y gestionar','8',8,NULL,1),
(10,1,'ver_HU','como instructor quiero visualizar las historias de usuarios para ver los requerimientos que se necesitan para que el cliente final quede satisfecho','10',10,1,1),
(10,2,'Aportes previos al comité','como instructor quiero hacer mis aportes al comité\nantes de la fecha de\nreunión para tener la información lista\ny evitar contratiempos',NULL,5,NULL,1),
(10,3,'Generar reporte de asistencia','Como instructor quiero generar un reporte de asistencia detallado con inasistencias, retardos y excusas','9',8,1,1),
(10,4,'informacion detallada de enfermedades \n','como usuario quiero que me expliquen que son las enfermedades mentales y que tipos hay para tener mas conocimiento de estas y poder identificar si necesito un diagnostico por un profesional','10',10,NULL,1),
(10,5,'descargar asistencia','como usuario quiero descargar la asistencia por medio de un pdf para encontrar la informacion necesaria','6',6,NULL,1),
(11,1,'ver_CA','como instructor quiero visualizar los criterios de aceptación para ver las funcionalidades y objetivo de cada proyecto','7',9,1,1),
(11,2,'Registro, cambio y recuperación de usuario y contraseña','como instructor quiero Tener registro de mi usuario y\n contraseña, para poder cambiar\nla clave y también poder \nrecuperarla para tener acceso al sistema',NULL,5,NULL,1),
(11,3,'Votar decisiones en comité','Como coordinador quiero aprobar o desaprobar temas del comité para resolver situaciones sin presencia física','8',8,1,1),
(11,4,'informacion de otros usuarios\n','como usuario quiero acceder a un blog en la aplicacion para poder ver opciones personales de otras personas','9',9,NULL,1),
(11,5,'Edicion de asistencia','como usuario quiero editar registros de asistencia para poder corregir errores al registro de asistencia','7',7,NULL,1),
(12,1,'ver_reuniones','como instructor quiero ver las reuniones realizadas por el grupo de proyecto para ver el avance que van teniendo ','9',9,1,1),
(12,2,'Interfaz para ver actas del comité por ficha y fecha','como secretaria quiero una interfaz de reportes para ver actas del comite por ficha y hora para nn caso de requerirlo tenerlo a la mano',NULL,5,NULL,1),
(12,3,'Conceptuar remotamente','Como usuario quiero agregar análisis o comentarios remotamente sobre situaciones del comité','8',8,1,1),
(12,4,'editar informacion de perfil\n','como usuario quiero acceder a mi perfil para poder editar, ver o eliminar algun dato o parametro','9',9,NULL,1),
(12,5,'creacion de horario','como usuario quiero poder crear horarios para cada ambiente y poder asignar horarios para cada ambiente y organizar las horas','5',5,NULL,1),
(13,1,'crear_sugerencia','como instructor quiero crear una sugerencia para algún cambio u opinión en el proyecto  ','9',9,1,1),
(13,2,'firmar digitalmente actas del comité con verificación de identidad','como instructor quiero crear una sugerencia para algún cambio u opinión en el proyecto  ',NULL,5,NULL,1),
(13,3,'Participación remota','Como usuario quiero participar remotamente en comités desde la web','8',8,1,1),
(13,4,'comunicarce con profecional de bienestar\n','como usuario quiero que tenga la opcion de contactar con un profesional de bienestar para poder interactuar con esa persona por chat','10',10,NULL,1),
(13,5,'soporte tecnico (interfaz de ficha)','como usuario quiero poder tener un apartado de soporte para tener una forma de reportar errores en este apartado','7',7,NULL,1),
(14,1,'acceder a la interfaz','como aprendiz quiero acceder a la interfaz principal para trabajar en mi proyecto formativo asignado','9',9,1,1),
(14,2,'evaluar comportamiento con escala ESAID y observaciones\n\n\n\n\n\n\n\n\n\n','como instructor quiero evaluar comportamiento con escala ESAID y observaciones para controlar el rendimiento academico y comportamental de cada aprendiz por trimestre',NULL,5,NULL,1),
(14,3,'Reporte de aptitud','Como coordinador quiero generar reporte de aprendices aptos para etapa productiva','9',9,1,1),
(14,4,'videos de ejercicios de yoga \n','como usuario quiero que tenga videos de ejercicios de yoga para aprender a liberar estres y tener mas control sobre mis pensamientos','8',8,NULL,1),
(14,5,'soporte tecnico (horarios)','como usuario quiero poder tener un apartado de soporte para tener una forma de reportar errores en este apartado','5',5,NULL,1),
(15,1,'ver mi proyecto','como aprendiz quiero ver mi proyecto para trabajar en el','9',8,1,1),
(15,2,'Evaluar competencias pendientes','como profecional asistencial quiero evaluar competencias pendientes para identificar areas de mejora y asegurarme de cumplir con los requisitos de formacion',NULL,5,NULL,1),
(15,3,'Filtrar reportes','Como usuario quiero filtrar por fechas o programas para generar reportes específicos','8',8,1,1),
(15,4,'test rapidos de sintomas\n','como psicologo quiero un test rapido de sintomas con la finalidad de detectar sintomas','10',10,NULL,1),
(15,5,'soporte tecnico (asistencia)','como usuario quiero poder tener un apartado de soporte para tener una forma de reportar errores en este apartado','9',9,NULL,1),
(16,1,'historias de usuarios','como aprendiz quiero entrar a las historia de usuario para establecer las funcionalidades que se harán para satisfacer las necesidades del cliente final','9',8,1,1),
(16,2,'Realizar actas de seguimiento','como asistencia quiero realizar actas de seguimiento a la ficha en general para garantizar un seguimiento, comunicación clara y la rendición de cuentas en la gestión de la ficha',NULL,5,NULL,1),
(16,3,'Ver detalle de aprendiz','Como usuario quiero ver detalles de un aprendiz específico en los reportes','8',8,1,1),
(16,4,'evaluacion post test\n','como psicologo quiero una evaluacion por test con la finalidad de evaluar al paciente y darle los pasos a seguir','10',10,NULL,1),
(16,5,'soporte tecnico (inicio de sesion)','como usuario quiero poder tener un apartado de soporte para tener una forma de reportar errores en este apartado','7',7,NULL,1),
(17,1,'criterios de aceptacion','como aprendiz quiero entrar a los criterios de aceptación para implementarlo en el proceso de desarrollo del proyecto','7',8,1,1),
(17,2,'Reconocimiento a buen comportamiento','como instructor quiero felicitar a los aprendices que tienen excelente comportamiento academico y disciplina para dejar registro en su hoja de vida y sirva de premio para el buen comportamiento',NULL,5,NULL,1),
(17,3,'Informe descargable','Como usuario quiero descargar los reportes en PDF o Excel para archivarlos','9',9,1,1),
(17,4,'diario o seguimiento del progreso\n','como usuario quiero un diario donde pueda plasmar mis progresos, sentimientos y emociones','10',10,NULL,1),
(17,5,'interfaz de soporte tecnico','como usuario quiero poder tener un apartado de soporte para tener una forma de reportar errores en este apartado','8',8,NULL,1),
(18,1,'reuniones','como aprendiz quiero entrar a las reuniones para implementarlo en el proceso de desarrollo de proyecto','8',8,1,1),
(18,2,'Abrir y cerrar las actas de comité','como secretaria quiero abrir y cerrar las actas de comité para dejar cosnignado y firmado, todos los acuerdos de la reunión',NULL,5,NULL,1),
(18,3,'Evaluación técnica','Como instructor quiero evaluar conocimientos técnicos del aprendiz','8',8,1,1),
(18,4,'historial del diario\n','como usuario quiero un historial de las anotaciones escritas en el diario para poder tener un mejor seguimiento mental de uno mismo','10',10,NULL,1),
(19,1,'informes','como aprendiz quiero subir los informes de cada reunión realizada para llevar el orden del proyecto','9',8,NULL,1),
(19,2,'mensaje de alerta','como instructor quiero Que sa active un  mensaje de alerta a  coordinación cuando el  aprendiz se le reporte más de dos inasistencias consecutivas y sin excusa para controlar la deserción',NULL,5,NULL,1),
(19,3,'Evaluación actitudinal','Como instructor quiero evaluar actitudes y comportamientos del aprendiz','8',8,1,1),
(19,4,'eliminar cuenta','como usuario quiero eliminar mi cuenta','10',10,NULL,1),
(20,1,'observaciones','como aprendiz quiero ver las observaciones que han hecho los instructores para ver en que fallamos y mejorar','6',6,NULL,1),
(20,2,'ingresar al sistema','como instructor quiero Ingresar al sistema y que solo me aparezcan datos de mis fichas activas para no perder el tiempo en fichas que ya no están fuera de permanencia o históricas',NULL,5,NULL,3),
(20,3,'Feedback del evaluador','Como evaluador quiero dejar comentarios sobre el desempeño del aprendiz','7',7,1,1),
(21,1,'soporte','como usuario quiero entrar a la pagina de ayuda y soporte para tener acceso a las preguntas frecuentes en cualquier momento','6',6,NULL,1),
(21,2,'anotaciones por competencias\n\n\n\n\n\n\n\n\n','como instructor quiero una interfaz donde pueda ver todas las anotaciones de los instructores para ver el rendimiento del aprendiz de forma integral',NULL,5,NULL,1),
(21,3,'Informe de evaluación','Como usuario quiero obtener un informe con resultados técnicos y actitudinales','9',9,1,1),
(22,2,'cita a comité extraordinario ','como instructor quiero citar a comité extraordinario para convocar al equipo ejecutor de la ficha y debatir situaciones extraordinarias',NULL,5,NULL,1),
(22,3,'Buscar aprendiz con llamado de atención','Como instructor quiero buscar el perfil de un aprendiz que recibió un llamado de atención','8',8,1,1),
(23,2,'comite cada 3 meses','como instructor quiero programar comite cada 3 meses y notificar a los instructores y lideres de ficha para evualuar el comportamiento academico comportamental de la ficha ',NULL,5,NULL,1),
(23,3,'Crear ítem de llamado de atención','Como instructor quiero registrar un ítem de llamado de atención con su descripción','8',8,1,1),
(24,2,'tener control de los usuarios','como administrador quiero tener control de los usuarios, darle acceso a privilegios al sistema para tener seguridad en el uso de la aplicacion',NULL,5,NULL,1),
(24,3,'Generar ID automático','Como sistema quiero asignar un ID único a cada ítem de llamado de atención','8',8,1,1),
(25,2,'atender novedades','como asistencial quiero atender novedades de estudiantes en esoecificos ',NULL,5,NULL,1),
(25,3,'Notificar a Bienestar','Como sistema quiero enviar notificación automática a Bienestar tras registrar un llamado','9',9,1,1),
(26,3,'Ver historial de reportes','Como usuario quiero acceder al historial de reportes del aprendiz','9',8,1,1),
(27,3,'Cambiar estado del caso','Como usuario quiero marcar el estado de un caso como Pendiente, En seguimiento o Cerrado','8',8,1,1),
(28,3,'Agregar comentario al caso','Como usuario quiero añadir comentarios al caso del aprendiz','8',8,1,1),
(29,3,'Filtrar reportes por estado','Como usuario quiero filtrar los reportes de un aprendiz según el estado del caso','8',8,1,1),
(30,3,'Buscar aprendiz por ficha','Como usuario quiero buscar aprendiz por nombre, ficha o programa','8',8,1,1),
(31,3,'Ver estado del caso','Como usuario quiero visualizar el estado actual del caso de un aprendiz','8',8,1,1),
(32,3,'Ver proceso del caso','Como usuario quiero ver el proceso o seguimiento del caso de un aprendiz','8',8,1,1),
(33,3,'Interfaz clara y controles semanticos','Como valoradora \nquiero una interfaz que muestre mensajes claros y botones bien etiquetados para que pueda aprender a usar la aplicación sin necesitar un tutorial. ','9',8,NULL,1),
(34,3,'Carga de datos excel respetando la plantilla original','Como valoradora quiero poder ingresar los datos especificados en la plantilla excel a la aplicación para Mantener un formato con la misma información','9',8,NULL,1),
(35,3,'Recordatorio automatico de fechas de valoracion','Como valoradora quiero poder automatizar recordatorios de valoraciones para recordar al cliente que la valoración es en cierta fecha','8',5,NULL,1),
(36,3,'Administracion de roles con permisos definidos','Como administrador quiero poder crear usuarios del sistema para garantizar que cada persona tenga acceso controlado segun su rol y responsabilidad dentro de la aplicacion','8',9,NULL,1),
(37,3,'Guardar informacion de clientes','Como valoradora quiero que la información de los clientes esté guardada en una base de datos para facilitar el acceso de la informacion','9',5,NULL,1),
(38,3,'Aislamiento de base de datos para confidencialidad','Como valoradora quiero que la aplicacion solo funcione desde un pc con su base de datos separada de la organización para mantener la confidencialidad ','9',8,NULL,1),
(39,3,'Mecanismo de acceso seguro para usuarios','Como valoradora quiero que mi app posea un control de acceso para controlar la seguridad','6',9,NULL,1),
(40,3,'Programacion de notificaciones automaticas','Como valoradora quiero poder agregar citas por medio de los correos automaticos para mandar resultados y consultas','6',5,NULL,1),
(41,3,'Exportacion de datos graficos en formato pdf','Como valoradora quiero que la App posea la funcionalidad de exportar los datos de las valoraciones de los usuarios, graficos estadisticos y de progreso para exportar informacion de los clientes en formato PDF','5',8,NULL,1),
(42,3,'Soporte para imagenes con descripciones en el registro de datos','Como valoradora quiero que las imagenes tengan una descripción y puedan usarse al momento de registrar la información para facilitar el proceso de digitación de información','9',5,NULL,1);

/*Table structure for table `observaciones` */

DROP TABLE IF EXISTS `observaciones`;

CREATE TABLE `observaciones` (
  `obs_ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id de la observacion',
  `obs_fecha` date DEFAULT NULL COMMENT 'fecha de la  observacion',
  `obs_estado_FK` int(11) DEFAULT NULL COMMENT 'especifique en que estado se estado est ala observacion (por hacer, en progreso, hecho)',
  `obs_descripcion` varchar(255) DEFAULT NULL COMMENT 'descripcion de la  observacion',
  `usu_cedula_FK` int(11) DEFAULT NULL,
  `pro_ID_FK` int(11) DEFAULT NULL,
  PRIMARY KEY (`obs_ID`),
  KEY `usu_fk` (`usu_cedula_FK`),
  KEY `pro_ID_FK` (`pro_ID_FK`),
  KEY `obs_estado_FK` (`obs_estado_FK`),
  CONSTRAINT `fk_observaciones_proyecto` FOREIGN KEY (`pro_ID_FK`) REFERENCES `proyecto` (`pro_ID`),
  CONSTRAINT `observaciones_ibfk_5` FOREIGN KEY (`obs_estado_FK`) REFERENCES `detalle_parametro` (`det_par_ID`),
  CONSTRAINT `observaciones_ibfk_6` FOREIGN KEY (`usu_cedula_FK`) REFERENCES `usuario` (`usu_cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `observaciones` */

insert  into `observaciones`(`obs_ID`,`obs_fecha`,`obs_estado_FK`,`obs_descripcion`,`usu_cedula_FK`,`pro_ID_FK`) values 
(1,'2025-06-10',2,'mejorar el contenido de las historias de usuario y hacer nuevamente el MER',1000000002,1),
(3,'2025-06-24',3,'especificar las descripciones en el diccionario de datos',1000000002,1),
(4,'2025-06-24',3,'corregir algunos campos y entidades del MER',1000000002,1),
(5,'2025-06-24',1,'agregar y corregir campos y entidades en el MER',1000000002,2),
(6,'2025-11-25',2,'Revisar cronograma',1000000001,1),
(7,'2025-11-25',1,'Validar entregables',1000000001,1),
(8,'2025-11-25',1,'Ajustar objetivos',1000000001,1),
(9,'2025-11-25',2,'Revisión trimestral del proyecto 3. Pendiente reunión.',1000000002,3),
(10,'2025-11-25',1,'Observación sobre el avance del Sprint 1 del Proyecto 4.',1000000002,4),
(11,'2025-11-25',1,'Feedback a equipo de Proyecto 2: Falta documentación.',1000000002,2);

/*Table structure for table `parametro` */

DROP TABLE IF EXISTS `parametro`;

CREATE TABLE `parametro` (
  `par_ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id del parametro',
  `par_descripcion` varchar(500) DEFAULT NULL COMMENT 'descripcion del parametro',
  PRIMARY KEY (`par_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `parametro` */

insert  into `parametro`(`par_ID`,`par_descripcion`) values 
(1,'estado'),
(2,'rol scrum'),
(3,'rol sistema'),
(4,'tipo de reunion'),
(5,'permisos');

/*Table structure for table `proyecto` */

DROP TABLE IF EXISTS `proyecto`;

CREATE TABLE `proyecto` (
  `pro_ID` int(11) NOT NULL COMMENT 'id del proyecto',
  `pro_codigo` varchar(32) NOT NULL COMMENT 'codigo unico del proyecto',
  `pro_nombre` varchar(100) DEFAULT NULL COMMENT 'nombre del proyecto',
  `pro_objetivo_general` varchar(500) DEFAULT NULL COMMENT 'objetivo general del proyecto',
  `pro_objetivos_especificos` varchar(500) DEFAULT NULL COMMENT 'objetivo especifico del proyecto',
  `pro_descripcion` varchar(200) DEFAULT NULL COMMENT 'descripcion del proyecto',
  `pro_fecha_inicio` date DEFAULT NULL COMMENT 'fecha de inicio del proyecto',
  `pro_fecha_fin` date DEFAULT NULL COMMENT 'fecha fin del proyecto',
  `pro_justificacion` varchar(500) DEFAULT NULL COMMENT 'justificacion del proyecto',
  `det_par_ID_FK` int(11) DEFAULT NULL COMMENT 'id del detalle parametro',
  `pro_fecha_creacion` datetime NOT NULL COMMENT 'fecha de la creacion del proyecto',
  PRIMARY KEY (`pro_ID`),
  UNIQUE KEY `uq_proyecto_codigo` (`pro_codigo`),
  KEY `fk_proyecto_det_par` (`det_par_ID_FK`),
  CONSTRAINT `fk_proyecto_det_par` FOREIGN KEY (`det_par_ID_FK`) REFERENCES `detalle_parametro` (`det_par_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `proyecto` */

insert  into `proyecto`(`pro_ID`,`pro_codigo`,`pro_nombre`,`pro_objetivo_general`,`pro_objetivos_especificos`,`pro_descripcion`,`pro_fecha_inicio`,`pro_fecha_fin`,`pro_justificacion`,`det_par_ID_FK`,`pro_fecha_creacion`) values 
(1,'PRO-000001','Proyecto scrum','Facilitar la gestión, administración y monitoreo de los proyectos desarrollados por los aprendices del SENA mediante Scrum.','Establecer procesos claros, monitorear entregables y fomentar la mejora continua.',' Gestión de Proyectos scrum','2025-06-01','2025-12-19','Apoyar el desarrollo eficiente de proyectos bajo metodología ágil.',NULL,'2025-05-01 00:00:00'),
(2,'PRO-000002','Comité de evaluación y seguimiento','Implementar un sistema digital que permita gestionar y evaluar las actividades del Comité de Seguimiento y Evaluación, mejorando su eficiencia y efectividad.','Organizar agendas, actas y tareas del comité, evaluar procesos educativos en tiempo real, analizar datos con informes y gráficos, garantizar seguridad con acceso por roles y encriptación.','','2025-06-01','2025-12-19','Modernizar los procesos del comité, mejorar la eficiencia, facilitar la toma de decisiones y fortalecer la transformación digital del SENA.',NULL,'2025-05-01 00:00:00'),
(3,'PRO-000003','O.R.I.A','Implementar un sistema integral de gestión para ambiente y ficha','Facilitar el seguimiento, control y evaluación académica y disciplinaria de los aprendices','optimizacion de registro de informacion antroprometrica','2025-06-01','2025-12-19','Necesidad de un sistema digitalizado para gestión de ambiente y ficha',NULL,'2025-05-01 00:00:00'),
(4,'PRO-000004','Healthy Mind',NULL,NULL,'mente sana','2025-06-01','2025-12-19',NULL,NULL,'2025-05-01 00:00:00'),
(5,'PRO-000005','SIGAF',NULL,NULL,'sistema integral de gestion ambiente y ficha',NULL,'2025-12-19',NULL,NULL,'2025-05-01 00:00:00'),
(6,'PRO-000006','proyectooo','ajdhfkajfha','N/A','ajdhfkajfha','2026-03-05','2026-03-05','N/A',1,'0000-00-00 00:00:00'),
(7,'PRO-000007','proyecto p.','ksdjfhakflf adljfhlas ','N/A','ksdjfhakflf adljfhlas ','2026-03-29',NULL,'N/A',1,'0000-00-00 00:00:00'),
(8,'PRO-000008','proyecto p..','hola mundos','N/A','hola mundos','2028-10-30',NULL,'N/A',1,'0000-00-00 00:00:00'),
(9,'PRO-000009','hola','hola p','N/A','hola p',NULL,NULL,'N/A',1,'0000-00-00 00:00:00');

/*Table structure for table `reuniones` */

DROP TABLE IF EXISTS `reuniones`;

CREATE TABLE `reuniones` (
  `reu_ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id de la reunion',
  `spr_ID_FK` int(11) NOT NULL COMMENT 'id del sprint relacionado',
  `det_par_ID_tipo_FK` int(11) NOT NULL COMMENT 'Tipo de reunión (ID 10-13)',
  `reu_fecha` date NOT NULL COMMENT 'identificador de asistencia(vinculado a usuarios asistentes',
  `reu_resumen` text DEFAULT NULL COMMENT 'fecha en la qu ese llevo a cabo la reunion',
  `reu_asistente_FK` int(11) DEFAULT NULL COMMENT 'informe generado tras la reunion',
  PRIMARY KEY (`reu_ID`),
  KEY `spr_ID_FK` (`spr_ID_FK`),
  KEY `det_par_ID_tipo_FK` (`det_par_ID_tipo_FK`),
  KEY `reu_asistente_FK` (`reu_asistente_FK`),
  CONSTRAINT `reuniones_ibfk_1` FOREIGN KEY (`spr_ID_FK`) REFERENCES `sprint` (`spr_ID`),
  CONSTRAINT `reuniones_ibfk_2` FOREIGN KEY (`det_par_ID_tipo_FK`) REFERENCES `detalle_parametro` (`det_par_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reuniones` */

insert  into `reuniones`(`reu_ID`,`spr_ID_FK`,`det_par_ID_tipo_FK`,`reu_fecha`,`reu_resumen`,`reu_asistente_FK`) values 
(1,1,10,'2025-11-25','Planificación inicial del Sprint 1',NULL),
(2,1,11,'2025-11-25','Avances de login',NULL),
(3,1,11,'2025-11-25','Bloqueos en base de datos',NULL),
(4,1,12,'2025-11-25','Revisión con el cliente',NULL),
(5,1,13,'2025-11-25','Retrospectiva: Mejorar comunicación',NULL);

/*Table structure for table `rol_sis_det_par` */

DROP TABLE IF EXISTS `rol_sis_det_par`;

CREATE TABLE `rol_sis_det_par` (
  `rol_sis_ID` int(11) NOT NULL COMMENT 'id del rol de sistema',
  `det_par_ID` int(11) NOT NULL COMMENT 'id del detalle del parametro',
  PRIMARY KEY (`rol_sis_ID`,`det_par_ID`),
  KEY `det_par_ID` (`det_par_ID`),
  CONSTRAINT `rol_sis_det_par_ibfk_1` FOREIGN KEY (`rol_sis_ID`) REFERENCES `rol_sistema` (`rol_sis_ID`),
  CONSTRAINT `rol_sis_det_par_ibfk_2` FOREIGN KEY (`det_par_ID`) REFERENCES `detalle_parametro` (`det_par_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `rol_sis_det_par` */

insert  into `rol_sis_det_par`(`rol_sis_ID`,`det_par_ID`) values 
(1,7),
(2,8),
(3,9);

/*Table structure for table `rol_sistema` */

DROP TABLE IF EXISTS `rol_sistema`;

CREATE TABLE `rol_sistema` (
  `rol_sis_ID` int(11) NOT NULL COMMENT 'id del rol de sistema',
  `rol_nombre` varchar(100) DEFAULT NULL COMMENT 'nombre del rol de sistema',
  PRIMARY KEY (`rol_sis_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `rol_sistema` */

insert  into `rol_sistema`(`rol_sis_ID`,`rol_nombre`) values 
(1,'Aprendiz'),
(2,'Instructor'),
(3,'administrador');

/*Table structure for table `sprint` */

DROP TABLE IF EXISTS `sprint`;

CREATE TABLE `sprint` (
  `spr_ID` int(11) NOT NULL COMMENT 'id del sprint',
  `spr_nombre` varchar(100) NOT NULL COMMENT 'nombre del sprint',
  `spr_fecha_inicio` date NOT NULL COMMENT 'fecha de inicio del sprint',
  `spr_fecha_fin` date DEFAULT NULL COMMENT 'fecha fin del sprint',
  `spr_estado` varchar(50) DEFAULT NULL COMMENT 'especifique en que estado se encuentra el sprint (por hacer, en progreso, hecho)',
  `spr_descripcion` varchar(500) DEFAULT NULL COMMENT 'descripcion del sprint',
  `pro_ID_FK` int(11) DEFAULT NULL,
  PRIMARY KEY (`spr_ID`,`spr_nombre`,`spr_fecha_inicio`),
  KEY `pro_ID_FK` (`pro_ID_FK`),
  KEY `spr_ID` (`spr_ID`),
  CONSTRAINT `fk_sprint_proyecto` FOREIGN KEY (`pro_ID_FK`) REFERENCES `proyecto` (`pro_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `sprint` */

insert  into `sprint`(`spr_ID`,`spr_nombre`,`spr_fecha_inicio`,`spr_fecha_fin`,`spr_estado`,`spr_descripcion`,`pro_ID_FK`) values 
(1,'Sprint 1','2025-06-01','2025-06-28','en progreso','diseño de la interfaz inicial del sistema y la interfaz de inicio sesion',1);

/*Table structure for table `usu_asis` */

DROP TABLE IF EXISTS `usu_asis`;

CREATE TABLE `usu_asis` (
  `reu_asistente_FK` int(50) NOT NULL COMMENT 'asistencia de los participantes en las reuniones',
  `usu_cedula` int(11) NOT NULL COMMENT 'cedula del usuario',
  PRIMARY KEY (`reu_asistente_FK`,`usu_cedula`),
  KEY `reu_asistente` (`reu_asistente_FK`),
  KEY `usu_cedula` (`usu_cedula`),
  CONSTRAINT `usu_asis_ibfk_1` FOREIGN KEY (`reu_asistente_FK`) REFERENCES `reuniones` (`reu_asistente_FK`),
  CONSTRAINT `usu_asis_ibfk_2` FOREIGN KEY (`usu_cedula`) REFERENCES `usuario` (`usu_cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `usu_asis` */

/*Table structure for table `usu_pro_det_par` */

DROP TABLE IF EXISTS `usu_pro_det_par`;

CREATE TABLE `usu_pro_det_par` (
  `usu_cedula` int(20) NOT NULL COMMENT 'cedula del usuario',
  `det_par_ID_` int(11) NOT NULL COMMENT 'id del detalle parametro',
  `pro_ID` int(11) NOT NULL COMMENT 'id del proyecto',
  PRIMARY KEY (`usu_cedula`,`det_par_ID_`,`pro_ID`),
  KEY `CedulaUsuario` (`det_par_ID_`),
  KEY `RolScrumID` (`pro_ID`),
  CONSTRAINT `fk_usu_pro_det_par_proyecto` FOREIGN KEY (`pro_ID`) REFERENCES `proyecto` (`pro_ID`),
  CONSTRAINT `usu_pro_det_par_ibfk_3` FOREIGN KEY (`det_par_ID_`) REFERENCES `detalle_parametro` (`det_par_ID`),
  CONSTRAINT `usu_pro_det_par_ibfk_5` FOREIGN KEY (`usu_cedula`) REFERENCES `usuario` (`usu_cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `usu_pro_det_par` */

insert  into `usu_pro_det_par`(`usu_cedula`,`det_par_ID_`,`pro_ID`) values 
(1000000002,2,2),
(1000000002,2,3),
(1000000002,2,4),
(1001855307,3,1),
(1044607427,3,1),
(1046696769,2,1),
(1046696769,2,2),
(1046696769,2,3),
(1046696769,2,4),
(1047043541,3,1),
(1085046441,3,1),
(1130267265,1,1);

/*Table structure for table `fichas` */

DROP TABLE IF EXISTS `fichas`;

CREATE TABLE `fichas` (
  `fic_numero` int(11) NOT NULL COMMENT 'numero de ficha',
  `fic_nombre` varchar(150) NOT NULL COMMENT 'nombre de la ficha',
  `fic_programa` varchar(100) DEFAULT NULL COMMENT 'programa asociado a la ficha',
  `fic_fecha_creacion` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'fecha de creacion de la ficha',
  `fic_estado` enum('Activa','Inactiva') NOT NULL DEFAULT 'Activa' COMMENT 'estado de la ficha',
  PRIMARY KEY (`fic_numero`),
  KEY `idx_fichas_estado` (`fic_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `fichas` */

insert  into `fichas`(`fic_numero`,`fic_nombre`,`fic_programa`,`fic_fecha_creacion`,`fic_estado`) values
(2998937,'Ficha ADSO 2998937','ADSO','2026-01-18 17:33:09','Activa'),
(8923567,'Ficha AVIACION 8923567','AVIACION','2025-09-24 06:24:19','Activa');

/*Table structure for table `usuario` */

DROP TABLE IF EXISTS `usuario`;

CREATE TABLE `usuario` (
  `usu_cedula` int(20) NOT NULL COMMENT 'cedula del usuario',
  `usu_nombres` varchar(100) DEFAULT NULL COMMENT 'nombre  del usuario',
  `usu_apellidos` varchar(100) DEFAULT NULL COMMENT 'apellido  del usuario',
  `usu_correo` varchar(100) DEFAULT NULL COMMENT 'correo  del usuario',
  `usu_telefono` varchar(20) DEFAULT NULL COMMENT 'telefono del usuario',
  `usu_contraseña` varchar(100) DEFAULT NULL COMMENT 'contraseña del usuario',
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'fecha de registro del usuario',
  `rol_sis_ID_FK` int(11) DEFAULT NULL,
  `usu_estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo' COMMENT 'estado del usuario (Activo o Inactivo)',
  `usu_especializacion` varchar(120) DEFAULT NULL COMMENT 'especializacion del instructor',
  `usu_sexo` enum('Hombre','Mujer') DEFAULT NULL COMMENT 'sexo del aprendiz',
  `usu_tipodedocumento` enum('CC','TI','CE','PEP','PPT') DEFAULT NULL COMMENT 'tipo de documento del usuario (TI; tarjeta de identidad, CC; cedula de ciudadania; CE; Cédula de Extranjería, PPT\n; permiso por proteccion temporal, PEP; permiso especial de permanencia',
  PRIMARY KEY (`usu_cedula`),
  KEY `RolID` (`rol_sis_ID_FK`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`rol_sis_ID_FK`) REFERENCES `rol_sistema` (`rol_sis_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `usuario` */

insert  into `usuario`(`usu_cedula`,`usu_nombres`,`usu_apellidos`,`usu_correo`,`usu_telefono`,`usu_contraseña`,`fecha_registro`,`rol_sis_ID_FK`,`usu_especializacion`,`usu_tipodedocumento`) values 
(1000000001,'juan','olivares','juanolivares@gmail.com','3100000000','$2b$10$MXzo.RloxM1IcceK4nMrhe0LOC7izc0YtTtjCUQfsK4LuF5qoGV1C','2025-09-24 06:24:19',2,'Ing Software','CC'),
(1000000002,'katherine paola','blanco','kathe@gmail.com','3200000000','kathe123','2026-02-27 22:04:25',2,'Ing en base de datos','CC'),
(1001855307,'jocy hans','charris fernandez','Jocy@gmail.com','3002201010','j123','2026-01-19 17:20:36',1,NULL,'CC'),
(1010006601,'jean carlos','coronell castro','jean@gmail.com','4235386883','jean123','2026-03-05 19:51:55',1,NULL,'CC'),
(1016011848,'madeleine','castillo cardenas','madeleine@gmail.com','3000000005','made123','2026-01-18 17:33:09',1,NULL,'CC'),
(1042251558,'edgar dario','badillo macias','edgar.badillo@gmail.com','3000000001','edgar123','2026-02-27 17:33:42',1,NULL,'CC'),
(1042251706,'moises','garcia urda','moises@gmail.com','3148687899','moises123','2026-03-05 19:51:55',1,NULL,'CC'),
(1042254436,'daniel david','muñoz montoya','daniel@gmail.com','3000000003','daniel123','2026-03-05 19:51:55',1,NULL,'CC'),
(1042852867,'gabriella ','julio cantillo','gabriella@gmail.com','3000000001','gabriella123','2026-03-05 19:51:55',1,NULL,'CC'),
(1043134580,'franklin ','munzon herrera','franklin@gmail.com','3000000002','franklin123','2026-03-02 07:34:30',1,NULL,'CC'),
(1043665064,'jorge enrique','burgos lopez','jorgeburgos@gmail.com','3254649897','jorgeburgos','2026-03-05 19:51:55',1,NULL,'CC'),
(1044600666,'carlos alfonso','arango de la cruz','carlos@gmail.com','3128609809','carlos123','2026-03-05 19:51:55',1,NULL,'CC'),
(1044604785,'santiago','celin garcia','santiago.celin@gmail.com','3000000004','santiago123','2026-03-05 19:51:55',1,NULL,'CC'),
(1044607032,'juan david','gutierrez montes','juan@gmail.com','3129800768','juan123','2026-03-05 19:51:55',1,NULL,'CC'),
(1044607427,'guillermo ','rodriguez trocha','guillermorod@gmail.com','3216475538','guillermo123','2026-03-05 19:51:55',1,NULL,'CC'),
(1044619072,'isaac david','cantillo julio','isaaccantillo@gmail.com','3127009807','isaaccantillo','2026-03-05 19:51:55',1,NULL,'CC'),
(1046696769,'santiago jose','fernandez perez','Fernandezsantiago152@gmail.com','3004504333','santiago123','2026-03-05 19:51:55',1,NULL,'CC'),
(1046813010,'jailer de jesus','lara pineda','jailer@gmail.com','3000000005','jailer123','2026-03-05 19:51:55',1,NULL,'CC'),
(1047043541,'isaac david','jimenez perea','isaacjim1706@gmail.com','3017110394','$2b$10$2HX4vqeImjt/CyuBmAB.4uWIWurBj0Rg6dD4YNScZcmLB6ejLQHKq','2026-02-27 16:08:26',1,NULL,'CC'),
(1047222805,'jhon carlos','sarmiento rodriguez','jhon.sarmiento@gmail.com','3000000006','jhon123','2025-10-14 18:26:15',1,NULL,'CC'),
(1047336800,'luis gabriel','villareal chico','luis@gmail.com','3006574678','luis123','2026-03-05 19:51:55',1,NULL,'CC'),
(1048068189,'edgar isacc ','aroca yanes','edgar.aroca@gmail.com','3000000002','edgar123','2026-03-05 19:51:55',1,NULL,'CC'),
(1048069515,'juan david','orozco almanza','juanorozco@gmail.com','3241756688','juanorozco','2026-02-27 22:03:47',1,NULL,'CC'),
(1048277496,'ricardo rafael','retamoso gutierrez','ricardo@gmail.com','3000000004','ricardo123','2026-01-31 18:26:03',1,NULL,'CC'),
(1049931166,'estuardo jesus','villadiego obrian','estuardo@gmail.com','3000000003','estuardo123','2026-03-05 19:51:55',1,NULL,'CC'),
(1080570745,'briyith lorena','padilla alfaro','briyith@gmail.com','3246757886','briyith123','2026-03-05 19:51:55',1,NULL,'CC'),
(1081914694,'luisa fernanda','arrieta marquez','luisa@gmail.com','3127688966','luisa123','2026-03-05 19:51:55',1,NULL,'CC'),
(1085046441,'Jorje luis','Oliveros Mora','oliverosmorjorgeluis@gmail.com','3148606444','jorge123','2026-03-05 19:51:55',1,NULL,'CC'),
(1129534383,'camilo andres ','villalobos fernandez','camilo@gmail.com ','3247648989','camilo123','2026-03-05 19:51:55',1,NULL,'CC'),
(1130267265,'yeilis paola','mendoza blanco','yeilismendoza26@gmail.com','3106298355','yeilis123','2026-03-05 19:51:55',1,NULL,'CC'),
(1234567890,'Elemir elias','Gomez zarso','isaacjim1706@gmail.com','3013677446','$2b$10$9Yi.nACflwrIn68G0gSbteSxLg90rHD9k35Z.0sybzu5N66i3MWJi','2026-03-05 19:51:55',3,NULL,'CC');

UPDATE `usuario`
SET `usu_estado` = 'Inactivo'
WHERE `usu_cedula` = 1047043541;

/*Table structure for table `usuario_ficha` */

DROP TABLE IF EXISTS `usuario_ficha`;

CREATE TABLE `usuario_ficha` (
  `usu_cedula_FK` int(20) NOT NULL COMMENT 'cedula del usuario',
  `fic_numero_FK` int(11) NOT NULL COMMENT 'numero de la ficha',
  `usf_fecha_asignacion` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'fecha de asignacion del usuario a la ficha',
  PRIMARY KEY (`usu_cedula_FK`,`fic_numero_FK`),
  KEY `fic_numero_FK` (`fic_numero_FK`),
  CONSTRAINT `usuario_ficha_ibfk_1` FOREIGN KEY (`usu_cedula_FK`) REFERENCES `usuario` (`usu_cedula`),
  CONSTRAINT `usuario_ficha_ibfk_2` FOREIGN KEY (`fic_numero_FK`) REFERENCES `fichas` (`fic_numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `usuario_ficha` */

insert into `usuario_ficha`(`usu_cedula_FK`,`fic_numero_FK`,`usf_fecha_asignacion`) values
(1000000001,8923567,'2025-09-24 06:24:19'),
(1000000002,2998937,'2026-02-27 22:04:25');

insert into `usuario_ficha`(`usu_cedula_FK`,`fic_numero_FK`,`usf_fecha_asignacion`)
select
  `usu_cedula`,
  2998937,
  `fecha_registro`
from `usuario`
where `rol_sis_ID_FK` = 1;

DROP TRIGGER IF EXISTS `trg_usuario_ficha_validar_insert`;
DROP TRIGGER IF EXISTS `trg_usuario_ficha_validar_update`;

DELIMITER $$

CREATE TRIGGER `trg_usuario_ficha_validar_insert`
BEFORE INSERT ON `usuario_ficha`
FOR EACH ROW
BEGIN
  DECLARE v_rol int;

  SELECT `rol_sis_ID_FK`
    INTO v_rol
  FROM `usuario`
  WHERE `usu_cedula` = NEW.`usu_cedula_FK`
  LIMIT 1;

  IF v_rol IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario asignado a la ficha no existe.';
  END IF;

  IF v_rol NOT IN (1,2) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo aprendices e instructores pueden tener fichas asignadas.';
  END IF;

  IF v_rol = 1 AND EXISTS (
    SELECT 1
    FROM `usuario_ficha`
    WHERE `usu_cedula_FK` = NEW.`usu_cedula_FK`
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Un aprendiz solo puede tener una ficha asignada.';
  END IF;
END$$

CREATE TRIGGER `trg_usuario_ficha_validar_update`
BEFORE UPDATE ON `usuario_ficha`
FOR EACH ROW
BEGIN
  DECLARE v_rol int;

  SELECT `rol_sis_ID_FK`
    INTO v_rol
  FROM `usuario`
  WHERE `usu_cedula` = NEW.`usu_cedula_FK`
  LIMIT 1;

  IF v_rol IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario asignado a la ficha no existe.';
  END IF;

  IF v_rol NOT IN (1,2) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo aprendices e instructores pueden tener fichas asignadas.';
  END IF;

  IF v_rol = 1 AND EXISTS (
    SELECT 1
    FROM `usuario_ficha`
    WHERE `usu_cedula_FK` = NEW.`usu_cedula_FK`
      AND NOT (
        `usu_cedula_FK` = OLD.`usu_cedula_FK`
        AND `fic_numero_FK` = OLD.`fic_numero_FK`
      )
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Un aprendiz solo puede tener una ficha asignada.';
  END IF;
END$$

DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
