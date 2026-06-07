export const profile = {
  name: "David Brimhall",
  tagline: "Software Engineer",
  greeting: "Hi, I'm",
  elevator:
    "Recently graduated software engineer from Arizona State University with hands-on experience in machine learning, full-stack development, and IT systems. I bridge the gap between research and production — from training AI models to managing enterprise infrastructure with Intune and Active Directory. I build tools that solve real problems.",
  about:
    "Newly graduated software engineer with a passion for building interactive web applications, geospatial tools, and developer tooling. I enjoy crafting polished user experiences and solving problems with clean, maintainable code.",
  email: "davidbrimhall71@gmail.com",
  social: {
    github: "https://github.com/Krills7",
    linkedin: "https://linkedin.com/in/davidbrimhall",
  },
  nav: [
    { label: "Home", path: "/" },
    { label: "Fiber Map", path: "/fiber-map" },
    { label: "Visual", path: "/visual" },
  ],
  projects: [
    {
      title: "Phoenix Fiber Build Map",
      description:
        "Waiting for fiber internet? View permits issued to telecom companies through the city of Phoenix to see if there's activity in your neighborhood. Interactive Leaflet-based map tracking 3,500+ active ROW construction permits for fiber optic buildout across Phoenix. Features a custom street-grid geocoder, real-time search, and status-based marker filtering.",
      tags: ["JavaScript", "Leaflet", "GIS", "Data Visualization"],
      image: null,
      link: "/fiber-map",
    },
    {
      title: "Portfolio Website",
      description:
        "Modern React + Vite portfolio with interactive canvas effects, tab-based navigation, and a particle visualization system. Built with a focus on performance and polish.",
      tags: ["React", "Vite", "Canvas", "CSS Modules"],
      image: null,
      link: "/",
    },
  ],
}
