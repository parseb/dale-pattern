# 🧱 Configurator Pavaie & Fișă Tehnică / Paver Configurator & Technical Sheet

> **🌐 Live Demo App**: [https://parseb.github.io/dale-pattern/](https://parseb.github.io/dale-pattern/)

---

## 🇷🇴 Română

Aplicație web interactivă pentru configurarea, vizualizarea și optimizarea montajului de pavaie (model **Brăduț / Herringbone 90° & 45°**). Sistemul calculează automat debitările necesare, optimizează pierderile de material (Zero Waste reuse) și generează o **Fișă Tehnică de Execuție** profesională, pregătită pentru tipărire pe 1 pagină A4.

### ✨ Caracteristici Principale
- **📐 Vizualizare Interactivă 2D & 3D**:
  - Renderizare în timp real 2D Canvas cu cote exacte ale suprafeței.
  - Perspectivă 3D Isometrică cu texturi de lemn/beton și efect de adâncime.
  - Plan General de Montaj Orizontal la scară completă.
- **✂️ Algoritm de Optimizare Tăieturi (Zero Waste)**:
  - Identificare automată a pieselor marginale modularizate (Dale întregi 60×20 cm, Bucăți 2/3 de 40×20 cm și Bucăți 1/3 de 20×20 cm).
  - Grupare inteligentă a tăieturilor: 1 singură debitare pe o dală părinte rezultă în 2 bucăți folosite integral pe margini.
- **📄 Export Fișă Tehnică (PDF / A4 Print)**:
  - Generare document tehnic pentru șantier pe exact 1 pagină A4.
  - Descompunere bucăți, instrucțiuni pas-cu-pas de debitare și necesar de materiale (BOM: număr dale, paleți, greutate în tone și cost estimat).
  - Design economic pentru cerneală (Ink-Efficient) cu contrast ridicat.

### 🛠️ Tehnologii Utilizate
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS** (Custom Print Styles & Glassmorphism UI)
- **HTML5 Canvas API** (Procedural 2D/3D Rendering Engine)
- **Lucide React** (Iconografie modernă)

---

## 🇬🇧 English

An interactive web application designed for paver layout configuration, visualization, and cut optimization (using **Herringbone / Brăduț 90° & 45°** patterns). The system automatically computes required edge cuts, optimizes material waste via piece reuse, and exports a single-page A4 **Technical Execution Sheet (PDF)**.

### ✨ Key Features
- **📐 Interactive 2D & 3D Viewers**:
  - Real-time 2D Canvas surface rendering with dynamic dimension guides.
  - 3D Isometric view featuring realistic depth, lighting, and textures.
  - Full-width horizontal site layout plan.
- **✂️ Cut Optimization Engine (Zero Waste)**:
  - Automated modular piece categorization (Full 60×20 cm tiles, 2/3 pieces 40×20 cm, and 1/3 pieces 20×20 cm).
  - Smart pair matching: 1 single cut on a parent tile produces 2 boundary-fit pieces with zero waste.
- **📄 Technical Sheet Export (1-Page A4 PDF)**:
  - Site-ready technical document formatted strictly for 1-Page A4 printing.
  - Includes modular piece counts, step-by-step cutting guide, and Bill of Materials (BOM: total pavers, pallet count, tonnage, and estimated cost).
  - High-contrast, ink-saving print layout.

### 🛠️ Tech Stack
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS**
- **HTML5 Canvas API**
- **Lucide React**

---

## 🚀 Rulare Locală / Local Setup

```bash
# 1. Clonează repozitoriul / Clone repository
git clone https://github.com/parseb/dale-pattern.git
cd dale-pattern

# 2. Instalează dependențele / Install dependencies
npm install

# 3. Pornește serverul de dezvoltare / Start dev server
npm run dev

# 4. Construiește bundle-ul de producție / Build production bundle
npm run build
```

---

## 🌐 Publicare / Deployment (GitHub Pages)

Proiectul folosește **GitHub Actions** pentru deploy automatizat la fiecare `push` pe ramura `main`.
- **Workflow configuration**: `.github/workflows/deploy.yml`
- **Live URL**: [https://parseb.github.io/dale-pattern/](https://parseb.github.io/dale-pattern/)
