## Weekly Overview
Week 12 synthesizes real-world case studies in Agriculture, Healthcare, and Human Activity Monitoring, alongside final exam synthesis.

* **Lectures Included:** Lecture 56 (Data Handling & Analytics II), Lecture 57 (Case Study: Agriculture), Lecture 58 (Case Study: Healthcare), Lecture 59 (Activity Monitoring I), Lecture 60 (Activity Monitoring II).
* **Core Theme:** Precision agriculture, Body Area Networks (WBAN), inertial activity recognition, and end-to-end IoT systems.

---

## High-Yield Concepts & Architecture

### 1. IoT in Precision Agriculture
* **Objectives:** Maximize crop yield, optimize irrigation, reduce fertilizer overuse, and automate greenhouse climate control.
* **Key Sensing Technologies:**
  * **Soil Moisture Sensors:** Capacitive and resistive sensors monitoring root-zone water content.
  * **NDVI (Normalized Difference Vegetation Index):** Multispectral imaging measuring chlorophyll absorption to evaluate plant health.
* **Automated Actuation:** Variable Rate Irrigation (VRI) triggering solenoid valves based on real-time soil and weather forecasts.

### 2. IoT in Healthcare & Wireless Body Area Networks (WBAN)
* **Standard:** IEEE 802.15.6 (standard optimized for low-power in-body, on-body, and around-body medical sensors).
* **Components:** Wearable biosensors (ECG, SpO2, glucose, PPG), implantable nodes, medical gateways, remote clinical dashboards.
* **Stringent Requirements:** Ultra-low specific absorption rate (SAR) to prevent tissue heating, absolute patient data privacy (HIPAA/GDPR), and medical-grade reliability.

### 3. Human Activity Recognition (HAR)
* **Sensory Modalities:** Inertial Measurement Units (IMU) combining 3-axis Accelerometer, 3-axis Gyroscope, and Magnetometer.
* **Processing Pipeline:**
  1. **Data Acquisition:** Continuous sampling of acceleration and angular velocity.
  2. **Preprocessing:** Noise filtering, drift correction, gravity component separation.
  3. **Windowing:** Segmentation into overlapping sliding time windows (typically 1-3 seconds).
  4. **Feature Extraction:** Time-domain (mean, variance, standard deviation) and Frequency-domain (FFT energy, spectral entropy).
  5. **Classification:** Machine learning models (SVM, Random Forest, CNN/LSTM) identifying activities (walking, running, sitting, falling).

---

## Exam & Assignment Takeaways

| Case Study | Key Sensor / Technology | Critical Engineering Factor |
| :--- | :--- | :--- |
| **Precision Agriculture** | Soil moisture, NDVI, LoRaWAN | Long wireless range across rural acres with solar harvesting |
| **Healthcare (WBAN)** | IEEE 802.15.6, ECG, PPG | Specific Absorption Rate (SAR) limits and patient privacy |
| **Activity Monitoring** | Tri-axial Accelerometer & Gyroscope | Sliding window segmentation and gravity vector separation |
