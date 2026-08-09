import mysql.connector
import pandas as pd
import os

def conectar_bd():
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'operix_db'),
        port=int(os.environ.get('DB_PORT', 3306))
    )

def obtener_datos_asistencia():
    conn = conectar_bd()
    # NOW() en este servidor MySQL devuelve UTC (confirmado: hora_servidor = hora_utc).
    # entrada_hora se guarda con NOW(), es decir en UTC, mientras que horarios.hora_entrada
    # se carga manualmente en hora local de Ecuador (UTC-5). Sin convertir, cada comparación
    # queda desfasada ~5 horas. Se usa un offset fijo (no CONVERT_TZ con nombre de zona) porque
    # MySQL gestionado normalmente no tiene cargadas las tablas de zonas horarias con nombre.
    query = """
        SELECT
            t.id,
            u.id AS usuario_id,
            u.nombre AS empleado,
            s.nombre AS sede,
            CONVERT_TZ(t.entrada_hora, '+00:00', '-05:00') AS entrada_hora,
            CONVERT_TZ(t.salida_hora, '+00:00', '-05:00') AS salida_hora,
            t.estado,
            HOUR(CONVERT_TZ(t.entrada_hora, '+00:00', '-05:00')) AS hora_entrada,
            MINUTE(CONVERT_TZ(t.entrada_hora, '+00:00', '-05:00')) AS minuto_entrada,
            DAYOFWEEK(CONVERT_TZ(t.entrada_hora, '+00:00', '-05:00')) AS dia_semana,
            TIMESTAMPDIFF(MINUTE, t.entrada_hora,
                COALESCE(t.salida_hora, NOW())) AS duracion_minutos,
            h.hora_entrada AS horario_entrada,
            HOUR(h.hora_entrada) * 60 + MINUTE(h.hora_entrada) AS minutos_horario_esperado
        FROM turnos t
        JOIN usuarios u ON t.usuario_id = u.id
        JOIN sedes s ON t.sede_id = s.id
        LEFT JOIN horarios h ON h.usuario_id = t.usuario_id 
            AND h.sede_id = t.sede_id
            AND h.activo = 1
        WHERE t.estado = 'completado'
        AND t.entrada_hora IS NOT NULL
        ORDER BY t.entrada_hora DESC
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df

def obtener_horarios():
    conn = conectar_bd()
    query = """
        SELECT 
            u.id AS usuario_id,
            u.nombre AS empleado,
            s.id AS sede_id,
            s.nombre AS sede,
            h.hora_entrada,
            h.hora_salida,
            h.dias,
            HOUR(h.hora_entrada) * 60 + MINUTE(h.hora_entrada) AS minutos_entrada_esperada
        FROM horarios h
        JOIN usuarios u ON h.usuario_id = u.id
        JOIN sedes s ON h.sede_id = s.id
        WHERE h.activo = 1
        ORDER BY u.nombre
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df