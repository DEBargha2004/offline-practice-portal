## Weekly Overview
Week 2 details fundamental communication models, protocol stacks, and short-to-medium-range wireless standards that enable constrained device connectivity.

* **Lectures Included:** Lecture 6 (IoT Networking II), Lecture 7 (IoT Networking III), Lecture 8 (IoT Networking IV), Lecture 9 (Connectivity Technologies I: IEEE 802.15.4), Lecture 10 (Connectivity Technologies II: 6LoWPAN & RFID).
* **Core Theme:** Network protocol architectures, IEEE 802.15.4 physical/MAC layers, 6LoWPAN header adaptation, and RFID tracking.

---

## High-Yield Concepts & Architecture

### 1. IoT Communication Models
* **Request-Response:** Client requests data from server; stateless, client-initiated (e.g., HTTP, CoAP GET).
* **Publish-Subscribe (Pub/Sub):** Decoupled architecture with publishers, subscribers, and a central broker (e.g., MQTT).
* **Push-Pull:** Queuing brokers buffer producer messages; consumers pull at their own rate (e.g., RabbitMQ).
* **Exclusive Pair:** Full-duplex persistent bidirectional connection (e.g., WebSockets).

### 2. IEEE 802.15.4 Standard
* **Purpose:** Low-Rate Wireless Personal Area Networks (LR-WPAN) designed for low power, low data rate, and long battery life.
* **PHY/MAC Layer Specifications:**
  * **Frequency Band:** 2.4 GHz ISM (worldwide), 868 MHz (Europe), 915 MHz (North America).
  * **Channels:** 16 channels in 2.4 GHz band (5 MHz spacing).
  * **Max Data Rate:** 250 kbps at 2.4 GHz.
  * **Max Frame Size:** 127 bytes PHY Protocol Data Unit (PPDU).
* **Device Classes:**
  * **FFD (Full Function Device):** Can act as PAN Coordinator or Coordinator; talks to all devices.
  * **RFD (Reduced Function Device):** Simple leaf sensor node; talks only to an FFD.

### 3. 6LoWPAN (IPv6 over Low-Power WPAN)
* **Problem:** Standard IPv6 requires minimum MTU of 1280 bytes; IEEE 802.15.4 max physical payload is only 127 bytes.
* **Solution (Adaptation Layer):** Sits between Data Link and Network layer to perform:
  * **Header Compression:** Compresses 40-byte IPv6 header down to 2-4 bytes (LOWPAN_IPHC).
  * **Fragmentation & Reassembly:** Splits packets exceeding 127 bytes into smaller link fragments.
  * **Mesh Routing:** Encapsulates link-layer forwarding addresses.

### 4. RFID (Radio-Frequency Identification)
* **Components:** RFID Tag (microchip + antenna) and RFID Reader/Interrogator.
* **Tag Categories:**
  * **Passive Tags:** No internal battery; powered by reader's electromagnetic RF field (backscatter coupling); short range, low cost.
  * **Active Tags:** On-board battery; powers transmitter for extended range (hundreds of meters); higher cost.
  * **Semi-Passive / BAP:** Battery powers chip circuitry only; uses backscatter for transmission.

---

## Exam & Assignment Takeaways

| Technology | Standard / Frequency | Core Specification / Trap |
| :--- | :--- | :--- |
| **IEEE 802.15.4** | 2.4 GHz / 868 MHz / 915 MHz | Max 250 kbps, 127-byte max frame, FFD vs RFD |
| **6LoWPAN Layer** | Between Link Layer & Network Layer | Solves 1280-byte IPv6 MTU vs 127-byte 802.15.4 frame |
| **Passive RFID** | LF, HF (13.56 MHz), UHF (860-960 MHz) | No internal battery, powered via reader RF signal |
| **Communication Mode** | Pub/Sub vs Request-Response | Pub/Sub completely decouples sender and receiver |
