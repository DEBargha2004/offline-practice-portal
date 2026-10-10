## Weekly Overview
Week 10 covers real-world IoT domain implementations across Smart Cities, Smart Homes, and Intelligent Transportation Systems (Connected Vehicles and VANETs).

* **Lectures Included:** Lecture 46 (Smart Cities & Homes I), Lecture 47 (Smart Cities & Homes II), Lecture 48 (Smart Cities & Homes III), Lecture 49 (Connected Vehicles I), Lecture 50 (Connected Vehicles II).
* **Core Theme:** Urban IoT architectures, home automation protocols, and vehicular communications (V2X).

---

## High-Yield Concepts & Architecture

### 1. Smart Cities & Urban IoT Architecture
* **Core Pillars:** Smart Mobility/Traffic, Smart Environment (air/water quality), Smart Energy/Grids, Smart Governance, Smart Waste Management.
* **System Characteristics:** Extreme device scale, multi-modal sensing, strict privacy requirements, public-private interoperability.

### 2. Smart Home Networks & Protocols
* **Home Automation Architecture:** Smart Appliances, Sensors, Home Gateway/Hub, Mobile Control.
* **Dominant Standards:**
  * **Zigbee (IEEE 802.15.4):** Low power, 2.4 GHz mesh.
  * **Z-Wave:** Sub-GHz mesh avoiding 2.4 GHz Wi-Fi interference.
  * **Matter / Thread:** Modern IP-based interoperability standard running over 802.15.4 mesh and Wi-Fi.

### 3. Connected Vehicles & Intelligent Transportation Systems (ITS)
* **V2X (Vehicle-to-Everything) Communication Paradigms:**
  * **V2V (Vehicle-to-Vehicle):** Direct collision warnings, emergency braking alerts, platooning.
  * **V2I (Vehicle-to-Infrastructure):** Communication with traffic lights, toll gates, and roadside units (RSUs).
  * **V2P (Vehicle-to-Pedestrian):** Collision avoidance alerts for vulnerable road users.
  * **V2N (Vehicle-to-Network):** Cellular connection to cloud navigation and fleet telematics.

### 4. VANETs (Vehicular Ad-Hoc Networks)
* **Underlying Standard:** IEEE 802.11p / DSRC (Dedicated Short-Range Communications) operating in 5.9 GHz band.
* **Cellular V2X (C-V2X):** Uses LTE and 5G sidelink (PC5 interface) for direct communication without cell tower reliance.
* **Key Challenges:** Ultra-high node mobility, rapidly changing topologies, Doppler shifts, strict sub-10 ms latency requirements for active safety.

---

## Exam & Assignment Takeaways

| V2X Mode | Communicating Parties | Primary Application |
| :--- | :--- | :--- |
| **V2V** | Vehicle to Vehicle | Forward collision warning, platooning |
| **V2I** | Vehicle to Roadside Unit (RSU) | Signal priority, electronic tolling |
| **DSRC / 802.11p** | 5.9 GHz Dedicated Band | Short-range vehicular ad-hoc safety |
| **Smart City Barrier** | Heterogeneous legacy systems | Requires standardized semantic middleware |
