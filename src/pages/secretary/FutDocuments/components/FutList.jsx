import React, { useState } from "react"
import { 
  FileText, Plus, List, Inbox, Info, Hash, User, Tag, Folder, Phone, AlertTriangle, Flag, Calendar, Settings, 
  Download, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, CheckSquare, HelpCircle, Award, ArrowRightCircle, 
  MoreHorizontal, File, MessageCircle, Edit3, AlertCircle, X, RefreshCw
} from "feather-icons-react"
import Header from "../../../../components/Header"
import Sidebar from "../../../../components/Sidebar"
import { useFutRequests } from "../hooks/useFutRequests"
import { getStatusConfig, getUrgencyConfig, getRequestTypeConfig, 
         formatDate, getStudentNameById } from "../utils/futHelpers"
import { generateModernFutPDF } from "../utils/futHelpers.modern"
import { validateFutRequest, generateRequestNumber } from "../../../../types/fut/fut-request.model"
import SearchFilters from "./ui/SearchFilters.jsx"
import FutForm from "./forms/FutForm"
import DetailModal from "./modals/DetailModal.jsx"
import DeleteModal from "./modals/DeleteModal.jsx"
import { showSuccess, showError } from "../../../../utils/alertUtils"

const FutList = () => {
  const {
    futRequests,
    students,
    originInstitution,
    loading,
    studentsLoading,
    institutionLoading,
    error,
    loadFutRequests,
    searchFutRequests,
    createFutRequest,
    updateFutRequest,
    deleteFutRequest
  } = useFutRequests()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedFutRequest, setSelectedFutRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [formData, setFormData] = useState({
    studentEnrollmentId: "",
    requestNumber: "",
    requestType: "",
    requestSubject: "",
    requestDescription: "",
    requestedBy: "",
    contactPhone: "",
    contactEmail: "",
    guardianDni: "",
    guardianAddress: "",
    guardianDistrict: "",
    guardianProvince: "",
    urgencyLevel: "BAJA",
    estimatedDeliveryDate: "",
    attachedDocuments: {},
    adminNotes: "",
    status: "PENDIENTE",
  })

  /**
   * Maneja los cambios en el formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Maneja la selección de estudiante
   */
  const handleStudentSelect = (e) => {
    const studentId = e.target.value
    const student = students.find((s) => s.id === studentId)

    if (student) {
      // Generate request number based on DNI and names
      const dni = student.documentNumber || ''
      const firstName = student.firstName || ''
      const lastName = student.lastName || ''
      
      // Extract first 4 digits of DNI
      const dniPart = dni.substring(0, 4)
      
      // Extract first letter of first name and last name
      const firstLetter = firstName.charAt(0).toUpperCase()
      const lastLetter = lastName.charAt(0).toUpperCase()
      
      // Generate request number: 4 digits from DNI + 2 letters from names
      const requestNumber = `${dniPart}${firstLetter}${lastLetter}`
      
      setSelectedStudent(student)
      setFormData((prev) => ({
        ...prev,
        studentEnrollmentId: studentId,
        requestNumber: requestNumber,
        requestedBy: prev.requestedBy || `${student.firstName} ${student.lastName}`,
        contactPhone: prev.contactPhone || student.phone || student.guardianPhone,
        contactEmail: prev.contactEmail || student.email || student.guardianEmail,
      }))
    } else {
      setSelectedStudent(null)
      setFormData((prev) => ({
        ...prev,
        studentEnrollmentId: "",
        requestNumber: "",
      }))
    }
  }

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = () => {
    setFormData({
      studentEnrollmentId: "",
      requestType: "",
      requestSubject: "",
      requestDescription: "",
      requestedBy: "",
      contactPhone: "",
      contactEmail: "",
      urgencyLevel: "BAJA",
      estimatedDeliveryDate: "",
      attachedDocuments: {},
      adminNotes: "",
      status: "PENDIENTE",
    })
    setSelectedStudent(null)
  }

  /**
   * Maneja el envío del formulario de creación
   */
  const handleCreateSubmit = async (e) => {
    e.preventDefault()

    try {
      setCreateLoading(true)

      const response = await createFutRequest(formData, validateFutRequest, generateRequestNumber)

      if (response.success) {
        resetForm()
        setShowCreateModal(false)
        await loadFutRequests()

        showSuccess("Solicitud FUT creada exitosamente")
      } else {
        showError(response.error || "Error al crear la solicitud FUT")
      }
    } catch (err) {
      console.error("Error creating FUT:", err)
      showError("Error inesperado al crear la solicitud")
    } finally {
      setCreateLoading(false)
    }
  }

  /**
   * Maneja el envío del formulario de edición
   */
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFutRequest?.id) {
      showError("Error: No se ha seleccionado ninguna solicitud para editar")
      return
    }

    try {
      setUpdateLoading(true)

      const response = await updateFutRequest(selectedFutRequest.id, formData)

      if (response.success) {
        setShowEditModal(false)
        setSelectedFutRequest(null)
        resetForm()
        await loadFutRequests()

        showSuccess("Solicitud FUT actualizada exitosamente")
      } else {
        showError(response.error || "Error al actualizar la solicitud FUT")
      }
    } catch (err) {
      console.error("Error updating FUT:", err)
      showError("Error inesperado al actualizar la solicitud")
    } finally {
      setUpdateLoading(false)
    }
  }

  /**
   * Maneja el clic en el botón editar
   */
  const handleEdit = (futRequest) => {
    setSelectedFutRequest(futRequest)

    const student = students.find((s) => s.id === futRequest.studentEnrollmentId)
    setSelectedStudent(student)

    setFormData({
      studentEnrollmentId: futRequest.studentEnrollmentId || "",
      requestNumber: futRequest.requestNumber || "", // Keep existing request number for edit
      requestType: futRequest.requestType || "",
      requestSubject: futRequest.requestSubject || "",
      requestDescription: futRequest.requestDescription || "",
      requestedBy: futRequest.requestedBy || "",
      contactPhone: futRequest.contactPhone || "",
      contactEmail: futRequest.contactEmail || "",
      guardianDni: futRequest.guardianDni || "",
      guardianAddress: futRequest.guardianAddress || "",
      guardianDistrict: futRequest.guardianDistrict || "",
      guardianProvince: futRequest.guardianProvince || "",
      urgencyLevel: futRequest.urgencyLevel || "BAJA",
      estimatedDeliveryDate: futRequest.estimatedDeliveryDate ? futRequest.estimatedDeliveryDate.split("T")[0] : "",
      attachedDocuments: futRequest.attachedDocuments || {},
      adminNotes: futRequest.adminNotes || "",
      status: futRequest.status || "PENDIENTE",
    })

    setShowEditModal(true)
  }

  /**
   * Maneja el clic en ver detalles
   */
  const handleViewDetails = (futRequest) => {
    setSelectedFutRequest(futRequest)
    setShowDetailModal(true)
  }

  /**
   * Maneja el clic en el botón eliminar
   */
  const handleDelete = (futRequest) => {
    setSelectedFutRequest(futRequest)
    setShowDeleteModal(true)
  }

  /**
   * Confirma la eliminación de la solicitud
   */
  const confirmDelete = async () => {
    if (!selectedFutRequest?.id) {
      showError("Error: No se ha seleccionado ninguna solicitud para eliminar")
      return
    }

    try {
      setDeleteLoading(true)

      const response = await deleteFutRequest(selectedFutRequest.id)

      if (response.success) {
        setShowDeleteModal(false)
        setSelectedFutRequest(null)
        await loadFutRequests()

        showSuccess("Solicitud FUT eliminada exitosamente")
      } else {
        showError(response.error || "Error al eliminar la solicitud FUT")
      }
    } catch (err) {
      console.error("Error deleting FUT:", err)
      showError("Error inesperado al eliminar la solicitud")
    } finally {
      setDeleteLoading(false)
    }
  }

  /**
   * Maneja la búsqueda de solicitudes
   */
  const handleSearch = async () => {
    const response = await searchFutRequests(searchTerm)
    
    if (response.success) {
      // The search updates the state in the hook
    } else {
      showError(response.error || "Error al realizar la búsqueda")
    }
  }

  /**
   * Limpia la búsqueda y recarga todas las solicitudes
   */
  const clearSearch = () => {
    setSearchTerm("")
    setStatusFilter("")
    setUrgencyFilter("")
    loadFutRequests()
  }

  /**
   * Maneja la carga de archivos
   */
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachedDocuments = { ...formData.attachedDocuments }

    files.forEach((file) => {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      newAttachedDocuments[fileId] = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file,
      }
    })

    setFormData((prev) => ({
      ...prev,
      attachedDocuments: newAttachedDocuments,
    }))
  }

  /**
   * Elimina un archivo adjunto
   */
  const removeAttachedDocument = (fileId) => {
    const newAttachedDocuments = { ...formData.attachedDocuments }
    delete newAttachedDocuments[fileId]

    setFormData((prev) => ({
      ...prev,
      attachedDocuments: newAttachedDocuments,
    }))
  }

  /**
   * Filtra las solicitudes por estado y urgencia
   */
  const getFilteredRequests = () => {
    let filtered = [...futRequests]

    // Filtrar por número de solicitud
    if (searchTerm) {
      filtered = filtered.filter((req) => 
        req.requestNumber && req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((req) => req.status === statusFilter)
    }

    if (urgencyFilter) {
      filtered = filtered.filter((req) => req.urgencyLevel === urgencyFilter)
    }

    return filtered
  }

  const getPaginatedRequests = () => {
    const filtered = getFilteredRequests()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const filtered = getFilteredRequests()
    return Math.ceil(filtered.length / itemsPerPage)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const filteredRequests = getFilteredRequests()
  const paginatedRequests = getPaginatedRequests()
  const totalPages = getTotalPages()

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar id="menu-item-fut" id1="menu-items-fut" activeClassName="fut-list" />

      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>
                <FileText size={24} className="me-2 text-primary" />
                Gestión de Solicitudes FUT
              </h4>
              <h6>Administrar todas las solicitudes del Formato Único de Trámites</h6>
            </div>
            <div className="page-btn">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  resetForm()
                  setShowCreateModal(true)
                }}
              >
                <Plus size={20} className="me-2" />
                Nueva Solicitud FUT
              </button>
            </div>
          </div>

          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            urgencyFilter={urgencyFilter}
            setUrgencyFilter={setUrgencyFilter}
            onSearch={handleSearch}
            onClear={clearSearch}
            onRefresh={loadFutRequests}
            loading={loading}
          />

          {showCreateModal && (
            <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-xl">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <Plus size={20} className="me-2" />
                      Crear Nueva Solicitud FUT
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => {
                        setShowCreateModal(false)
                        resetForm()
                      }}
                    ></button>
                  </div>
                  <FutForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleStudentSelect={handleStudentSelect}
                    students={students}
                    studentsLoading={studentsLoading}
                    selectedStudent={selectedStudent}
                    originInstitution={originInstitution}
                    institutionLoading={institutionLoading}
                    handleFileUpload={handleFileUpload}
                    removeAttachedDocument={removeAttachedDocument}
                    formatFileSize={(bytes) => {
                      if (bytes === 0) return "0 Bytes"
                      const k = 1024
                      const sizes = ["Bytes", "KB", "MB", "GB"]
                      const i = Math.floor(Math.log(bytes) / Math.log(k))
                      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
                    }}
                    handleSubmit={handleCreateSubmit}
                    isEdit={false}
                    loading={createLoading}
                    onCancel={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {showEditModal && selectedFutRequest && (
            <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-xl">
                <div className="modal-content">
                  <div className="modal-header bg-info text-white">
                    <h5 className="modal-title">
                      <Edit size={20} className="me-2" />
                      Editar Solicitud FUT #{selectedFutRequest.requestNumber}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedFutRequest(null)
                        resetForm()
                      }}
                    ></button>
                  </div>
                  <FutForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleStudentSelect={handleStudentSelect}
                    students={students}
                    studentsLoading={studentsLoading}
                    selectedStudent={selectedStudent}
                    originInstitution={originInstitution}
                    institutionLoading={institutionLoading}
                    handleFileUpload={handleFileUpload}
                    removeAttachedDocument={removeAttachedDocument}
                    formatFileSize={(bytes) => {
                      if (bytes === 0) return "0 Bytes"
                      const k = 1024
                      const sizes = ["Bytes", "KB", "MB", "GB"]
                      const i = Math.floor(Math.log(bytes) / Math.log(k))
                      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
                    }}
                    handleSubmit={handleUpdateSubmit}
                    isEdit={true}
                    loading={updateLoading}
                    onCancel={() => {
                      setShowEditModal(false)
                      setSelectedFutRequest(null)
                      resetForm()
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {showDetailModal && selectedFutRequest && (
            <DetailModal
              selectedFutRequest={selectedFutRequest}
              students={students}
              getStatusConfig={getStatusConfig}
              getUrgencyConfig={getUrgencyConfig}
              getRequestTypeConfig={getRequestTypeConfig}
              formatDate={formatDate}
              formatFileSize={(bytes) => {
                if (bytes === 0) return "0 Bytes"
                const k = 1024
                const sizes = ["Bytes", "KB", "MB", "GB"]
                const i = Math.floor(Math.log(bytes) / Math.log(k))
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
              }}
              onClose={() => {
                setShowDetailModal(false)
                setSelectedFutRequest(null)
              }}
              onEdit={handleEdit}
            />
          )}

          {showDeleteModal && selectedFutRequest && (
            <DeleteModal
              selectedFutRequest={selectedFutRequest}
              students={students}
              onClose={() => {
                setShowDeleteModal(false)
                setSelectedFutRequest(null)
              }}
              onConfirm={confirmDelete}
              loading={deleteLoading}
            />
          )}

          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <List size={20} className="me-2 text-primary" />
                  Lista de Solicitudes FUT
                </h5>
                <div className="text-muted">
                  <small>
                    Mostrando {paginatedRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredRequests.length)} de {filteredRequests.length}{" "}
                    solicitudes
                    {futRequests.length !== filteredRequests.length && <span> (de {futRequests.length} total)</span>}
                  </small>
                </div>
              </div>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <div className="d-flex align-items-center">
                    <AlertCircle size={20} className="me-2" />
                    <div>
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-center p-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <h5 className="text-muted">Cargando solicitudes FUT...</h5>
                  <p className="text-muted">Por favor espere un momento</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  {filteredRequests.length === 0 ? (
                    <div className="text-center p-5">
                      <div className="mb-4">
                        <Inbox size={64} style={{ color: "#e0e0e0" }} />
                      </div>
                      <h5 className="text-muted mb-3">
                        {searchTerm || statusFilter || urgencyFilter
                          ? "No se encontraron resultados"
                          : "No hay solicitudes FUT registradas"}
                      </h5>
                      <p className="text-muted mb-4">
                        {searchTerm || statusFilter || urgencyFilter
                          ? "Intenta ajustar los filtros de búsqueda para encontrar lo que buscas"
                          : "Comience creando una nueva solicitud FUT para empezar a gestionar los trámites"}
                      </p>
                      <div className="d-flex justify-content-center gap-2">
                        {(searchTerm || statusFilter || urgencyFilter) && (
                          <button className="btn btn-outline-primary" onClick={clearSearch}>
                            <X size={16} className="me-2" />
                            Limpiar Filtros
                          </button>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            resetForm()
                            setShowCreateModal(true)
                          }}
                        >
                          <Plus size={16} className="me-2" />
                          Crear Primera Solicitud
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <label className="form-label me-2 mb-0">Mostrar:</label>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: "auto" }}
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number.parseInt(e.target.value))}
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span className="text-muted ms-2">por página</span>
                        </div>
                        <div className="text-muted">
                          <small>
                            Página {currentPage} de {totalPages}
                          </small>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-dark">
                            <tr>
                              <th>
                                <Hash size={16} className="me-1" />
                                Nº Solicitud
                              </th>
                              <th>
                                <User size={16} className="me-1" />
                                Estudiante
                              </th>
                              <th>
                                <Tag size={16} className="me-1" />
                                Asunto
                              </th>
                              <th>
                                <Folder size={16} className="me-1" />
                                Tipo
                              </th>
                              <th>
                                <Phone size={16} className="me-1" />
                                Solicitante
                              </th>
                              <th>
                                <File size={16} className="me-1" />
                                Documentos
                              </th>
                              <th>
                                <AlertTriangle size={16} className="me-1" />
                                Urgencia
                              </th>
                              <th>
                                <Flag size={16} className="me-1" />
                                Estado
                              </th>
                              <th>
                                <Calendar size={16} className="me-1" />
                                Fecha
                              </th>
                              <th>
                                <Settings size={16} className="me-1" />
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedRequests.map((futRequest) => {
                              const statusConfig = getStatusConfig(futRequest.status)
                              const urgencyConfig = getUrgencyConfig(futRequest.urgencyLevel)
                              const typeConfig = getRequestTypeConfig(futRequest.requestType)

                              const StatusIconComponent = {
                                Clock: Clock,
                                CheckCircle: CheckCircle,
                                XCircle: XCircle,
                                CheckSquare: CheckSquare,
                                HelpCircle: HelpCircle
                              }[statusConfig.icon] || HelpCircle

                              const UrgencyIconComponent = {
                                AlertTriangle: AlertTriangle,
                                AlertCircle: AlertCircle,
                                CheckCircle: CheckCircle,
                                HelpCircle: HelpCircle
                              }[urgencyConfig.icon] || HelpCircle

                              const TypeIconComponent = {
                                Award: Award,
                                FileText: FileText,
                                ArrowRightCircle: ArrowRightCircle,
                                Edit3: Edit3,
                                MoreHorizontal: MoreHorizontal,
                                File: File
                              }[typeConfig.icon] || File

                              const requestStudent = students.find((s) => s.id === futRequest.studentEnrollmentId)

                              return (
                                <tr key={futRequest.id} className="align-middle">
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <FileText size={16} className="me-2 text-primary" />
                                      <span className="fw-bold text-primary">{futRequest.requestNumber}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <User size={16} className="me-1 text-muted" />
                                      <div>
                                        <div className="fw-medium">
                                          {requestStudent
                                            ? `${requestStudent.firstName} ${requestStudent.lastName}`
                                            : getStudentNameById(futRequest.studentEnrollmentId, students)}
                                        </div>
                                        {requestStudent && (
                                          <small className="text-muted">
                                            {requestStudent.documentType}: {requestStudent.documentNumber}
                                          </small>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div
                                      className="text-truncate"
                                      style={{ maxWidth: "200px" }}
                                      title={futRequest.requestSubject}
                                    >
                                      <MessageCircle size={16} className="me-1 text-muted" />
                                      {futRequest.requestSubject}
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`badge bg-light text-dark border ${typeConfig.color}`}>
                                      <TypeIconComponent size={16} className="me-1" />
                                      {futRequest.requestType}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <User size={16} className="me-1 text-muted" />
                                      <div>
                                        <div className="fw-medium">{futRequest.requestedBy}</div>
                                        <small className="text-muted">
                                          <Phone size={14} className="me-1" />
                                          {futRequest.contactPhone}
                                        </small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {futRequest.attachedDocuments &&
                                      Object.keys(futRequest.attachedDocuments).length > 0 ? (
                                        <div className="d-flex align-items-center">
                                          <File size={16} className="me-1 text-success" />
                                          <span className="badge bg-success">
                                            {Object.keys(futRequest.attachedDocuments).length}
                                          </span>
                                          <small className="text-muted ms-1">archivos</small>
                                        </div>
                                      ) : (
                                        <div className="d-flex align-items-center text-muted">
                                          <File size={16} className="me-1" />
                                          <small>Sin archivos</small>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`badge ${urgencyConfig.class}`}>
                                      <UrgencyIconComponent size={16} className="me-1" />
                                      {urgencyConfig.text}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge ${statusConfig.class}`}>
                                      <StatusIconComponent size={16} className="me-1" />
                                      {statusConfig.text}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="text-muted small">
                                      <div>
                                        <Calendar size={14} className="me-1" />
                                        {formatDate(futRequest.createdAt)}
                                      </div>
                                      {futRequest.estimatedDeliveryDate && (
                                        <div className="text-success">
                                          <Clock size={14} className="me-1" />
                                          Est: {formatDate(futRequest.estimatedDeliveryDate)}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="btn-group" role="group">
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => {
                                          try {
                                            generateModernFutPDF(futRequest, students, originInstitution);
                                          } catch (error) {
                                            console.error("Error generating PDF:", error);
                                            showError("Error al generar el PDF. Por favor, inténtelo de nuevo.");
                                          }
                                        }}
                                        title="Descargar PDF"
                                      >
                                        <Download size={16} />
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handleViewDetails(futRequest)}
                                        title="Ver detalles"
                                      >
                                        <Eye size={16} />
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleEdit(futRequest)}
                                        title="Editar"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(futRequest)}
                                        title="Eliminar"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <nav aria-label="Paginación de solicitudes FUT" className="mt-4">
                          <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                              >
                                Primera
                              </button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Anterior
                              </button>
                            </li>

                            {(() => {
                              const pages = []
                              const startPage = Math.max(1, currentPage - 2)
                              const endPage = Math.min(totalPages, currentPage + 2)

                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => handlePageChange(i)}>
                                      {i}
                                    </button>
                                  </li>,
                                )
                              }
                              return pages
                            })()}

                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Siguiente
                              </button>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                              >
                                Última
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </>
                  )}

                  {filteredRequests.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <div className="text-muted">
                        <Info size={16} className="me-1" />
                        Mostrando {paginatedRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
                        {Math.min(currentPage * itemsPerPage, filteredRequests.length)} de {filteredRequests.length}{" "}
                        solicitudes
                        {(searchTerm || statusFilter || urgencyFilter) && (
                          <span className="text-primary"> (filtradas)</span>
                        )}
                        {futRequests.length !== filteredRequests.length && (
                          <span className="text-muted"> de {futRequests.length} total</span>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={loadFutRequests} disabled={loading}>
                          <RefreshCw size={16} className="me-1" />
                          Actualizar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FutList