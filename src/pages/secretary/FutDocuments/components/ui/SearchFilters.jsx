import React from "react"
import PropTypes from "prop-types"
import { Search, Filter, X, RefreshCw, Hash } from "feather-icons-react"

const SearchFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  urgencyFilter, 
  setUrgencyFilter, 
  onSearch, 
  onClear, 
  onRefresh, 
  loading 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label">
              <Hash size={16} className="me-1" />
              Número de Solicitud
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número de solicitud..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="btn btn-outline-primary" onClick={onSearch} disabled={loading}>
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              <Filter size={16} className="me-1" />
              Estado
            </label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">⏳ Pendiente</option>
              <option value="APROBADO">✅ Aprobado</option>
              <option value="RECHAZADO">❌ Rechazado</option>
              <option value="COMPLETADO">✔️ Completado</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              <Filter size={16} className="me-1" />
              Urgencia
            </label>
            <select
              className="form-control"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option value="">Todas las urgencias</option>
              <option value="ALTA">🔴 Alta</option>
              <option value="MEDIA">🟡 Media</option>
              <option value="BAJA">🟢 Baja</option>
            </select>
          </div>

          <div className="col-md-1">
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={onClear}
                disabled={loading}
                title="Limpiar filtros"
              >
                <X size={16} />
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={onRefresh}
                disabled={loading}
                title="Actualizar lista"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchFilters

SearchFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  urgencyFilter: PropTypes.string.isRequired,
  setUrgencyFilter: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}