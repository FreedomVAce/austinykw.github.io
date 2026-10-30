---
title: Face & Emotion Classification
summary: Two computer-vision models built from scratch — one recognises specific people from a webcam (98.5% accurate), the other reads seven emotions from a face (62%, near human level).
category: Deep Learning
order: 7
featured: false
type: capstone
year: 2020
role: Data collection, modelling and evaluation
data: Self-recorded webcam images (7,198) and a public facial-expression dataset (35,887 images)
stack: [Python, TensorFlow / Keras, scikit-learn, OpenCV]
skills: [Python, Machine Learning, Deep Learning]
demo: face-emotion
links:
  repo: https://github.com/FreedomVAce/Face_Recognition
glance:
  problem: Two related questions of very different difficulty — who is this person, and what are they feeling?
  did: I recorded my own face dataset with OpenCV, built a simple baseline (eigenfaces), then trained convolutional neural networks for both identity and emotion and evaluated them class by class.
  result: Face recognition reached 98.5% on held-out images; emotion detection reached 62% across seven emotions — 2.4× better than always guessing "happy" and close to the ~65% human benchmark.
metrics:
  - { value: '98.5%', label: 'face recognition accuracy (3 classes)' }
  - { value: '62%', label: 'emotion accuracy across 7 classes — vs 26% for always guessing "happy"' }
  - { value: '~36k', label: 'images across both models' }
icon: face
---

## What I did

- **Collected data:** recorded webcam footage with OpenCV and cropped 7,198 grayscale face images of two people plus "unknown" faces.
- **Started with a baseline:** eigenfaces (PCA) with a nearest-neighbour classifier already reached 95% — a useful benchmark before any deep learning.
- **Trained two CNNs:** a four-layer network for identity (98.5%) and a deeper network with batch normalisation and dropout for seven emotions (62% on 7,066 test images).

## Results

- The face model made 22 mistakes in 1,440 test images, and never confused the two known people with each other.
- Happy (87%) and surprise (77%) are the easiest emotions; fear is the hardest (25%) and is most often mistaken for sad.

## What I would do differently

- **Split by recording session.** Neighbouring webcam frames are near-duplicates, so a random split flatters the face score; new footage would score lower.
- **Keep a separate validation set** — the test set was also used to monitor training.
- **Train the emotion model longer, with augmentation and class weighting** — it was still improving at 20 epochs, not overfitting.

## Technology

Python, OpenCV (capture and face detection), scikit-learn (PCA, KNN, metrics), TensorFlow / Keras (CNNs), pandas, Matplotlib and Seaborn.

*Emotion images: a public dataset derived from FER-2013. Human benchmark from Goodfellow et al. (2013), “Challenges in Representation Learning”.*
