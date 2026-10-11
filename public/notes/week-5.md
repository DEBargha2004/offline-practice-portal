## Weekly Overview
Week 5 focuses on interoperability architectures in heterogeneous IoT systems, alongside hands-on embedded development fundamentals with Arduino and transducer interfacing.

* **Lectures Included:** Lecture 21 (Interoperability in IoT), Lecture 22 (Introduction to Arduino I), Lecture 23 (Introduction to Arduino II), Lecture 24 (Sensor & Actuator Integration I), Lecture 25 (Sensor & Actuator Integration II).
* **Core Theme:** Semantic & technical interoperability, Arduino Uno architecture, GPIO interfacing, and ADC conversions.

---

## High-Yield Concepts & Architecture

### 1. Interoperability in IoT
* **Interoperability Levels:**
  * **Technical:** Hardware and transmission medium compatibility.
  * **Syntactical:** Message data formats and encoding protocols (JSON, XML, CBOR).
  * **Semantic:** Shared meaning and context of data models (Ontologies, RDF, OWL).
* **Cross-Platform Gateways:** Bridge proprietary protocols (e.g., Zigbee to CoAP/REST) and homogenize sensor payloads.

### 2. Arduino Uno Hardware Platform
* **Microcontroller:** ATmega328P (8-bit AVR architecture, 16 MHz clock).
* **Memory Architecture:**
  * **Flash Memory (32 KB):** Non-volatile program memory (0.5 KB reserved by bootloader).
  * **SRAM (2 KB):** Volatile runtime memory for variables.
  * **EEPROM (1 KB):** Non-volatile byte storage for persistent settings.
* **I/O Pins:**
  * 14 Digital I/O pins (pins 0-13); 6 support PWM output (~3, 5, 6, 9, 10, 11).
  * 6 Analog Input pins (A0-A5); connected to 10-bit internal Analog-to-Digital Converter (ADC).

### 3. Analog & Digital Signal Interfacing
* **Analog-to-Digital Conversion (ADC):**
  * 10-bit resolution yields values from 0 to 1023 (2^10 = 1024 quantization levels).
  * Default reference voltage: 5V (5V / 1024 approx 4.88 mV per step).
* **Pulse Width Modulation (PWM):** Simulates variable analog voltage output by adjusting duty cycle (0-255 via `analogWrite()`).
* **Pull-up / Pull-down Resistors:** Prevent floating input pin states when interfacing tactile switches.

---

## Exam & Assignment Takeaways

| Parameter | Arduino Uno Specification | Common Exam Pitfall |
| :--- | :--- | :--- |
| **ADC Resolution** | 10-bit (0-1023) | Confusing 10-bit input with 8-bit PWM (0-255) output |
| **Operating Voltage** | 5V (ATmega328P) | Applying 5V to 3.3V sensors without level shifting |
| **Flash vs SRAM** | 32 KB Flash vs 2 KB SRAM | Flash stores sketch; SRAM stores running variables |
| **PWM Frequency** | ~490 Hz (pins 5 & 6 ~980 Hz) | PWM is not true variable DC voltage, but rapid square wave |
