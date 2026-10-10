## Weekly Overview
Week 1 covers the foundational building blocks of the Internet of Things, transitioning from ubiquitous connectivity visions to the physical interfacing layers (sensors and actuators) and initial network models.

* **Lectures Included:** Lecture 1 (Introduction I), Lecture 2 (Introduction II), Lecture 3 (Sensing), Lecture 4 (Actuation), Lecture 5 (Basics of IoT Networking I).
* **Core Theme:** Architecture, smart devices, transducers, and multi-access networking.

---

## High-Yield Concepts & Architecture

### 1. IoT Vision & Structural Evolution
* **Definition:** Network of physical objects embedded with electronics, software, sensors, and actuators communicating over standard protocols.
* **Paradigm:** "Anytime, Anyplace, Anything" connectivity.
* **Evolutionary Chain:** Cyber-Physical Systems (CPS) -> Wireless Sensor Networks (WSN) -> M2M -> Internet of Things (IoT).
* **Key Challenges:** Trillion-node scalability, IPv6 address exhaustion, device heterogeneity, interoperability, and end-to-end security.

### 2. Sensing & Transducers
* **Transducer:** Converts energy from one physical domain to another.
  * **Sensor:** Physical stimulus -> Measurable electrical signal (analog voltage/current or digital).
  * **Actuator:** Electrical control signal -> Physical mechanical action or state change.
* **Key Sensor Characteristics:**
  * **Sensitivity:** Ratio of electrical output change to physical input change (delta V / delta S).
  * **Resolution:** Smallest detectable increment in the physical parameter.
  * **Linearity & Accuracy:** Closeness of output curve to true input vs closeness to actual ground-truth value.
  * **Hysteresis:** Output difference depending on whether input is increasing or decreasing.

### 3. Actuation Technologies
* **Hydraulic Actuators:** Fluid-pressure driven; exceptional force and load capacity; high stiffness; risks hydraulic fluid leaks.
* **Pneumatic Actuators:** Compressed gas driven; fast response, intrinsically explosion-safe, low contamination; lower precision due to air compressibility.
* **Electric Actuators:** High precision, clean, easily controlled by microcontrollers (servos, steppers, solenoids, relays).
* **Thermal / Magnetic Actuators:** Shape memory alloys (SMA), bimetallic strips, solenoid plungers.

### 4. Networking Fundamentals for IoT
* **Functional Building Blocks:** Devices/Things, Gateways/Edge Nodes, Network Infrastructure, Cloud Platforms, and Applications.
* **Network Topologies:** Star (simple, single point of failure at hub), Mesh (high resilience, multi-hop, higher routing overhead), Tree (hierarchical).
* **TCP/IP vs IoT Stack:** Heavyweight protocols (TCP, HTTP) adapted into low-overhead equivalents (UDP, CoAP, MQTT) for resource-constrained radio channels.

---

## Exam & Assignment Takeaways

| Topic | Critical Fact / Value | Typical Trap |
| :--- | :--- | :--- |
| **Sensing vs Actuation** | Sensors measure; Actuators manipulate physical environment | Confusing inputs and outputs |
| **Hydraulic vs Pneumatic** | Hydraulic uses liquid (high force); Pneumatic uses compressed air (rapid, clean) | Air is compressible, liquid is virtually incompressible |
| **Connectivity Scale** | Expected scale is tens of billions to trillions of physical endpoints | Confusing human internet users with IoT device endpoints |
| **Network Roles** | Edge nodes gather sensor data; Gateways bridge heterogeneous protocols | Assuming sensors talk directly to cloud without translation |
