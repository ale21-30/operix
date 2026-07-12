from flask import Flask, jsonify, json
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from analisis import analisis_descriptivo, predecir_puntualidad_empleados
from modelo import entrenar_modelos
import os
import pickle
import math

class CustomJSONProvider(DefaultJSONProvider):
    def dumps(self, obj, **kwargs):
        def clean(o):
            if isinstance(o, dict):
                return {k: clean(v) for k, v in o.items()}
            elif isinstance(o, list):
                return [clean(v) for v in o]
            elif isinstance(o, float) and (math.isnan(o) or math.isinf(o)):
                return None
            return o
        return json.dumps(clean(obj), **kwargs)

app = Flask(__name__)
app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def home():
    return jsonify({'mensaje': 'API ML Operix funcionando ✓'})

@app.route('/analisis')
def get_analisis():
    try:
        stats = analisis_descriptivo()
        return jsonify({ 'ok': True, 'data': stats })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/entrenar')
def get_entrenar():
    try:
        mejor_modelo, mejor_metricas, m_arbol, m_logistica = entrenar_modelos()
        return jsonify({
            'ok':        True,
            'mensaje':   'Modelos entrenados correctamente',
            'comparacion': {
                'arbol':    { 'accuracy': m_arbol['accuracy'],    'f1': m_arbol['f1'] },
                'logistica':{ 'accuracy': m_logistica['accuracy'],'f1': m_logistica['f1'] }
            }
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/predicciones')
def get_predicciones():
    try:
        if not os.path.exists('models/modelo_puntualidad.pkl'):
            entrenar_modelos()
        predicciones, accuracy = predecir_puntualidad_empleados()
        return jsonify({
            'ok':           True,
            'predicciones': predicciones,
            'accuracy':     round(accuracy * 100, 1)
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/comparacion')
def get_comparacion():
    try:
        if not os.path.exists('models/modelo_puntualidad.pkl'):
            entrenar_modelos()
        with open('models/modelo_puntualidad.pkl', 'rb') as f:
            datos = pickle.load(f)
        return jsonify({
            'ok':          True,
            'comparacion': datos.get('comparacion', {}),
            'mejor':       datos.get('nombre', 'Árbol de Decisión'),
            'metricas':    datos.get('metricas', {})
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

@app.route('/resumen-ml')
def get_resumen_ml():
    try:
        stats = analisis_descriptivo()
        entrenar_modelos()
        predicciones, accuracy = predecir_puntualidad_empleados()
        with open('models/modelo_puntualidad.pkl', 'rb') as f:
            datos = pickle.load(f)
        return jsonify({
            'ok':          True,
            'analisis':    stats,
            'predicciones':predicciones,
            'accuracy':    round(accuracy * 100, 1),
            'comparacion': datos.get('comparacion', {}),
            'mejor':       datos.get('nombre', 'Árbol de Decisión')
        })
    except Exception as e:
        return jsonify({ 'ok': False, 'error': str(e) }), 500

if __name__ == '__main__':
    print("🤖 Iniciando API ML Operix en http://localhost:5000")
    app.run(debug=True, port=5000)