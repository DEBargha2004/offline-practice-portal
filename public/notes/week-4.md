## Weekly Overview
Week 4 covers advanced WSN deployment models, coverage and connectivity formulations, aerial node networks (UAVs/FANETs), and Machine-to-Machine (M2M) communications.

* **Lectures Included:** Lecture 16 (WSN Applications), Lecture 17 (Coverage & Connectivity), Lecture 18 (Routing & Aggregation), Lecture 19 (UAV Networks), Lecture 20 (Machine to Machine Communication).
* **Core Theme:** Network coverage criteria, mobile/aerial sensor nodes, and M2M architectural frameworks.

---

## High-Yield Concepts & Architecture

### 1. Coverage & Connectivity in Sensor Networks
* **Coverage:** How thoroughly the sensor field is monitored by active nodes.
  * **Area Coverage:** Every point in the target region is covered by at least one sensor (1-coverage) or $ sensors (hBccoverage for redundancy).
  * **Point/Target Coverage:** Monitoring specific discrete targets.
  * **Barrier Coverage:** Detecting intruders crossing a boundary.
* **Connectivity:** Existence of active multi-hop communication paths between any sensor and the sink.
* **Fundamental Rule:** If transmission radius  \ge 2 	imes R_s$ (sensing radius), complete coverage guarantees complete network connectivity in convex regions.

### 2. Unmanned Aerial Vehicle (UAV) Networks / FANETs
* **Flying Ad-Hoc Networks (FANET):** High mobility, dynamic 3D topology, line-of-sight propagation, and short link lifetime.
* **UAV Roles:** Mobile sink (collecting data from ground sensors), aerial relay, disaster reconnaissance, payload delivery.
* **Challenges:** Stringent battery lifetime, aerodynamic payload limits, strict collision avoidance.

### 3. Machine-to-Machine (M2M) Communication
* **Definition:** Direct autonomous data exchange between industrial machines or smart devices without human intervention.
* **M2M Architecture (ETSI Framework):**
  * **M2M Device Domain:** End-devices, sensor nodes, and M2M Gateways.
  * **Network Domain:** Cellular (LTE/5G, NB-IoT), satellite, and wired core networks.
  * **Application Domain:** Middlewares, fleet telematics, predictive maintenance services.
* **Difference between M2M and IoT:** M2M is typically point-to-point, siloed, hardware-centric; IoT is open, cloud-integrated, internet-protocol based.

---

## Exam & Assignment Takeaways

| Principle | Formula / Property | Core Fact |
| :--- | :--- | :--- |
| **Coverage vs Connectivity** |  \ge 2 R_s$ | Coverage implies connectivity if transmission radius is double sensing radius |
| **FANET Topology** | 3-Dimensional & highly dynamic | Nodes move rapidly; requires predictive routing |
| **M2M vs IoT** | Point-to-point vs Internet-scale | M2M connects specific machines; IoT integrates open web architectures |
