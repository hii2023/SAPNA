import React, { useMemo, useState } from 'react'
import { getProjects } from '../data/adminData'
import { projectCategories } from '../data/projects'
import './Projects.css'

function ProjectModal({ project, onClose }) {
  if (!project) return null

  return (
    <div className="projects-modal-overlay" onClick={onClose}>
      <div className="projects-modal" onClick={(e) => e.stopPropagation()}>
        <button className="projects-modal-close" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
        <div className="projects-modal-head">
          <span className="tag tag-terracotta">{project.category}</span>
          <h3>{project.title}</h3>
          <p>{project.method} · {project.year}</p>
        </div>
        <p className="projects-modal-desc">{project.description}</p>
        {project.materials && (
          <p className="projects-modal-materials"><strong>Materials/Method:</strong> {project.materials}</p>
        )}
        <div className="projects-modal-photos">
          {(project.photos || []).map((photo, index) => (
            <img key={`${project.id}-${index}`} src={photo} alt={`${project.title} ${index + 1}`} loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects] = useState(() => getProjects())
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  const filteredProjects = useMemo(
    () => activeCategory === 'all'
      ? projects
      : projects.filter(project => project.category === activeCategory),
    [projects, activeCategory]
  )

  return (
    <div className="projects-page">
      <div className="page-hero projects-hero">
        <div className="page-hero-content">
          <span className="section-label">Concept to Model</span>
          <h1>Projects</h1>
          <p>Diorama · Model Making · Educational Displays · Mixed Media Builds</p>
        </div>
      </div>

      <section className="section projects-section">
        <div className="container-wide">
          <div className="projects-filter-row">
            {projectCategories.map(category => (
              <button
                key={category.id}
                className={`filter-chip ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
            <span className="projects-count">{filteredProjects.length} projects</span>
          </div>

          <div className="projects-grid">
            {filteredProjects.map(project => (
              <article key={project.id} className="projects-card">
                <div className="projects-card-image-wrap">
                  <img src={project.photos?.[0]} alt={project.title} loading="lazy" />
                  {project.featured && <span className="projects-featured-badge">Featured</span>}
                </div>
                <div className="projects-card-body">
                  <div className="projects-card-meta">
                    <span className="tag tag-terracotta">{project.category}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p className="projects-method">{project.method}</p>
                  <p>{project.description}</p>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedProject(project)}>
                    View Project
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  )
}
