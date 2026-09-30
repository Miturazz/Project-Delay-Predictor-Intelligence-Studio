import { ModelHyperparameters, MLModelType } from '../types/ml';

export function generatePythonMLScript(
  modelType: MLModelType,
  hyperparameters: ModelHyperparameters
): string {
  const modelClass =
    modelType === 'gbdt'
      ? `from xgboost import XGBClassifier\nmodel = XGBClassifier(\n    n_estimators=${hyperparameters.numEstimators},\n    max_depth=${hyperparameters.maxDepth},\n    learning_rate=${hyperparameters.learningRate},\n    random_state=42,\n    eval_metric='logloss'\n)`
      : modelType === 'random_forest'
      ? `from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(\n    n_estimators=${hyperparameters.numEstimators},\n    max_depth=${hyperparameters.maxDepth},\n    min_samples_split=${hyperparameters.minSamplesSplit},\n    random_state=42\n)`
      : `from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(\n    C=${(1 / hyperparameters.regularizationL2).toFixed(2)},\n    penalty='l2',\n    solver='lbfgs',\n    max_iter=1000,\n    random_state=42\n)`;

  return `"""
ChronosML: Large-Scale Project Delay Prediction Pipeline
Trained on Historical Project Delivery, Team Productivity & Organizational Metrics.
Ready for Scikit-Learn / XGBoost & Production Serving.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, brier_score_loss
import joblib

# 1. Feature Definition & Domain Engineering
FEATURE_COLUMNS = [
    'velocityReliability',      # % sprint commitments delivered
    'overtimeHoursPerWeek',    # Burnout / defect escalation index
    'approvalLatencyDays',     # Code review & sign-off cycle time
    'sprintVelocity',          # Story points / engineer / month
    'stakeholderLatencyDays',  # Executive & client approval latency
    'teamSize',                # Total core engineering headcount
    'seniorJuniorRatio',       # Staff/Senior to Junior ratio
    'annualAttritionRate',     # Annual turnover percentage
    'newHireRampRatio',        # Onboarded within last 90 days (%)
    'podModularity',           # Decoupled squad modularity (1 to 5)
    'plannedDurationMonths',   # Baseline contractual timeline
    'budgetMillions',          # Total budget allocated ($M)
    'requirementsVolatility',  # Scope churn rate (%)
    'dependencyCount',         # Cross-vendor & system dependencies
    'techNoveltyRisk',         # Tech stack novelty score (1 to 5)
    'earlyMilestoneSlippage',   # Variance at 25% schedule gate (%)
    'brooksOverheadIndex'      # Normalized non-linear communication overhead
]

TARGET_COLUMN = 'isDelayed'

def compute_brooks_index(team_size: float, pod_modularity: float) -> float:
    """Brooks' Law: Communication channels scale with N*(N-1)/2, modulated by squad autonomy."""
    raw_channels = (team_size * (team_size - 1)) / 2.0
    effective_channels = raw_channels / max(1.0, pod_modularity * 1.8)
    return float(np.round(effective_channels / (effective_channels + 250.0), 3))

def train_chronos_pipeline(data_path: str = 'project_delay_historical_data.csv'):
    print("Loading historical project management dataset...")
    df = pd.read_csv(data_path)

    # Validate / compute Brooks' overhead index if missing
    if 'brooksOverheadIndex' not in df.columns:
        df['brooksOverheadIndex'] = df.apply(
            lambda r: compute_brooks_index(r['teamSize'], r['podModularity']), axis=1
        )

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Stratified Train/Test Split (${Math.round(hyperparameters.trainTestSplit * 100)} / ${Math.round((1 - hyperparameters.trainTestSplit) * 100)})
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=${(1 - hyperparameters.trainTestSplit).toFixed(2)},
        stratify=y,
        random_state=42
    )

    print(f"Training set: {X_train.shape[0]} projects | Test set: {X_test.shape[0]} projects")

    # Define Model
    ${modelClass}

    # Assembling Scaler + Estimator Pipeline
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', model)
    ])

    print("Fitting model with Cross-Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring='roc_auc')
    print(f"5-Fold CV AUC-ROC: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

    pipeline.fit(X_train, y_train)

    # Evaluation on Hold-Out Test Set
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= ${hyperparameters.decisionThreshold.toFixed(2)}).astype(int)

    roc_auc = roc_auc_score(y_test, y_pred_proba)
    print(f"Holdout AUC-ROC: {roc_auc:.3f}")
    print("\\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['On-Time', 'Delayed']))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save artifact
    joblib.dump(pipeline, 'chronos_delay_predictor_model.joblib')
    print("Successfully exported pipeline to chronos_delay_predictor_model.joblib")
    return pipeline

if __name__ == '__main__':
    train_chronos_pipeline()
`;
}

export function generateFastApiServingScript(): string {
  return `"""
Production REST API Microservice for ChronosML Project Delay Predictor
Run with: uvicorn app:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(
    title="ChronosML Project Delivery API",
    description="Real-time delay prediction based on project metrics & team productivity.",
    version="1.0.0"
)

# Load serialized pipeline artifact
pipeline = joblib.load('chronos_delay_predictor_model.joblib')

class ProjectInput(BaseModel):
    projectName: str = Field("Project Apollo", description="Name of the initiative")
    teamSize: int = Field(50, ge=4, le=500, description="Core engineering FTEs")
    velocityReliability: float = Field(75.0, ge=30.0, le=100.0, description="Commitment completion %")
    overtimeHoursPerWeek: float = Field(6.0, ge=0.0, le=35.0, description="Burnout / overtime index")
    approvalLatencyDays: float = Field(2.5, ge=0.2, le=15.0, description="PR turnaround latency")
    sprintVelocity: float = Field(32.0, ge=5.0, le=80.0, description="Points/person/month")
    stakeholderLatencyDays: float = Field(12.0, ge=1.0, le=60.0, description="Stakeholder sign-off wait")
    seniorJuniorRatio: float = Field(0.35, ge=0.05, le=1.0, description="Senior lead to junior ratio")
    annualAttritionRate: float = Field(12.0, ge=0.0, le=50.0, description="Turnover % per year")
    newHireRampRatio: float = Field(15.0, ge=0.0, le=80.0, description="Ramp-up ratio %")
    podModularity: int = Field(3, ge=1, le=5, description="Squad modularity 1-5")
    plannedDurationMonths: int = Field(18, ge=3, le=72, description="Target timeline")
    budgetMillions: float = Field(20.0, ge=0.5, le=500.0, description="Capital budget $M")
    requirementsVolatility: float = Field(25.0, ge=0.0, le=100.0, description="Scope churn %")
    dependencyCount: int = Field(8, ge=0, le=60, description="External dependencies")
    techNoveltyRisk: int = Field(2, ge=1, le=5, description="Technology novelty 1-5")
    earlyMilestoneSlippage: float = Field(5.0, ge=-25.0, le=100.0, description="Variance at 25% gate")

class PredictionResponse(BaseModel):
    delayProbability: float
    isDelayed: bool
    riskTier: str
    expectedDelayMonths: float
    brooksOverheadIndex: float

@app.post("/predict", response_model=PredictionResponse)
def predict_project_delay(p: ProjectInput):
    # Calculate Brooks' communication factor
    raw_channels = (p.teamSize * (p.teamSize - 1)) / 2.0
    effective_channels = raw_channels / max(1.0, p.podModularity * 1.8)
    brooks = float(np.round(effective_channels / (effective_channels + 250.0), 3))

    features = np.array([[
        p.velocityReliability,
        p.overtimeHoursPerWeek,
        p.approvalLatencyDays,
        p.sprintVelocity,
        p.stakeholderLatencyDays,
        p.teamSize,
        p.seniorJuniorRatio,
        p.annualAttritionRate,
        p.newHireRampRatio,
        p.podModularity,
        p.plannedDurationMonths,
        p.budgetMillions,
        p.requirementsVolatility,
        p.dependencyCount,
        p.techNoveltyRisk,
        p.earlyMilestoneSlippage,
        brooks
    ]])

    prob = float(pipeline.predict_proba(features)[0][1])
    is_delayed = prob >= 0.50
    expected_delay = round(max(0.0, (prob - 0.4) * 0.75 * p.plannedDurationMonths + prob * 2.8), 1)

    tier = "Critical Delay Risk" if prob >= 0.75 else "Elevated Risk" if prob >= 0.50 else "Moderate Risk" if prob >= 0.30 else "Minimal Risk"

    return PredictionResponse(
        delayProbability=round(prob, 3),
        isDelayed=is_delayed,
        riskTier=tier,
        expectedDelayMonths=expected_delay,
        brooksOverheadIndex=brooks
    )
`;
}
