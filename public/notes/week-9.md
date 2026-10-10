## Weekly Overview
Week 9 explores practical cloud deployments for IoT, Sensor-Cloud integration models, and Fog/Edge Computing architectures that bridge latency-sensitive sensors with the cloud.

* **Lectures Included:** Lecture 41 (Cloud Computing Practical), Lecture 42 (Sensor-Cloud I), Lecture 43 (Sensor-Cloud II), Lecture 44 (Fog Computing I), Lecture 45 (Fog Computing II).
* **Core Theme:** Virtual sensors, sensor-cloud multi-tenancy, fog vs cloud trade-offs, and edge intelligence.

---

## High-Yield Concepts & Architecture

### 1. Sensor-Cloud Architecture
* **Concept:** Virtualizes physical Wireless Sensor Networks (WSNs) into elastic cloud services.
* **Virtual Sensor:** Software abstraction representing a physical sensor or an aggregated cluster of sensor nodes.
* **Key Advantages:**
  * Multiple users/applications can share the same physical sensor infrastructure concurrently (multi-tenancy).
  * Decouples physical sensor owners from end-user consumers through cloud billing models (Sensing as a Service).
  * Overcomes individual sensor resource limits (storage, processing) through cloud compute.

### 2. Fog Computing vs Cloud Computing
* **Motivation for Fog:** Transmitting raw, high-frequency IoT data to distant cloud data centers introduces high latency, consumes excessive bandwidth, and risks privacy leaks.
* **Definition of Fog:** A decentralized computing infrastructure located between smart edge devices and the traditional cloud.
* **Key Characteristics of Fog:**
  * **Low Latency & High Responsiveness:** Fog nodes sit close to sensor endpoints (local LAN).
  * **Location Awareness:** Fog nodes possess geographical context.
  * **Bandwidth Optimization:** Performs local data filtering, aggregation, and anomaly detection before uplinking summaries to cloud.
  * **Offline Autonomy:** Can make localized decisions even if internet backhaul connection drops.

### 3. Edge vs Fog Computing
* **Edge Computing:** Data processing occurring directly at the device edge (on microcontroller, smart camera, or local sensor gateway).
* **Fog Computing:** System-level architecture spanning the entire network continuum from edge devices to the cloud core.

---

## Exam & Assignment Takeaways

| Attribute | Cloud Computing | Fog / Edge Computing |
| :--- | :--- | :--- |
| **Latency** | High (tens to hundreds of ms) | Ultra-low (sub-millisecond to low ms) |
| **Location** | Centralized mega data centers | Distributed at local network edge |
| **Bandwidth Demand** | Massive (uplinking raw streams) | Low (transmits filtered summaries) |
| **Context Awareness** | Global state | Localized & location-aware |
| **Sensor-Cloud** | Virtual Sensors enable multi-tenant WSN sharing | Physical sensors abstracted as cloud services |
