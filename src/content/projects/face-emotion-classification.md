---
title: Face & Emotion Classification
summary: Face recognition and facial-emotion detection — eigenfaces with PCA and KNN as a baseline, then convolutional neural networks for both identity and emotion.
category: Deep Learning
order: 6
status: complete
provenance: personal
provenanceNote: The face-recognition images were recorded by the author for this project and are not published.
context: Data science capstone · BrainStation
stack: [Python, TensorFlow / Keras, scikit-learn, OpenCV, NumPy]
skills: [Python, Machine Learning, Deep Learning]
metrics:
  - { value: '98%', label: 'test accuracy, 3-class face recognition (CNN)' }
  - { value: '95%', label: 'test accuracy with PCA + KNN baseline' }
  - { value: '~62%', label: 'test accuracy, emotion detection (CNN)' }
links:
  repo: https://github.com/FreedomVAce/Face_Recognition
icon: face
---

## Problem

Can a small, self-collected image dataset support reliable face recognition, and how much harder is recognising *emotion* than recognising *who* someone is?

## Data

- **Face recognition** — grayscale 50×50 face crops captured with OpenCV, three classes (two people plus "unknown"), split 80/20.
- **Emotion detection** — a labelled facial-expression image set fed through Keras image generators.

## Approach

1. **Baseline: eigenfaces.** PCA reduces each 2,500-pixel image to 15 whitened components; KNN classifies in that space.
2. **CNN for identity.** Four convolutional layers and two fully connected layers.
3. **CNN for emotion.** Five convolutional layers with batch normalisation and dropout to control overfitting.

## Results

| Task | Model | Test accuracy |
|---|---|---|
| Face recognition | PCA + KNN | 95% |
| Face recognition | CNN | 98% |
| Emotion detection | CNN | 60–64% |

## What I learned

Identity is easy on a small, controlled dataset; emotion is much harder because expressions vary within each person and between people. Validation loss started rising after about 13 epochs on the emotion model, which made the case for early stopping, augmentation and pretrained backbones as the next step.
