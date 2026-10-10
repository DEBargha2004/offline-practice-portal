## Weekly Overview
Week 7 covers advanced Raspberry Pi implementations and transitions into modern Software-Defined Networking (SDN) and Software-Defined IoT (SD-IoT).

* **Lectures Included:** Lecture 31 (IoT Implementation with Raspberry Pi II), Lecture 32 (IoT Implementation with Raspberry Pi III), Lecture 33 (SDN Part I), Lecture 34 (SDN Part II), Lecture 35 (Software Defined IoT Networking I).
* **Core Theme:** Camera and cloud connectivity on Pi, SDN architectural planes, and programmable IoT networks.

---

## High-Yield Concepts & Architecture

### 1. Software-Defined Networking (SDN) Core Principles
* **Decoupling of Planes:**
  * **Control Plane:** The "brain"; decides routing, forwarding policies, and traffic pathing.
  * **Data Plane (Forwarding Plane):** Fast packet switching hardware; blindly forwards packets matching flow table entries.
* **Centralization:** Central controller maintains a global view of network state and topology.
* **Programmability:** Network behavior configured dynamically via software without manual box-by-box re-configuration.

### 2. SDN Architecture Layers & Interfaces
* **Infrastructure Layer:** Physical/virtual packet forwarding switches (e.g., OpenFlow switches).
* **Southbound Interface:** Connects controller to data plane switches (Standard: **OpenFlow**).
* **Control Layer:** Centralized SDN Controller (e.g., Ryu, ONOS, OpenDaylight).
* **Northbound Interface:** REST APIs exposing network services to application layers.
* **Application Layer:** Routing applications, traffic engineering, firewalls, and QoS monitors.

### 3. OpenFlow Protocol Mechanisms
* **Flow Table:** Switches store flow tables consisting of match fields, priority, counters, and instructions/actions.
* **Packet Handling:**
  * When a packet arrives, switch matches headers against flow entries.
  * If a match occurs: execute action (Forward, Drop, Modify header).
  * If Table-Miss: packet header sent to controller via  message.
  * Controller replies with  or  to install rules.

### 4. Software-Defined IoT (SD-IoT)
* Addresses IoT network volatility, heterogeneous protocols, dynamic sleep cycles, and mobile sensor routing by centralizing policy decisions in an IoT-aware SDN controller.

---

## Exam & Assignment Takeaways

| Plane / Interface | Function | Typical Technology |
| :--- | :--- | :--- |
| **Data Plane** | High-speed packet forwarding | OpenFlow Switches |
| **Southbound API** | Controller to Switch communication | OpenFlow protocol |
| **Control Plane** | Global routing and policy logic | Ryu, OpenDaylight, ONOS |
| **Northbound API** | Controller to Business Applications | RESTful APIs |
