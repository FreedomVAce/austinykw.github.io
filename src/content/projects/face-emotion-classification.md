---
title: Face & Emotion Classification
summary: Two computer-vision models built end to end — face recognition on a self-recorded webcam dataset (eigenfaces + KNN baseline, then a CNN at 98.5%) and seven-class emotion detection on ~36,000 public images (62%, near the ~65% human benchmark).
category: Deep Learning
order: 6
status: complete
provenance: personal
provenanceNote: Face-recognition images were recorded by the author for this project and are not published. The emotion images are a public FER-2013-derived dataset. Charts on this page are read from the saved notebook outputs.
context: Data science capstone · BrainStation
stack: [Python, TensorFlow / Keras, scikit-learn, OpenCV, NumPy, pandas]
skills: [Python, Machine Learning, Deep Learning]
demo: face-emotion
metrics:
  - { value: '98.5%', label: 'face recognition test accuracy (CNN, 3 classes)' }
  - { value: '62%', label: 'emotion detection test accuracy — 7 classes, vs 26% majority baseline' }
  - { value: '~36k', label: 'images across both models' }
links:
  repo: https://github.com/FreedomVAce/Face_Recognition
icon: face
---

## Problem

Two related questions, of very different difficulty:

1. **Who is this?** Recognise two specific people, and reject everyone else as "unknown".
2. **What are they feeling?** Classify a face into one of seven emotions.

The capstone was to build both end to end — collect or source the data, detect and crop faces, train, evaluate, and test on new photos.

## Data

| | Face recognition | Emotion detection |
|---|---|---|
| Source | Recorded with a webcam and OpenCV for this project | Public FER-2013-derived set (Kaggle "Face Expression Recognition") |
| Classes | Austin, a second person, and "Unknown" (other faces) | Angry, disgust, fear, happy, neutral, sad, surprise |
| Images | 7,198 grayscale 50×50 crops | 28,821 train / 7,066 test, resized to 50×50 |
| Balance | 41% / 33% / 26% of test set | Happy 26% of test; disgust only 1.6% |

New photos are cropped with a Haar-cascade face detector before prediction.

## Approach

**Face recognition**

1. **Baseline: KNN on raw pixels** — 94.5% accuracy, already strong.
2. **Eigenfaces: standardise → PCA (15 whitened components) → KNN** — 95.2%, from 2,500 pixel features down to 15.
3. **CNN** — four convolution + pooling blocks, two dense layers with dropout, 454,531 parameters, 10 epochs: **98.5%**.

**Emotion detection**

A deeper CNN — five convolution layers with batch normalisation and dropout after each block — trained for 20 epochs: **61.5%** on 7,066 test images.

## Results

- **Face recognition:** 22 of 1,440 test images are wrong, and every error involves the "Unknown" class — the model never confuses the two known people with each other.
- **Emotion detection:** 4.3× random guessing (14%) and 2.4× always predicting "happy" (26%), close to the roughly 65% human accuracy reported on FER-2013.
- **Easy and hard emotions:** happy (87% recall) and surprise (77%) are distinctive. Fear is the hardest — only 25% recognised, and 28% mistaken for sad. Sad absorbs errors from fear, neutral and angry faces, which gives it the lowest precision (44%).

## What a reviewer should know

Looking back at this capstone with more experience, four things matter for interpreting the numbers:

- **Near-duplicate frames inflate the face score.** The webcam recorded a continuous stream, so neighbouring frames are almost identical, and a random 80/20 split puts near-copies of training images into the test set. A fair test would hold out whole recording sessions. Accuracy on genuinely new footage would be lower than 98.5%.
- **The test set doubled as the validation set** during training, so it is not fully untouched.
- **The emotion model was still learning.** Training and test accuracy were close (64% vs 62%) and test loss was still falling at epoch 20 — it was not overfitting, as the original write-up suggested. More epochs, data augmentation and class weighting for "disgust" were the obvious next steps.
- **A preprocessing mismatch.** The emotion model trained on MobileNet-scaled pixels (−1 to 1) but the new-photo test scaled to 0–1, so those demo predictions were made on inputs the model never saw in training — a bug worth catching before deployment.

## What I learned

How you split the data matters as much as the model: a high score on correlated frames says little about new people or new sessions. And for hard, imbalanced problems, per-class recall and the confusion matrix tell the real story that a single accuracy number hides.

## Technology

Python, OpenCV (capture, Haar-cascade face detection), scikit-learn (PCA, KNN, metrics), TensorFlow / Keras (CNNs), pandas, Matplotlib and Seaborn.
