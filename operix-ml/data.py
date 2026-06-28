import mysql.connector
import pandas as pd
from datetime import datetime

def conectar_bd():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",        # tu password de MySQL
        database="operix_db",
        port=3306
    )

def obtener_datos_asistencia():
    """Extrae todos los turnos completados de la BD"""
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

def obtener_estadisticas_empleado(usuario_id):
    """Calcula estadísticas por empleado"""
    conn = conectar_bd()
    
    query = """
        SELECT
            u.nombre,
            COUNT(*) AS total_turnos,
            AVG(HOUR(t.entrada_hora) * 60 + MINUTE(t.entrada_hora)) AS promedio_entrada_minutos,
            STDDEV(HOUR(t.entrada_hora) * 60 + MINUTE(t.entrada_hora)) AS desviacion_entrada,
            AVG(TIMESTAMPDIFF(MINUTE, t.entrada_hora, t.salida_hora)) AS promedio_duracion,
            SUM(CASE WHEN HOUR(t.entrada_hora) * 60 + MINUTE(t.entrada_hora) > 480 
                THEN 1 ELSE 0 END) AS tardanzas
        FROM turnos t
        JOIN usuarios u ON t.usuario_id = u.id
        WHERE t.usuario_id = %s
        AND t.estado = 'completado'
    """
    
    df = pd.read_sql(query, conn, params=[usuario_id])
    conn.close()
    return df