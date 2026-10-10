# Chapter 2: Introduction to IoT — Part II

## Core Concept
As billions of smart objects connect to networks, system architecture must handle massive addressing shortages and coordinate communication across fragmented wireless protocols. This chapter focuses on how IoT scales network addresses and connects local constrained devices to the wider internet.

---

## The Address Crunch Problem
* **IPv4 Limitations:** Uses 32-bit addresses, providing roughly 4.3 billion unique identifiers. This is completely inadequate for tens of billions of IoT devices.
* **IPv6 Transition:** Uses 128-bit addresses, offering an enormous address space. However, constrained IoT nodes cannot always manage large IPv6 packet headers or complex routing tables without overhead.
* **The Conservation Strategy:** Rather than assigning a globally unique public IP to every single sensor, networks use a two-tier hierarchy:
  1. **Locally Unique Addresses (LUAs):** Device addresses that are unique only inside their local segment (such as an IoT LAN). The same address can be safely reused in different physical networks.
  2. **Network Prefixes:** A globally unique prefix assigned to the edge gateway. When communicating with the outside world, packets combine the network prefix with the LUA to route unambiguously.

---

## Network Architecture Entities

### 1. IoT LAN (Local Area Network)
* Connects constrained sensors and actuators within a local space (a room, building, or factory floor).
* Operates primarily over low-power personal area network technologies like Zigbee, BLE, or IEEE 802.15.4.

### 2. IoT WAN (Wide Area Network)
* Provides long-distance connectivity linking multiple distributed IoT LANs together across cities, campuses, or geographical branches.

### 3. IoT Gateway (Border Router)
* Sits between an IoT LAN and the internet or IoT WAN.
* Translates between local wireless standards (such as Zigbee or BLE) and standard TCP/IP.
* Manages traffic filtering, security policies, and maps external incoming traffic to internal devices.

### 4. IoT Proxy
* An intermediate service located on or near the gateway.
* Handles requests on behalf of low-power devices, caches data, and terminates heavy application-layer internet connections so battery-powered nodes are not overloaded.

### 5. Remote Anchor Point (RAP)
* A network control point that maintains a directory of device locations across the network.
* Supports roaming and device mobility, routing data through tunnels to the gateway where a mobile device is currently connected.

### 6. Multi-Homing
* Connecting an IoT device or gateway to multiple independent networks simultaneously (for example, having both Cellular and Wi-Fi active).
* Provides fault tolerance: if one connection drops, communication automatically fails over to the other with zero system downtime.

---

## Connectivity Standards Breakdown
* **Personal Area / Low-Power:**
  * **IEEE 802.15.4:** Base standard for low-rate wireless personal area networks (Zigbee, Thread).
  * **IEEE 802.15.1:** Bluetooth Classic and Bluetooth Low Energy (BLE).
  * **IEEE 802.15.6:** Wireless Body Area Networks (WBAN) dedicated to wearable and medical sensors.
  * **Specialized:** Insteon (home automation mesh), Dash7 (long-range RFID sensor technology).
* **Local Area:** IEEE 802.11 (Wi-Fi) — high bandwidth, higher battery consumption.
* **Metropolitan / Wide Area:** Cellular networks (2G, 3G, 4G, 5G, NB-IoT) and IEEE 802.16 (WiMAX).

---

## Key Exam Takeaways
* **Address Crunch Solution:** Pairing reusable Locally Unique Addresses (LUAs) on nodes with globally unique Network Prefixes on gateways.
* **IoT Gateway Function:** Bridging protocols between non-IP constrained networks and the TCP/IP internet.
* **IoT Proxy Function:** Application-level caching and request handling to protect low-power devices.
* **Multi-Homing Advantage:** Redundant network links for uninterrupted communication and high reliability.
* **Body Area Network Standard:** IEEE 802.15.6.
