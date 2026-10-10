# Chapter 9: Connectivity Technologies — Part I: IEEE 802.15.4 & Zigbee

## Core Concept
Low-Power Wireless Personal Area Networks (WPAN) form the radio backbone of local IoT sensor environments. IEEE 802.15.4 establishes the Physical (PHY) and Media Access Control (MAC) layers, while Zigbee builds upon this standard to deliver network routing, security, and application-layer profiles.

---

## 1. IEEE 802.15.4 Standard
Designed specifically for low data rates, low energy consumption, and short transmission distances.

### Key Technical Specifications
* **Operating Frequency Bands:** Operates in the license-free ISM (Industrial, Scientific, and Medical) bands:
  * 2.4 GHz worldwide (up to 250 kbps, 16 channels).
  * 868 MHz in Europe (1 channel).
  * 915 MHz in North America (10 channels).
* **Modulation Scheme:** Direct Sequence Spread Spectrum (DSSS), providing high resistance to radio interference and noise.
* **Medium Access Control (MAC):** Uses Carrier Sense Multiple Access with Collision Avoidance (CSMA/CA).
* **Duty Cycle:** Operates with duty cycles typically below 1% (devices sleep more than 99% of the time to conserve battery).
* **Maximum Frame Size:** Strict limit of 127 bytes for physical layer protocol data units (PPDU).

### Device Classifications in 802.15.4
* **Full Function Device (FFD):** Can implement the complete protocol stack. Can serve as a PAN Coordinator, router, or standard node. Can communicate with any other device.
* **Reduced Function Device (RFD):** Lightweight node with minimal memory and power demands. Can only communicate with a single FFD parent; cannot route traffic for other devices.

### Operational Modes
* **Beacon-Enabled Mode:** PAN Coordinator periodically broadcasts beacons for clock synchronization, association, and power management. Channels use a Superframe structure.
* **Non-Beacon Mode:** Devices transmit whenever they need to using unslotted CSMA/CA without periodic master synchronization pulses.

---

## 2. Zigbee Protocol
Zigbee is built directly on top of the IEEE 802.15.4 PHY and MAC layers, adding the Network (NWK), Security, and Application (APL) layers.

### Zigbee Device Roles
* **Zigbee Coordinator (ZC):** Exactly one per network. Initializes the network, assigns 16-bit network addresses, stores master topology routing tables, and manages security keys (Trust Center).
* **Zigbee Router (ZR):** Fully powered FFD that runs applications and forwards data packets across multi-hop paths to extend network coverage.
* **Zigbee End Device (ZED):** An RFD battery-powered sensor. Communicates only through its parent (ZC or ZR) and enters deep sleep when idle.

### Zigbee Network Topologies
* **Star Topology:** All end devices communicate directly with a single central coordinator.
* **Tree Topology:** Hierarchy where the coordinator is the root, branching out to routers and leaf end devices.
* **Mesh Topology:** Routers interconnect redundantly. Provides dynamic multi-hop routing, self-healing links, and automatic rerouting if any intermediate router fails.

### Routing Protocol
* Utilizes a variant of **AODV** (Ad hoc On-Demand Distance Vector) routing at the network layer for dynamic route discovery in mesh configurations.

---

## Comparison: IEEE 802.15.4 vs. Zigbee
| Dimension | IEEE 802.15.4 | Zigbee |
| :--- | :--- | :--- |
| **Layers Defined** | Physical (PHY) and Data Link (MAC) only | Network (NWK), Security, and Application (APL) |
| **Standard Body** | IEEE | Zigbee Alliance (now CSA) |
| **Routing Capability** | None (single-hop links only) | Multi-hop mesh routing using AODV |
| **Security Layer** | Frame-level AES-128 encryption | End-to-end key distribution and Trust Center management |

---

## Key Exam Takeaways
* **IEEE 802.15.4 Scope:** Defines only the Physical and MAC layers.
* **Max 802.15.4 Frame Size:** 127 bytes.
* **FFD vs. RFD:** FFD can route and coordinate; RFD connects only to a parent node to save memory and power.
* **Zigbee Coordinator Role:** Unique root node responsible for network formation and key management.
* **Zigbee Mesh Routing:** Uses AODV for dynamic multi-hop path recovery.
