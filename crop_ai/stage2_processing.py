"""STAGE 2 - PROCESSING: Clean, impute, scale, and stratify dataset."""
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from stage1_data import FEATURES

def process(df):
    rep = {
        "raw_rows": int(len(df)),
        "missing": int(df[FEATURES].isna().sum().sum()),
        "classes": int(df["crop"].nunique())
    }
    # Deduplicate
    df = df.drop_duplicates().copy()

    # Outlier clipping
    for c in FEATURES:
        lo, hi = df[c].quantile([0.005, 0.995])
        df[c] = df[c].clip(lo, hi)

    # Median Imputation
    imputer = SimpleImputer(strategy="median")
    X_imputed = imputer.fit_transform(df[FEATURES])

    # Label Encoding
    le = LabelEncoder()
    y = le.fit_transform(df["crop"])

    # Stratified Train/Test Split (80% Train, 20% Test)
    Xtr, Xte, ytr, yte = train_test_split(
        X_imputed, y, test_size=0.20, stratify=y, random_state=42
    )

    # Standard Scaling
    sc = StandardScaler().fit(Xtr)
    Xtr_sc = sc.transform(Xtr)
    Xte_sc = sc.transform(Xte)

    rep.update({
        "clean_rows": int(len(df)),
        "train": int(len(Xtr)),
        "test": int(len(Xte))
    })

    return Xtr_sc, Xte_sc, ytr, yte, sc, le, rep, imputer