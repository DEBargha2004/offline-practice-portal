## Weekly Overview
Week 8 explores advanced Software-Defined IoT architectures followed by core Cloud Computing models, service virtualization, resource management, and enterprise case studies.

* **Lectures Included:** Lecture 36 (Software Defined IoT Networking II), Lecture 37 (Cloud Computing Fundamentals), Lecture 38 (Cloud Service Models), Lecture 39 (Cloud Management & Security), Lecture 40 (Cloud Case Studies).
* **Core Theme:** Scalable cloud infrastructure, SPI delivery models, virtualization, and IoT cloud platforms.

---

## High-Yield Concepts & Architecture

### 1. Cloud Computing Fundamentals (NIST Characteristics)
* **On-Demand Self-Service:** Automated provisioning without human service provider interaction.
* **Broad Network Access:** Standard access mechanisms across heterogeneous devices (phones, laptops, IoT gateways).
* **Resource Pooling:** Multi-tenant model pooling physical compute/storage dynamically.
* **Rapid Elasticity:** Seamless automated scaling up and down based on real-time load.
* **Measured Service:** Transparent pay-per-use metering.

### 2. Cloud Service Models (SPI Framework)
* **IaaS (Infrastructure as a Service):** Provides raw virtual machines, storage, and networks; user manages OS, runtime, and software (e.g., AWS EC2, GCP Compute Engine).
* **PaaS (Platform as a Service):** Provides execution runtimes, managed databases, and deployment pipelines; user manages application code only (e.g., Heroku, AWS Elastic Beanstalk).
* **SaaS (Software as a Service):** Complete consumer software hosted on the cloud (e.g., Google Workspace, Salesforce).

### 3. Cloud Deployment Models
* **Public Cloud:** Infrastructure open to general public/businesses on multi-tenant hardware.
* **Private Cloud:** Dedicated infrastructure exclusively operated for a single organization.
* **Hybrid Cloud:** Composition of two or more distinct clouds bound by standardized technology.
* **Community Cloud:** Shared by several organizations with shared concerns (compliance, mission).

### 4. Virtualization & Multi-Tenancy
* **Hypervisor (VMM):**
  * **Type 1 (Bare-Metal):** Runs directly on physical hardware (e.g., VMware ESXi, Xen, KVM).
  * **Type 2 (Hosted):** Runs on top of a host operating system (e.g., VirtualBox, VMware Workstation).
* **Containers (Docker):** OS-level virtualization sharing host kernel; lighter weight, faster boot than VMs.

---

## Exam & Assignment Takeaways

| Model | User Manages | Provider Manages |
| :--- | :--- | :--- |
| **IaaS** | OS, Runtime, Middleware, App, Data | Servers, Storage, Virtualization, Networking |
| **PaaS** | Application & Data | OS, Runtime, Middleware, Servers, Storage |
| **SaaS** | Configuration / Usage | Everything (App, Runtime, Servers, Storage) |
| **Hypervisor 1 vs 2** | Type 1 is bare-metal; Type 2 runs on host OS | Type 1 provides higher performance for production servers |
