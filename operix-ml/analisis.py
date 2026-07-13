import pandas as pd
import numpy as np
import json
import math
from data import obtener_datos_asistencia, conectar_bd

def limpiar_nan(obj):
    """Reemplaza NaN e Infinity por None para JSON válido"""
    if isinstance(obj, dict):
        return {k: limpiar_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [limpiar_nan(v) for v in obj]
    elif isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj

def analisis_descriptivo():
    df = obtener_datos_asistencia()

    if df.empty:
        return { 'total_turnos': 0, 'mensaje': 'No hay datos suficientes aún' }

    df['minutos_entrada']  = df['hora_entrada'] * 60 + df['minuto_entrada']
    df['minutos_esperado'] = df['minutos_horario_esperado'].fillna(480)
    df['diferencia']       = df['minutos_entrada'] - df['minutos_esperado']

    total_turnos   = len(df)
    promedio_horas = round(df['duracion_minutos'].mean() / 60, 2) if 'duracion_minutos' in df else 0

    # Puntual = llega con menos de 10 min de retraso respecto a SU horario
    puntuales      = len(df[df['diferencia'] <= 10])
    pct_puntualidad = round(puntuales / total_turnos * 100, 1) if total_turnos > 0 else 0

    # Distribución por hora de entrada
    dist_hora = df['hora_entrada'].value_counts().sort_index()
    distribucion_hora = [
        {'hora': f"{int(h):02d}:00", 'cantidad': int(v)}
        for h, v in dist_hora.items()
    ]

    # Distribución por día
    dias = {2:'Lunes', 3:'Martes', 4:'Miércoles', 5:'Jueves',
            6:'Viernes', 7:'Sábado', 1:'Domingo'}
    dist_dia = df['dia_semana'].value_counts().sort_index()
    distribucion_dia = [
        {'dia': dias.get(int(d), str(d)), 'cantidad': int(v)}
        for d, v in dist_dia.items()
    ]

    # Estadísticas por empleado — respecto a SU horario
    import numpy as np
    stats_emp = df.groupby('empleado').agg(
        total_turnos=('id', 'count'),
        promedio_entrada_min=('minutos_entrada', 'mean'),
        promedio_esperado=('minutos_esperado', 'mean'),
        diferencia_promedio=('diferencia', 'mean'),
    ).reset_index()

    stats_emp['promedio_entrada_fmt'] = stats_emp['promedio_entrada_min'].apply(
        lambda m: f"{int(m//60):02d}:{int(m%60):02d}" if not np.isnan(m) else '--'
    )
    stats_emp['horario_esperado_fmt'] = stats_emp['promedio_esperado'].apply(
        lambda m: f"{int(m//60):02d}:{int(m%60):02d}" if not np.isnan(m) else '--'
    )
    stats_emp['tardanzas'] = df.groupby('empleado').apply(
        lambda x: (x['diferencia'] > 10).sum()
    ).values
    stats_emp['pct_puntualidad'] = stats_emp.apply(
        lambda r: round((r['total_turnos'] - r['tardanzas']) / r['total_turnos'] * 100, 1)
        if r['total_turnos'] > 0 else 0, axis=1
    )

    empleados_stats = stats_emp.to_dict('records')

    # Por sede
    por_sede = df['sede'].value_counts().reset_index()
    por_sede.columns = ['sede', 'cantidad']
    turnos_por_sede = por_sede.to_dict('records')

    return {
        'total_turnos':      total_turnos,
        'promedio_horas':    promedio_horas,
        'pct_puntualidad':   pct_puntualidad,
        'distribucion_hora': distribucion_hora,
        'distribucion_dia':  distribucion_dia,
        'empleados_stats':   empleados_stats,
        'turnos_por_sede':   turnos_por_sede,
    }

def predecir_puntualidad_empleados():
    import pickle
    import os

    try:
        with open('models/modelo_puntualidad.pkl', 'rb') as f:
            datos_modelo = pickle.load(f)
    except FileNotFoundError:
        return [], 0

    modelo      = datos_modelo['modelo']
    le_sede     = datos_modelo['le_sede']
    le_emp      = datos_modelo['le_emp']
    scaler      = datos_modelo.get('scaler', None)
    usar_scaler = datos_modelo.get('usar_scaler', False)
    etiquetas   = datos_modelo.get('etiquetas', {0:'Puntual',1:'Tardanza leve',2:'Tardanza frecuente'})
    
    # Obtiene accuracy de forma segura
    metricas  = datos_modelo.get('metricas', {})
    accuracy  = metricas.get('accuracy', 0) / 100 if metricas else 0

    df = obtener_datos_asistencia()
    if df.empty:
        return [], accuracy

    df['minutos_entrada'] = df['hora_entrada'] * 60 + df['minuto_entrada']

    stats = df.groupby(['usuario_id', 'empleado', 'sede']).agg(
        minutos_entrada=('minutos_entrada', 'mean'),
        dia_semana=('dia_semana', 'median'),
        duracion_minutos=('duracion_minutos', 'mean'),
        total_turnos=('id', 'count')
    ).reset_index()

    resultados = []
    for _, row in stats.iterrows():
        try:
            sede_enc = le_sede.transform([row['sede']])[0] \
                if row['sede'] in le_sede.classes_ else 0
            emp_enc  = le_emp.transform([row['empleado']])[0] \
                if row['empleado'] in le_emp.classes_ else 0

            X_pred = [[
                row['minutos_entrada'],
                row['dia_semana'],
                sede_enc,
                emp_enc,
                row['duracion_minutos']
            ]]

            if usar_scaler and scaler:
                import numpy as np
                X_pred = scaler.transform(X_pred)

            pred  = modelo.predict(X_pred)[0]
            proba = modelo.predict_proba(X_pred)[0]
            hora_prom = row['minutos_entrada']

            resultados.append({
                'empleado':     row['empleado'],
                'sede':         row['sede'],
                'total_turnos': int(row['total_turnos']),
                'hora_promedio':f"{int(hora_prom//60):02d}:{int(hora_prom%60):02d}",
                'categoria':    etiquetas[pred],
                'confianza':    round(float(max(proba)) * 100, 1),
                'categoria_id': int(pred)
            })
        except Exception as e:
            continue

    return resultados, accuracy

if __name__ == '__main__':
    stats = analisis_descriptivo()
    print("📊 Análisis descriptivo:")
    print(f"   Total turnos:    {stats['total_turnos']}")
    print(f"   Promedio horas:  {stats['promedio_horas']}h")
    print(f"   % Puntualidad:   {stats['pct_puntualidad']}%")