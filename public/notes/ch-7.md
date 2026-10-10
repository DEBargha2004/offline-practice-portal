# Chapter 7: Basics of IoT Networking — Part III: CoAP & XMPP

## Core Concept
While MQTT provides lightweight publish-subscribe messaging over TCP, other IoT environments demand RESTful web interactions or real-time structured XML messaging. This chapter covers two major complementary standards: CoAP (Constrained Application Protocol) and XMPP (Extensible Messaging and Presence Protocol).

---

## 1. Constrained Application Protocol (CoAP)
CoAP was developed by the IETF CoRE (Constrained RESTful Environments) working group to bring RESTful web architectures to low-power, constrained IoT devices.

### Architecture and Transport
* **Lightweight Web Transfer:** Acts as an HTTP equivalent for constrained nodes.
* **Underlying Transport:** Runs on top of **UDP** (User Datagram Protocol) rather than TCP to avoid connection handshake overhead and memory buffers.
* **Two Sub-Layers:**
  1. **Messaging Sub-Layer:** Handles packet reliability, retransmissions, and duplicate detection over UDP.
  2. **Request-Response Sub-Layer:** Manages REST methods and resource state representations.

### CoAP Message Types
* **Confirmable (CON):** Demands an explicit acknowledgement (ACK) from the receiver. If lost, the sender retransmits using exponential backoff.
* **Non-Confirmable (NON):** Sent without requiring an ACK. Used for high-frequency sensor readings where an occasional lost packet is acceptable.
* **Piggybacked Response:** When a server can answer immediately, the response payload is bundled directly inside the ACK packet. This saves bandwidth by eliminating a separate message.
* **Separate Response:** Used when the server needs time to compute or measure data. The server sends an immediate empty ACK to stop retransmissions, then delivers the response in a separate CON message later.
* **Reset (RST):** Sent when a receiver cannot process or understand an incoming message.

### REST Methods Supported
* **GET:** Retrieves a resource representation.
* **POST:** Creates a new resource or processes data.
* **PUT:** Updates or replaces a resource.
* **DELETE:** Removes an existing resource.

---

## 2. Extensible Messaging and Presence Protocol (XMPP)
XMPP is an open-standard communication protocol based on XML, designed for near real-time structured data exchange and presence tracking.

### Core Architecture and Features
* **Decentralized Network:** Functions like email; there is no single central server. Anyone can run an independent XMPP server, and servers federate securely.
* **Firewall Traversal:** Operates natively over standard web ports, allowing messages to cross enterprise firewalls that normally block proprietary sensor traffic.
* **Presence Information:** Allows nodes to advertise their live status (online, busy, offline, sleep mode) across the network.
* **Underlying Transport:** Runs over persistent TCP streams.

### Key XMPP Technologies
* **PubSub:** An extension enabling publish-subscribe event notifications and data feeds across connected servers.
* **BOSH (Bidirectional-streams Over Synchronous HTTP):** Emulates persistent bidirectional streams over standard synchronous HTTP, enabling browser-based clients and restrictive networks to use XMPP.
* **Jingle:** An extension protocol for multimedia signaling, used for initiating voice, video, and file transfer sessions.

---

## Comparison: CoAP vs. MQTT vs. XMPP
| Feature | CoAP | MQTT | XMPP |
| :--- | :--- | :--- | :--- |
| **Model** | REST (Request-Response) | Publish-Subscribe | Client-Server / Federated |
| **Transport** | UDP | TCP | TCP |
| **Data Format** | Binary header, arbitrary payload | Binary header, arbitrary payload | XML streams |
| **Primary Strength** | Web API compatibility on constrained nodes | Extremely lightweight telemetry push | Decentralized, presence tracking, firewall traversal |
| **Reliability** | Built-in CON / ACK over UDP | Built-in QoS levels over TCP | TCP delivery guarantees |

---

## Key Exam Takeaways
* **CoAP Transport:** Operates over UDP, eliminating TCP handshake overhead.
* **Piggybacked Response:** Combines the server's data payload directly inside the ACK packet.
* **XMPP Format:** Uses structured XML stanzas over federated, decentralized servers.
* **BOSH Purpose:** Transports XMPP traffic over HTTP when direct TCP connections are blocked.
* **Jingle Purpose:** Multimedia and audio/video session signaling extension in XMPP.
