# Computer Organization & Architecture (COA) Educational Platform & Portfolio

A modern, high-performance web platform combining an **interactive Computer Organization & Architecture (COA) learning suite** with a comprehensive showcase of engineering projects, hardware simulations, and academic coursework.

---

## 🚀 Key Features & Modules

### 1. 🧮 Interactive COA Number System Converter (`coa-tool.html`)
An educational visualizer and conversion engine designed to explore low-level radix positional number representations:
- **Multi-Base Radix Conversion**: Converts seamlessly between **Binary (Base-2)**, **Octal (Base-8)**, **Decimal (Base-10)**, and **Hexadecimal (Base-16)**.
- **Arbitrary Precision Support**: Powered by JavaScript `BigInt` for accurate calculations with arbitrarily large numbers without floating-point overflow.
- **Step-by-Step Derivations**:
  - *Radix $B \to$ Decimal*: Positional power expansions ($\sum d_i \cdot B^i$).
  - *Decimal $\to$ Radix $B$*: Successive integer division tables tracking quotients and remainders.
  - *Binary $\leftrightarrow$ Hexadecimal / Octal*: 4-bit nibble and 3-bit triplet grouping breakdowns.
- **Bit-Level Visualizer**: Interactive nibble stream displaying individual bit states (on/off) and corresponding power-of-2 weights ($2^0, 2^1, 2^2, \dots$).
- **Quick Presets & Base Swapping**: Instant standard examples and single-click base swap functionality.

### 2. 📁 Projects & Coursework Showcase (`projects.html`)
- **COA Address Simulator**: Hardware simulation tool modeling effective address calculations, memory mapping, offset lookups, and page table translations.
- **Academic Coursework & Solutions**: Direct access and preview for verified Computer Organization & Architecture assignments.
- **AI & Automation Systems**: Voice-controlled PC automation workflows and API integrations.
- **Hackathon Prototypes**: Competitive hackathon builds, system architectures, and rapid MVP implementations.
- **Interactive Category Filtering**: Real-time filtering by *COA & Architecture*, *Coursework & PDFs*, *AI & Automation*, and *Web & Practice*.

### 3. 🏆 Achievements & Gallery (`gallery.html`)
- Filterable credentials and honors gallery categorizing hackathon victories (e.g., Bharat Buildathon, Tekathon), professional industry certifications, and algorithmic problem-solving milestones.

### 4. 🧭 Academic Interests & Career Roadmap (`interests.html`)
- Detailed roadmap covering Data Structures & Algorithms, Artificial Intelligence & Machine Learning, Full-Stack Web Development, and Distributed Systems.

---

## 🛠️ Built With

- **Structure**: Semantic HTML5 with accessibility attributes (`aria-*`, landmark tags).
- **Styling**: Vanilla CSS3 design system:
  - Custom CSS variables for responsive theme tokens.
  - Light & Dark mode support with persistent local storage.
  - Glassmorphic card surfaces, gradient borders, and animated glows.
  - CSS Grid and Flexbox responsive layouts across all device sizes.
- **Logic**: Vanilla JavaScript (ES6+):
  - Canvas-based particle ray animations.
  - BigInt radix conversion algorithms and dynamic DOM rendering.
  - Category filtering and interactive accordion ladder components.
- **Icons**: [Remix Icon](https://remixicon.com/)

---

## 📂 Project Structure

```text
├── index.html              # Main portfolio landing page & overview
├── coa-tool.html           # Interactive COA Number System Converter
├── projects.html           # Projects & Coursework showcase hub
├── gallery.html            # Achievements, credentials & milestones
├── interests.html          # Academic roadmap & core technical areas
├── styles.css              # Global design system & theme stylesheets
├── main.js                 # Radix conversion logic, UI animations & theme controller
└── assets/                 # Graphics, avatars, and media assets
```

---

## ⚡ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aayush12-ai/PORTFOLIO-COA.git
   ```

2. **Run Locally**:
   - Open `index.html` or `coa-tool.html` directly in any modern web browser.
   - Alternatively, serve via a lightweight HTTP server (such as VS Code Live Server or Python):
     ```bash
     python -m http.server 8000
     ```
   - Navigate to `http://localhost:8000`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
