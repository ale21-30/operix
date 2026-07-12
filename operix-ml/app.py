import json as stdlib_json
import math
import os
import pickle

from flask import Flask, Response
from flask_cors import CORS
from analisis import analisis_descriptivo, predecir_puntualidad_empleados
from modelo import entrenar_modelos

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def json_response(data, status=200):
    """Serializa a JSON limpiando NaN e Infinity"""
    def clean(o):
        if isinstance(o, dict):
            return {k: clean(v) for k, v in o.items()}
        elif isinstance(o, list):
            return [clean(v) for v in o]
        elif isinstance(o, float) and (math.isnan(o) or math.isinf(o)):
            return None
        return o
    return Response(
        stdlib_json.dumps(clean(data)),
        status=status,
        mimetype='application/json'
    )

@app.route('/')
def home():
    return json_response({'mensaje': 'API ML Operix funcionando ✓'})

@app.route('/analisis')
def get_analisis():
    try:
        stats = analisis_descriptivo()
        return json_response({'ok': True, 'data': stats})
    except Exception as e:
        return json_response({'ok': False, 'error': str(e)}, 500)

@app.route('/entrenar')
def get_entrenar():
    try:
        _, _, m_arbol, m_logistica = entrenar_modelos()
        return json_response({
            'ok': True,
            'mensaje': 'Modelos entrenados correctamente',
            'comparacion': {
                'arbol':     {'accuracy': m_arbol['accuracy'],     'f1': m_arbol['f1']},
                'logistica': {'accuracy': m_logistica['accuracy'], 'f1': m_logistica['f1']}
            }
        })
    except Exception as e:
        return json_response({'ok': False, 'error': str(e)}, 500)

@app.route('/predicciones')
def get_predicciones():
    try:
        if not os.path.exists('models/modelo_puntualidad.pkl'):
            entrenar_modelos()
        predicciones, accuracy = predecir_puntualidad_empleados()
        return json_response({
            'ok': True,
            'predicciones': predicciones,
            'accuracy': round(accuracy * 100, 1)
        })
    except Exception as e:
        return json_response({'ok': False, 'error': str(e)}, 500)

@app.route('/comparacion')
def get_comparacion():
    try:
        if not os.path.exists('models/modelo_puntualidad.pkl'):
            entrenar_modelos()
        with open('models/modelo_puntualidad.pkl', 'rb') as f:
            datos = pickle.load(f)
        return json_response({
            'ok': True,
            'comparacion': datos.get('comparacion', {}),
            'mejor': datos.get('nombre', 'Árbol de Decisión'),
            'metricas': datos.get('metricas', {})
        })
    except Exception as e:
        return json_response({'ok': False, 'error': str(e)}, 500)

@app.route('/resumen-ml')
def get_resumen_ml():
    try:
        stats = analisis_descriptivo()
        entrenar_modelos()
        predicciones, accuracy = predecir_puntualidad_empleados()
        with open('models/modelo_puntualidad.pkl', 'rb') as f:
            datos = pickle.load(f)
        return json_response({
            'ok': True,
            'analisis': stats,
            'predicciones': predicciones,
            'accuracy': round(accuracy * 100, 1),
            'comparacion': datos.get('comparacion', {}),
            'mejor': datos.get('nombre', 'Árbol de Decisión')
        })
    except Exception as e:
        return json_response({'ok': False, 'error': str(e)}, 500)

if __name__ == '__main__':
    print("🤖 Iniciando API ML Operix en http://localhost:5000")
    app.run(debug=True, port=5000)