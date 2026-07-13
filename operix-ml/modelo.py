import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (classification_report, accuracy_score,
                              precision_score, recall_score, f1_score)
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pickle
import os
from data import obtener_datos_asistencia

def etiquetar_puntualidad_relativa(minutos_real, minutos_esperado):
    """
    Clasifica puntualidad respecto al horario real del empleado.
    Puntual:            hasta 10 min de retraso
    Tardanza leve:      entre 10 y 30 min de retraso
    Tardanza frecuente: más de 30 min de retraso
    """
    diferencia = minutos_real - minutos_esperado
    if diferencia <= 10:
        return 0  # Puntual
    elif diferencia <= 30:
        return 1  # Tardanza leve
    else:
        return 2  # Tardanza frecuente

def preparar_features(df):
    df = df.copy()
    df['minutos_entrada'] = df['hora_entrada'] * 60 + df['minuto_entrada']

    # Usa horario esperado si existe, sino usa 8:00 AM como default
    df['minutos_esperado'] = df['minutos_horario_esperado'].fillna(480)

    # Calcula diferencia respecto al horario real
    df['diferencia_minutos'] = df['minutos_entrada'] - df['minutos_esperado']

    # Etiqueta según horario real de cada empleado
    df['puntualidad'] = df.apply(
        lambda row: etiquetar_puntualidad_relativa(
            row['minutos_entrada'],
            row['minutos_esperado']
        ), axis=1
    )

    le_sede = LabelEncoder()
    le_emp  = LabelEncoder()
    df['sede_encoded']     = le_sede.fit_transform(df['sede'])
    df['empleado_encoded'] = le_emp.fit_transform(df['empleado'])

    # Features — ahora incluye diferencia respecto al horario esperado
    features = ['diferencia_minutos', 'dia_semana', 'sede_encoded',
                'empleado_encoded', 'duracion_minutos']

    X = df[features].fillna(0)
    y = df['puntualidad']
    return X, y, df, le_sede, le_emp

def generar_datos_ejemplo():
    np.random.seed(42)
    n = 150
    data = {
        'usuario_id':       np.random.choice([1, 2, 3], n),
        'empleado':         np.random.choice(['Empleado A', 'Empleado B', 'Empleado C'], n),
        'sede':             np.random.choice(['Sede 1', 'Sede 2'], n),
        'hora_entrada':     np.random.choice([7, 8, 8, 8, 9, 9, 10], n),
        'minuto_entrada':   np.random.choice([0, 15, 30, 45], n),
        'dia_semana':       np.random.choice([2, 3, 4, 5, 6], n),
        'duracion_minutos': np.random.normal(480, 60, n).astype(int),
        'estado':           ['completado'] * n
    }
    return pd.DataFrame(data)

def evaluar_modelo(modelo, X_test, y_test, clases_presentes, etiquetas_todas):
    y_pred = modelo.predict(X_test)
    etiquetas_presentes = [etiquetas_todas[c] for c in clases_presentes]

    return {
        'accuracy':  round(accuracy_score(y_test, y_pred) * 100, 1),
        'precision': round(precision_score(y_test, y_pred, average='weighted',
                           labels=clases_presentes, zero_division=0) * 100, 1),
        'recall':    round(recall_score(y_test, y_pred, average='weighted',
                           labels=clases_presentes, zero_division=0) * 100, 1),
        'f1':        round(f1_score(y_test, y_pred, average='weighted',
                           labels=clases_presentes, zero_division=0) * 100, 1),
        'reporte':   classification_report(y_test, y_pred,
                           labels=clases_presentes,
                           target_names=etiquetas_presentes,
                           zero_division=0)
    }

def entrenar_modelos():
    print("📊 Cargando datos de asistencia...")
    df = obtener_datos_asistencia()
    print(f"✓ {len(df)} registros reales cargados")

    if len(df) < 10:
        print("⚠️  Combinando con datos sintéticos...")
        df = pd.concat([df, generar_datos_ejemplo()], ignore_index=True)

    X, y, df_prep, le_sede, le_emp = preparar_features(df)

    clases_presentes = sorted(y.unique())
    etiquetas_todas  = {0: 'Puntual', 1: 'Tardanza leve', 2: 'Tardanza frecuente'}

    print(f"\n📈 Distribución de clases:")
    for k in clases_presentes:
        v = (y == k).sum()
        print(f"   {etiquetas_todas[k]}: {v} registros ({v/len(y)*100:.1f}%)")

    if len(X) >= 10 and len(clases_presentes) > 1:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        X_train, X_test = X, X
        y_train, y_test = y, y

    # ── MODELO 1: Árbol de Decisión ──
    print("\n🌳 Entrenando Árbol de Decisión...")
    arbol = DecisionTreeClassifier(
        max_depth=5,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42
    )
    arbol.fit(X_train, y_train)
    metricas_arbol = evaluar_modelo(arbol, X_test, y_test,
                                    clases_presentes, etiquetas_todas)
    print(f"   Accuracy: {metricas_arbol['accuracy']}%")

    # ── MODELO 2: Regresión Logística ──
    print("\n📈 Entrenando Regresión Logística...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    logistica = LogisticRegression(
    max_iter=1000,
    random_state=42,
    solver='lbfgs'
    )
    logistica.fit(X_train_scaled, y_train)
    metricas_logistica = evaluar_modelo(logistica, X_test_scaled, y_test,
                                         clases_presentes, etiquetas_todas)
    print(f"   Accuracy: {metricas_logistica['accuracy']}%")

    # ── Selección del mejor modelo ──
    if metricas_arbol['f1'] >= metricas_logistica['f1']:
        mejor_modelo   = arbol
        mejor_nombre   = 'Árbol de Decisión'
        mejor_metricas = metricas_arbol
        usar_scaler    = False
    else:
        mejor_modelo   = logistica
        mejor_nombre   = 'Regresión Logística'
        mejor_metricas = metricas_logistica
        usar_scaler    = True

    print(f"\n🏆 Mejor modelo: {mejor_nombre} (F1: {mejor_metricas['f1']}%)")

    # ── Guarda todo ──
    os.makedirs('models', exist_ok=True)
    with open('models/modelo_puntualidad.pkl', 'wb') as f:
        pickle.dump({
            'modelo':       mejor_modelo,
            'nombre':       mejor_nombre,
            'le_sede':      le_sede,
            'le_emp':       le_emp,
            'scaler':       scaler if usar_scaler else None,
            'usar_scaler':  usar_scaler,
            'features':     ['minutos_entrada', 'dia_semana', 'sede_encoded',
                             'empleado_encoded', 'duracion_minutos'],
            'etiquetas':    etiquetas_todas,
            'metricas':     mejor_metricas,
            'comparacion': {
                'arbol': {
                    'nombre':    'Árbol de Decisión',
                    'accuracy':  metricas_arbol['accuracy'],
                    'precision': metricas_arbol['precision'],
                    'recall':    metricas_arbol['recall'],
                    'f1':        metricas_arbol['f1'],
                    'params':    'max_depth=5, min_samples_split=2'
                },
                'logistica': {
                    'nombre':    'Regresión Logística',
                    'accuracy':  metricas_logistica['accuracy'],
                    'precision': metricas_logistica['precision'],
                    'recall':    metricas_logistica['recall'],
                    'f1':        metricas_logistica['f1'],
                    'params':    'max_iter=1000, solver=lbfgs, multi_class=multinomial'
                }
            }
        }, f)

    print("💾 Modelo guardado")
    return mejor_modelo, mejor_metricas, metricas_arbol, metricas_logistica

if __name__ == '__main__':
    entrenar_modelos()