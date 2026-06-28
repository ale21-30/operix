from flask import Flask, jsonify
from flask_cors import CORS
from analisis import analisis_descriptivo, predecir_puntualidad_empleados
from modelo import entrenar_modelo, cargar_modelo
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({'mensaje': 'API ML Operix funcionando ✓'})

@app.route('/analisis')
def get_analisis():
    """Retorna el análisis descriptivo completo"""
    try:
        stats = analisis_descriptivo()
        return jsonify({ 'ok': True, 'data': stats })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/entrenar')
def get_entrenar():
    """Entrena o re-entrena el modelo"""
    try:
        modelo, accuracy, df = entrenar_modelo()
        return jsonify({
            'ok':       True,
            'accuracy': round(accuracy * 100, 1),
            'mensaje':  f'Modelo entrenado con {accuracy*100:.1f}% de accuracy'
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/predicciones')
def get_predicciones():
    """Retorna las predicciones de puntualidad por empleado"""
    try:
        # Entrena si no existe el modelo
        if not os.path.exists('models/modelo_puntualidad.pkl'):
            entrenar_modelo()
        
        predicciones, accuracy = predecir_puntualidad_empleados()
        return jsonify({
            'ok':           True,
            'predicciones': predicciones,
            'accuracy':     round(accuracy * 100, 1)
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/resumen-ml')
def get_resumen_ml():
    """Endpoint combinado para el dashboard — análisis + predicciones"""
    try:
        stats        = analisis_descriptivo()
        
        if not os.path.exists('models/modelo_puntualidad.pkl'):
            entrenar_modelo()
        
        predicciones, accuracy = predecir_puntualidad_empleados()
        
        return jsonify({
            'ok':           True,
            'analisis':     stats,
            'predicciones': predicciones,
            'accuracy':     round(accuracy * 100, 1)
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

if __name__ == '__main__':
    print("🤖 Iniciando API ML Operix en http://localhost:5000")
    app.run(debug=True, port=5000)