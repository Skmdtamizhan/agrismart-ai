"""STAGE 3 - AI/ML: Train & evaluate agricultural classifiers."""
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import cross_val_score

def train(Xtr, Xte, ytr, yte):
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=16, random_state=42),
        "Extra Trees": ExtraTreesClassifier(n_estimators=150, random_state=42),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5, weights="distance"),
        "Naive Bayes": GaussianNB()
    }
    scores = {}
    for name, model in models.items():
        cv = cross_val_score(model, Xtr, ytr, cv=5, scoring="accuracy").mean()
        model.fit(Xtr, ytr)
        test_acc = model.score(Xte, yte)
        scores[name] = {"cv": float(cv), "test": float(test_acc)}

    best = max(scores, key=lambda k: scores[k]["test"])
    return models[best], best, scores