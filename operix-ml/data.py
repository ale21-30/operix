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
    query = """
        SELECT 
            t.id,
            u.id AS usuario_id,
            u.nombre AS empleado,
            s.nombre AS sede,
            t.entrada_hora,
            t.salida_hora,
            t.estado,
            HOUR(t.entrada_hora) AS hora_entrada,
            MINUTE(t.entrada_hora) AS minuto_entrada,
            DAYOFWEEK(t.entrada_hora) AS dia_semana,
            TIMESTAMPDIFF(MINUTE, t.entrada_hora, 
                COALESCE(t.salida_hora, NOW())) AS duracion_minutos
        FROM turnos t
        JOIN usuarios u ON t.usuario_id = u.id
        JOIN sedes s ON t.sede_id = s.id
        WHERE t.estado = 'completado'
        AND t.entrada_hora IS NOT NULL
        ORDER BY t.entrada_hora DESC
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df