## Weekly Overview
Week 3 explores industrial wireless connectivity standards, personal-area network standards (Bluetooth, BLE, Z-Wave), and the core topologies and node models of Wireless Sensor Networks (WSN).

* **Lectures Included:** Lecture 11 (WirelessHART & Industrial IoT), Lecture 12 (Bluetooth & BLE), Lecture 13 (Z-Wave & Home Automation), Lecture 14 (Sensor Networks I), Lecture 15 (Sensor Networks II).
* **Core Theme:** Deterministic industrial mesh, ultra-low-power short-range protocols, and sensor network topologies.

---

## High-Yield Concepts & Architecture

### 1. Industrial Wireless: WirelessHART & ISA100.11a
* **WirelessHART (IEC 62591):** Industrial standard built atop IEEE 802.15.4 radio for harsh factory environments.
* **Deterministic Mechanism:** Time Slotted Channel Hopping (TSCH).
  * Combines TDMA (10 ms time slots) with frequency channel hopping across 16 channels to combat multipath fading and interference.
* **Topology:** Self-organizing and self-healing multi-hop mesh.

### 2. Bluetooth Classic vs Bluetooth Low Energy (BLE)
* **Bluetooth Classic (v1-v3):** High throughput, streaming audio, connection-oriented, higher energy consumption (79 channels, 1 MHz spacing).
* **BLE (Bluetooth Smart, v4.0+):**
  * Designed for duty-cycled periodic bursts from coin-cell battery sensors.
  * **Channels:** 40 channels (2 MHz spacing); 3 advertising channels (ch 37, 38, 39) avoid Wi-Fi channels 1, 6, 11; 37 data channels.
  * **Architecture:** Generic Access Profile (GAP) for discovery; Generic Attribute Profile (GATT) with Services and Characteristics.

### 3. Z-Wave & Home Automation
* **Proprietary/Alliance Standard:** Designed specifically for smart home device control.
* **Sub-GHz Radio:** Runs around 868 MHz / 908 MHz (avoids crowded 2.4 GHz Wi-Fi spectrum entirely).
* **Network Limit:** Up to 232 nodes per network mesh; source-routed multi-hop.

### 4. Wireless Sensor Networks (WSN) Architecture
* **Sensor Node Anatomy:** Sensing unit, Processing unit (microcontroller), Transceiver (radio), Power unit (battery/energy harvester).
* **Node Types:** Source (sensor), Sink/Base Station (aggregates and uplinks to internet), Relay node.
* **Key Design Constraints:** Extremely limited energy, constrained memory, dynamic topology due to node failures and battery depletion.

---

## Exam & Assignment Takeaways

| Protocol | Spectrum | Primary Distinguishing Characteristic |
| :--- | :--- | :--- |
| **WirelessHART** | 2.4 GHz | TSCH (TDMA + Channel Hopping) for industrial reliability |
| **BLE** | 2.4 GHz | 40 channels (3 Advertising, 37 Data), GATT profiles |
| **Z-Wave** | Sub-GHz (~900 MHz) | Avoids Wi-Fi interference, up to 232 nodes in home mesh |
| **WSN Sink Node** | Varies | Aggregates data from multi-hop sensor nodes to user/cloud |
