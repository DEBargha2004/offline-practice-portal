# Chapter 6: Basics of IoT Networking — Part II: MQTT Protocol

## Core Concept
Message Queuing Telemetry Transport (MQTT) is an extremely lightweight, open, publish-subscribe messaging protocol. Designed originally by IBM in 1999 and standardized by OASIS and ISO, it runs over TCP/IP and is optimized for low-bandwidth, high-latency, or unreliable networks with battery-constrained devices.

---

## The Publish-Subscribe Pattern
Unlike traditional web communication that uses client-server request-response (like HTTP), MQTT relies on a publish-subscribe architecture:

* **Publishers:** Devices (such as sensors) that produce data and send it to a broker under a specific topic.
* **Subscribers:** Applications or devices that register interest in specific topics to receive incoming updates.
* **Message Broker:** The central hub that receives messages from publishers and routes them to all subscribers listening to that topic.
* **Decoupling Advantage:** Publishers and subscribers never connect directly and do not need to know each other's IP address or identity. They are decoupled in space, time, and synchronization.

---

## MQTT Topics and Filtering
Topics are forward-slash delimited hierarchical strings used to organize data streams (example: `building1/floor2/room204/temperature`).

### Wildcard Characters for Subscriptions
* **Single-Level Wildcard (`+`):** Matches exactly one hierarchy level.
  * Example: `building1/+/room204/temperature` matches `building1/floor1/room204/temperature` and `building1/floor2/room204/temperature`.
* **Multi-Level Wildcard (`#`):** Matches all subsequent hierarchy levels. Must always be placed at the very end of the subscription pattern.
  * Example: `building1/floor2/#` receives all messages published anywhere under `floor2`.

---

## MQTT Methods (Operations)
* **CONNECT:** Initiates and establishes a persistent TCP connection to the broker.
* **DISCONNECT:** Cleanly tears down the active connection.
* **SUBSCRIBE:** Registers a client's interest in one or more topic filters.
* **UNSUBSCRIBE:** Removes interest in previously subscribed topics.
* **PUBLISH:** Transmits an application message and payload under a specific topic name.

---

## Secure MQTT (SMQTT)
* An extension of MQTT that incorporates transport layer security (TLS/SSL) and payload encryption.
* Protects constrained devices against eavesdropping, unauthorized topic publishing, and message tampering over public internet networks.

---

## Comparison: MQTT vs. HTTP
| Feature | MQTT | HTTP |
| :--- | :--- | :--- |
| Communication Model | Publish-Subscribe (Event-driven push) | Request-Response (Client pull) |
| Architecture | Brokered (Central intermediary) | Direct Client-to-Server |
| Transport Protocol | TCP | TCP |
| Header Overhead | Extremely small (as low as 2 bytes) | Large text headers (hundreds of bytes) |
| Device Fit | Constrained IoT nodes, battery powered | High-resource endpoints, web browsers |
| Data Coupling | Fully decoupled senders and receivers | Closely coupled sender and receiver |

---

## Key Exam Takeaways
* **Architecture Style:** Publish-Subscribe mediated through a central Message Broker.
* **Underlying Transport:** Runs on top of standard TCP/IP.
* **Single-Level Wildcard:** Plus sign (`+`) matches one level.
* **Multi-Level Wildcard:** Hash symbol (`#`) matches all remaining levels and must be at the end.
* **Primary Advantage over HTTP:** Minimal packet header size and asynchronous event-driven push delivery.
