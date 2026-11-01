---
title: Applied AI at Work
summary: 'Three AI services that automate slow, manual catalogue and support work: an LLM that categorizes products, a model that classifies product images and a chatbot backend on AWS.'
category: LLM & AI Engineering
order: 1
featured: true
type: work
year: 2025 – 2026
role: Design and implementation of all three services
data: The company's product catalogue and product images
stack: [Python, FastAPI, LLMs, TensorFlow / Keras, AWS Bedrock, AWS Lambda]
skills: [LLM & AI, Machine Learning, Deep Learning, Python, Cloud]
demo: ai-architecture
glance:
  problem: Assigning new products to a large category tree and sorting every product image were manual, time-consuming tasks, and results varied from one person to the next. Employees also needed a faster way to find answers than searching for them.
  did: 'Designed and built three services: an LLM that suggests each product''s category with a confidence score, a CNN that classifies product images with a single click inside the internal application, and the AWS backend for an internal chatbot.'
  result: Routine cases are now handled automatically and only uncertain ones are routed for human review, image classification moved from manual sorting to a single click, and the chatbot runs serverless with credentials kept out of the code.
metrics:
  - { value: '3', label: 'AI services designed and built' }
  - { value: '1 click', label: 'to classify a product’s images, instead of sorting each one manually' }
  - { value: '3 routes', label: 'auto-accept, spot-check or human review, based on model confidence' }
icon: sparkles
---

## Why it mattered

A distributor's catalogue is only useful when every product sits in the right category with the right images. Manual classification does not scale as the catalogue grows, and different people reach different answers. All three projects shared one goal: let a model handle the routine work while keeping a person in control wherever the model is uncertain.

## 1 · Product categorization with an LLM

- **What it does:** suggests where a new product belongs in a multi-level category tree, based on its name, description, brand and features.
- **How:** the prompt includes the category tree and similar products the team has already classified. Each answer is validated against the actual tree and scored using several independent confidence signals.
- **Why it is safe to use:** each prediction is routed to auto-accept, spot-check or human review based on its score, and reviewer corrections feed into later prompts, so accuracy improves without retraining.
- **Built with:** Python, FastAPI, a local LLM or AWS Bedrock, Docker, automated tests and a batch tool for accuracy audits.

## 2 · Product image classifier

- **What it does:** classifies each product image into a category, such as a product shot or a lifestyle image, replacing a process of sorting images one by one.
- **How:** a convolutional neural network trained on images the team had already sorted, served through FastAPI and integrated into the internal Java application as a "Classify images" button.
- **Why it is safe to use:** every prediction carries a confidence score, so uncertain images can be reviewed by a person. Delivery was phased: first brand by brand, using fully labelled products as ground truth, then a single model across all brands.
- **Built with:** Python, TensorFlow / Keras, FastAPI.

## 3 · AI chatbot backend on AWS

- **What it does:** gives an internal assistant a secure way to send employee questions to a large language model and return the answer.
- **How:** an **AWS Lambda** function handles each request and calls a foundation model on **Amazon Bedrock**. Its credentials are stored in **AWS Secrets Manager** and read at run time, never written into code. **AWS IAM** roles and policies define what the function can access.
- **Why this design:** a serverless setup has nothing to keep running between requests, and access is controlled in one place.

## What I learned

The model is usually the simplest part. What makes AI useful in a business is everything around it: validating its answers against reality, recognizing when it is uncertain, embedding it in the tools people already use, and keeping credentials and permissions under control.
