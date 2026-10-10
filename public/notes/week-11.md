## Weekly Overview
Week 11 examines critical industrial IoT paradigms, focusing on Smart Grids (AMI, SCADA, PMUs), the Industrial Internet of Things (IIoT), and big data processing pipelines.

* **Lectures Included:** Lecture 51 (Smart Grid I), Lecture 52 (Smart Grid II), Lecture 53 (Industrial IoT I), Lecture 54 (Industrial IoT II), Lecture 55 (Data Handling & Analytics I).
* **Core Theme:** Two-way energy networks, Industry 4.0, predictive maintenance, and IoT big data architectures.

---

## High-Yield Concepts & Architecture

### 1. Smart Grid vs Traditional Power Grid
* **Traditional Grid:** Centralized generation, unidirectional power flow, one-way information, manual meter reading, slow restoration after blackouts.
* **Smart Grid:** Distributed generation (solar, wind), bidirectional electricity flow, two-way automated data communication, self-healing grid capabilities.
* **Core Smart Grid Subsystems:**
  * **AMI (Advanced Metering Infrastructure):** Smart meters providing real-time consumption data and dynamic pricing to utilities.
  * **SCADA (Supervisory Control and Data Acquisition):** Centralized industrial supervisory system for real-time grid monitoring and telemetry.
  * **PMUs (Phasor Measurement Units / Synchrophasors):** High-speed synchronized measurement of electrical voltage and current waveforms via GPS time stamps.

### 2. Industrial Internet of Things (IIoT) & Industry 4.0
* **Core Difference between Consumer IoT and IIoT:**
  * Consumer IoT prioritizes convenience and cost; tolerates occasional packet drops.
  * IIoT demands deterministic latency, zero downtime, ruggedized environmental resistance, and strict safety-critical compliance.
* **Key IIoT Pillars:**
  * **Predictive Maintenance:** Vibration and thermal anomaly analysis predicting equipment failure before catastrophic downtime occurs.
  * **Digital Twin:** Real-time virtual software replica of a physical machine or factory line updated by live sensor streams.

### 3. Data Handling & Analytics in IoT
* **The 4 V's of IoT Data:** Volume (massive stream count), Velocity (high-frequency telemetry), Variety (unstructured/structured sensor formats), Veracity (sensor noise/drifts).
* **Data Processing Models:**
  * **Stream Processing (In-Motion):** Processing data on-the-fly with near-zero latency (e.g., Apache Kafka, Apache Flink).
  * **Batch Processing (At-Rest):** Processing large historical datasets (e.g., Hadoop MapReduce, Apache Spark).

---

## Exam & Assignment Takeaways

| System | Role | Key Feature |
| :--- | :--- | :--- |
| **AMI** | Advanced Metering Infrastructure | Two-way automated communication between consumer and utility |
| **PMU** | Phasor Measurement Unit | High-speed GPS-synchronized waveform measurement |
| **Digital Twin** | Virtual simulation model | Real-time synchronization with physical asset telemetry |
| **IIoT Priority** | Industrial equipment reliability | Deterministic latency and zero unplanned downtime |
