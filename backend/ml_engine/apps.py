import os
import joblib
from django.apps import AppConfig

class MlEngineConfig(AppConfig):
    name = 'ml_engine'
    rf_model = None
    encoders = None

    def ready(self):
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
        try:
            MlEngineConfig.rf_model = joblib.load(os.path.join(models_dir, 'rf_model.joblib'))
            MlEngineConfig.encoders = joblib.load(os.path.join(models_dir, 'encoders.joblib'))
        except FileNotFoundError:
            pass
