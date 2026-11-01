---
title: Face & Emotion Classification
summary: Two computer vision models built from scratch. One recognizes specific people from a webcam with 98.5% accuracy; the other identifies seven emotions from a face with 62% accuracy, close to human level.
category: Deep Learning
order: 7
featured: false
type: capstone
year: 2020
role: Data collection, modelling and evaluation
data: Self-recorded webcam images (7,198) and a public facial expression dataset (35,887 images)
stack: [Python, TensorFlow / Keras, scikit-learn, OpenCV]
skills: [Python, Machine Learning, Deep Learning]
demo: face-emotion
links:
  repo: https://github.com/FreedomVAce/Face_Recognition
glance:
  problem: Two related questions of very different difficulty. Who is this person, and what are they feeling?
  did: Recorded a custom face dataset with OpenCV, built a baseline model (eigenfaces), then trained convolutional neural networks for both identity and emotion and evaluated them class by class.
  result: Face recognition reached 98.5% accuracy on held-out images. Emotion detection reached 62% across seven emotions, 2.4× better than always predicting "happy" and close to the human benchmark of about 65%.
metrics:
  - { value: '98.5%', label: 'face recognition accuracy (3 classes)' }
  - { value: '62%', label: 'emotion accuracy across 7 classes, vs 26% for always predicting "happy"' }
  - { value: '~36k', label: 'images across both models' }
icon: face
---

## What I did

- **Collected data:** recorded webcam footage with OpenCV and cropped 7,198 grayscale face images of two people plus "unknown" faces.
- **Established a baseline:** eigenfaces (PCA) with a nearest-neighbour classifier reached 95%, a useful benchmark before applying deep learning.
- **Trained two CNNs:** a four-layer network for identity (98.5%) and a deeper network with batch normalisation and dropout for seven emotions (62% on 7,066 test images).

## Results

- The face model made 22 errors across 1,440 test images and never confused the two known people with each other.
- Happy (87%) and surprise (77%) are the easiest emotions to detect; fear is the most difficult (25%) and is most often mistaken for sad.

## What I would do differently

- **Split by recording session.** Neighbouring webcam frames are near duplicates, so a random split overstates the face score; new footage would score lower.
- **Keep a separate validation set,** since the test set was also used to monitor training.
- **Train the emotion model longer, with augmentation and class weighting,** since it was still improving at 20 epochs and not overfitting.

## Technology

Python, OpenCV (capture and face detection), scikit-learn (PCA, KNN, metrics), TensorFlow / Keras (CNNs), pandas, Matplotlib and Seaborn.

*Emotion images: a public dataset derived from FER-2013. Human benchmark from Goodfellow et al. (2013), “Challenges in Representation Learning”.*
