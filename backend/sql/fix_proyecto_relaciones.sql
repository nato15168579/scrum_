USE `pro_scrum`;

SET @db := DATABASE();

/*
  1) Corrige el nombre de la tabla si existe con espacio inicial: ` proyecto`
     Solo renombra cuando existe ` proyecto` y no existe `proyecto`.
*/
SET @has_with_space := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = @db
    AND table_name = ' proyecto'
);

SET @has_clean := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = @db
    AND table_name = 'proyecto'
);

SET @sql := IF(
  @has_with_space = 1 AND @has_clean = 0,
  'RENAME TABLE ` proyecto` TO `proyecto`',
  'SELECT ''Skip rename proyecto'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/*
  2) Limpia valores huérfanos en det_par_ID_FK para poder crear FK.
*/
UPDATE proyecto p
LEFT JOIN detalle_parametro d ON d.det_par_ID = p.det_par_ID_FK
SET p.det_par_ID_FK = NULL
WHERE p.det_par_ID_FK IS NOT NULL
  AND d.det_par_ID IS NULL;

/*
  3) Crea FK proyecto -> detalle_parametro si no existe.
*/
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'proyecto'
    AND COLUMN_NAME = 'det_par_ID_FK'
    AND REFERENCED_TABLE_NAME = 'detalle_parametro'
);

SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE proyecto ADD CONSTRAINT fk_proyecto_det_par FOREIGN KEY (det_par_ID_FK) REFERENCES detalle_parametro(det_par_ID)',
  'SELECT ''FK proyecto->detalle_parametro ya existe'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/*
  4) Crea FK historia_usuario -> proyecto si no existe.
*/
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'historia_usuario'
    AND COLUMN_NAME = 'pro_ID_FK'
    AND REFERENCED_TABLE_NAME = 'proyecto'
);

SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE historia_usuario ADD CONSTRAINT fk_historia_usuario_proyecto FOREIGN KEY (pro_ID_FK) REFERENCES proyecto(pro_ID)',
  'SELECT ''FK historia_usuario->proyecto ya existe'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/*
  5) Crea FK observaciones -> proyecto si no existe.
*/
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'observaciones'
    AND COLUMN_NAME = 'pro_ID_FK'
    AND REFERENCED_TABLE_NAME = 'proyecto'
);

SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE observaciones ADD CONSTRAINT fk_observaciones_proyecto FOREIGN KEY (pro_ID_FK) REFERENCES proyecto(pro_ID)',
  'SELECT ''FK observaciones->proyecto ya existe'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/*
  6) Crea FK sprint -> proyecto si no existe.
*/
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'sprint'
    AND COLUMN_NAME = 'pro_ID_FK'
    AND REFERENCED_TABLE_NAME = 'proyecto'
);

SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE sprint ADD CONSTRAINT fk_sprint_proyecto FOREIGN KEY (pro_ID_FK) REFERENCES proyecto(pro_ID)',
  'SELECT ''FK sprint->proyecto ya existe'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/*
  7) Crea FK usu_pro_det_par -> proyecto si no existe.
*/
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'usu_pro_det_par'
    AND COLUMN_NAME = 'pro_ID'
    AND REFERENCED_TABLE_NAME = 'proyecto'
);

SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE usu_pro_det_par ADD CONSTRAINT fk_usu_pro_det_par_proyecto FOREIGN KEY (pro_ID) REFERENCES proyecto(pro_ID)',
  'SELECT ''FK usu_pro_det_par->proyecto ya existe'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = @db
  AND REFERENCED_TABLE_NAME = 'proyecto'
ORDER BY TABLE_NAME, COLUMN_NAME;
