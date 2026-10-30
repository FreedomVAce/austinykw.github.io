---
title: Applied AI at Work
summary: Three AI services that take slow, manual catalogue and support work off people's desks — an LLM that categorizes products, a model that sorts product images, and a chatbot backend on AWS.
category: LLM & AI Engineering
order: 3
featured: true
type: work
year: 2025 – 2026
role: Design and implementation of all three services
data: The company's product catalogue and product images
stack: [Python, FastAPI, LLMs, TensorFlow / Keras, AWS Bedrock, AWS Lambda]
skills: [LLM & AI, Machine Learning, Deep Learning, Python, Cloud]
demo: ai-architecture
glance:
  problem: Filing new products into a large category tree and sorting every product image were manual, click-heavy and inconsistent between people. Staff also needed a quicker way to get answers than searching for them.
  did: I built three services — an LLM that suggests each product's category and says how sure it is, a CNN that classifies product images behind a one-click button in the internal application, and the AWS backend for an internal chatbot.
  result: Routine cases are handled automatically and only uncertain ones go to a person, the image workflow went from manual dragging to one click, and the chatbot runs serverless with credentials kept out of the code.
metrics:
  - { value: '3', label: 'AI services designed and built' }
  - { value: '1 click', label: 'to classify a product’s images, instead of sorting each by hand' }
  - { value: '3 routes', label: 'auto-accept, spot-check or human review — by model confidence' }
icon: sparkles
---

## Why it mattered

A distributor's catalogue only works if every product is in the right category with the right images. Doing that by hand does not scale as the catalogue grows, and it produces different answers from different people. The goal in all three projects was the same: let a model handle the routine work, and keep a person in charge wherever the model is unsure.

## 1 · Product categorization with an LLM

- **What it does:** suggests where a new product belongs in a multi-level category tree, from its name, description, brand and features.
- **How:** the prompt includes the category tree and similar products staff have already filed; the answer is checked against the real tree and scored using several independent signals of confidence.
- **Why it is safe to use:** each prediction is routed to auto-accept, spot-check or human review by its score, and reviewer corrections feed back into later prompts — so it improves without retraining.
- **Built with:** Python, FastAPI, a local LLM or AWS Bedrock, Docker, automated tests and a batch tool for accuracy audits.

## 2 · Product image classifier

- **What it does:** sorts each product image into a category (for example, product shot or lifestyle image) — work that used to mean dragging images one by one.
- **How:** a convolutional neural network trained on images staff had already sorted, served by FastAPI and wired into the internal Java application as a "Classify images" button.
- **Why it is safe to use:** every prediction carries a confidence score, so uncertain images can be checked by a person. Delivery was phased: brand by brand first, using fully labelled products as ground truth, then one model across brands.
- **Built with:** Python, TensorFlow / Keras, FastAPI.

## 3 · AI chatbot backend on AWS

- **What it does:** gives an internal assistant a secure way to send staff questions to a large language model and return the answer.
- **How:** an **AWS Lambda** function handles each request and calls a foundation model on **Amazon Bedrock**. The credentials it needs are stored in **AWS Secrets Manager** and read at run time, never written into code. **AWS IAM** roles and policies define what the function is allowed to access.
- **Why this design:** serverless — nothing to keep running between questions — and access is controlled in one place.

## What I learned

The model is usually the easy part. What makes AI useful in a business is everything around it: checking its answers against reality, knowing when it is unsure, putting it inside the tool people already use, and keeping credentials and permissions under control.
