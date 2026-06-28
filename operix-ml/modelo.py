import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import pickle
import os
from data import obtener_datos_asistencia

# ─────────────────────────────────────────
# ETIQUETADO DE PUNTUALIDAD
# Basado en la hora de entrada
# Puntual:          entrada antes de las 8:30 (510 min)
# Tardanza leve:    entrada entre 8:30 y 9:00 (510-540 min)
# Tardanza frecuente: entrada después de las 9:00 (540+ min)
# ─────────────────────────────────────────

def etiquetar_puntualidad(minutos_entrada):
    """Clasifica la puntualidad según la hora de entrada"""
    if minutos_entrada <= 510:      # 8:30 AM
        return 0  # Puntual
    elif minutos_entrada <= 540:    # 9:00 AM
        return 1  # Tardanza leve
    else:
        return 2  # Tardanza frecuente

def preparar_features(df):
    """Prepara las características para el modelo"""
    df = df.copy()
    
    # Convierte hora y minuto a minutos totales desde medianoche
    df['minutos_entrada'] = df['hora_entrada'] * 60 + df['minuto_entrada']
    
    # Etiqueta la puntualidad
    df['puntualidad'] = df['minutos_entrada'].apply(etiquetar_puntualidad)
    
    # Codifica la sede
    le_sede = LabelEncoder()
    df['sede_encoded'] = le_sede.fit_transform(df['sede'])
    
    # Codifica el empleado
    le_emp = LabelEncoder()
    df['empleado_encoded'] = le_emp.fit_transform(df['empleado'])
    
    # Features finales
    features = ['minutos_entrada', 'dia_semana', 'sede_encoded', 
                 'empleado_encoded', 'duracion_minutos']
    
    X = df[features].fillna(0)
    y = df['puntualidad']
    
    return X, y, df, le_sede, le_emp

def entrenar_modelo():
    """Entrena el modelo de clasificación"""
    print("📊 Cargando datos de asistencia...")
    df = obtener_datos_asistencia()
    print(f"✓ {len(df)} registros cargados")

    # Si hay pocos datos reales, combina con datos sintéticos
    if len(df) < 10:
        print("⚠️  Pocos datos reales. Combinando con datos sintéticos...")
        df_sint = generar_datos_ejemplo()
        df = pd.concat([df, df_sint], ignore_index=True)

    X, y, df_prep, le_sede, le_emp = preparar_features(df)

    # Clases presentes en los datos
    clases_presentes = sorted(y.unique())
    etiquetas_todas  = {0: 'Puntual', 1: 'Tardanza leve', 2: 'Tardanza frecuente'}
    etiquetas_presentes = [etiquetas_todas[c] for c in clases_presentes]

    print(f"\n📈 Distribución de clases:")
    for k in clases_presentes:
        v = (y == k).sum()
        print(f"   {etiquetas_todas[k]}: {v} registros ({v/len(y)*100:.1f}%)")

    # División train/test
    if len(X) >= 10 and len(clases_presentes) > 1:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        X_train, X_test = X, X
        y_train, y_test = y, y

    # Entrena árbol de decisión
    print("\n🌳 Entrenando árbol de decisión...")
    modelo = DecisionTreeClassifier(
        max_depth=5,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42
    )
    modelo.fit(X_train, y_train)

    # Evaluación — solo con clases presentes
    y_pred   = modelo.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n✅ Accuracy del modelo: {accuracy*100:.1f}%")
    print("\n📋 Reporte de clasificación:")
    print(classification_report(
        y_test, y_pred,
        labels=clases_presentes,
        target_names=etiquetas_presentes,
        zero_division=0
    ))

    # Guarda el modelo
    os.makedirs('models', exist_ok=True)
    with open('models/modelo_puntualidad.pkl', 'wb') as f:
        pickle.dump({
            'modelo':    modelo,
            'le_sede':   le_sede,
            'le_emp':    le_emp,
            'features':  ['minutos_entrada', 'dia_semana', 'sede_encoded',
                          'empleado_encoded', 'duracion_minutos'],
            'accuracy':  accuracy,
            'etiquetas': etiquetas_todas
        }, f)

    print("\n💾 Modelo guardado en models/modelo_puntualidad.pkl")
    return modelo, accuracy, df_prep

def generar_datos_ejemplo():
    """Genera datos sintéticos para cuando hay pocos registros reales"""
    np.random.seed(42)
    n = 100
    
    data = {
        'usuario_id':       np.random.choice([1], n),
        'empleado':         np.random.choice(['Administrador'], n),
        'sede':             np.random.choice(['Sede de Prueba'], n),
        'hora_entrada':     np.random.choice([7, 8, 8, 8, 9, 9, 10], n),
        'minuto_entrada':   np.random.choice([0, 15, 30, 45], n),
        'dia_semana':       np.random.choice([2, 3, 4, 5, 6], n),
        'duracion_minutos': np.random.normal(480, 60, n).astype(int),
        'estado':           ['completado'] * n
    }
    
    return pd.DataFrame(data)

def cargar_modelo():
    """Carga el modelo entrenado"""
    with open('models/modelo_puntualidad.pkl', 'rb') as f:
        return pickle.load(f)

if __name__ == '__main__':
    entrenar_modelo()