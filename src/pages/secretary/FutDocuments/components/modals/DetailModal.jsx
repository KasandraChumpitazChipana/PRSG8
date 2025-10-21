import React, { useState } from "react"
import PropTypes from "prop-types"
import { 
  Eye, User, FileText, MessageCircle, Tag, File, Phone, Mail, Calendar, Clock, MessageSquare, Edit3, 
  Info, X, Edit, AlertTriangle, Award, ArrowRightCircle, MoreHorizontal, CheckCircle, XCircle, CheckSquare, HelpCircle, AlertCircle,
  Download, Printer, Share2, School
} from "feather-icons-react"

const DetailModal = ({ 
  selectedFutRequest, 
  students, 
  getStatusConfig, 
  getUrgencyConfig, 
  getRequestTypeConfig, 
  formatDate, 
  formatFileSize, 
  onClose, 
  onEdit 
}) => {
  const [activeTab, setActiveTab] = useState("details")

  if (!selectedFutRequest) return null

  const statusConfig = getStatusConfig(selectedFutRequest.status)
  const urgencyConfig = getUrgencyConfig(selectedFutRequest.urgencyLevel)
  const typeConfig = getRequestTypeConfig(selectedFutRequest.requestType)

  const StatusIcon = statusConfig.icon
  const UrgencyIcon = urgencyConfig.icon
  const TypeIcon = typeConfig.icon

  const iconMap = {
    Clock: Clock,
    CheckCircle: CheckCircle,
    XCircle: XCircle,
    CheckSquare: CheckSquare,
    HelpCircle: HelpCircle,
    AlertTriangle: AlertTriangle,
    AlertCircle: AlertCircle,
    Award: Award,
    FileText: FileText,
    ArrowRightCircle: ArrowRightCircle,
    Edit3: Edit3,
    MoreHorizontal: MoreHorizontal,
    File: File
  }

  const StatusIconComponent = iconMap[StatusIcon] || HelpCircle
  const UrgencyIconComponent = iconMap[UrgencyIcon] || HelpCircle
  const TypeIconComponent = iconMap[TypeIcon] || File

  const requestStudent = students.find((s) => s.id === selectedFutRequest.studentEnrollmentId)

  const getStudentNameById = (studentId) => {
    const student = students.find((s) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : studentId
  }

  const handleDownload = (fileData) => {
    alert(`Descargando: ${fileData.name}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Solicitud FUT #${selectedFutRequest.requestNumber}`,
        text: selectedFutRequest.requestSubject,
        url: window.location.href
      })
    } else {
      alert("Compartir no está disponible en este navegador")
    }
  }

  const tabs = [
    { id: "details", label: "Detalles", icon: Info },
    { id: "documents", label: "Documentos", icon: File },
    { id: "notes", label: "Notas", icon: MessageSquare }
  ]

  // Add CSS animations
  const modalStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .modal-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    .slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    .tab-transition {
      transition: all 0.2s ease-in-out;
    }
  `

  return (
    <>
      <style>{modalStyles}</style>
      <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0 shadow-lg modal-fade-in">
            {/* Modal Header with Gradient */}
            <div className="modal-header bg-gradient-primary text-white p-4" style={{ 
              background: "linear-gradient(120deg, #2c7be5, #0056b3)",
              borderBottom: "none"
            }}>
              <div className="d-flex align-items-center w-100">
                <div className="d-flex align-items-center me-3">
                  <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                    <Eye size={24} />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h4 className="modal-title mb-1">Solicitud FUT #{selectedFutRequest.requestNumber}</h4>
                  <div className="d-flex flex-wrap gap-2">
                    <span className={`badge ${statusConfig.class} d-flex align-items-center`}>
                      <StatusIconComponent size={14} className="me-1" />
                      {statusConfig.text}
                    </span>
                    <span className={`badge ${urgencyConfig.class} d-flex align-items-center`}>
                      <UrgencyIconComponent size={14} className="me-1" />
                      Urgencia {urgencyConfig.text}
                    </span>
                    <span className={`badge bg-light text-dark d-flex align-items-center`}>
                      <TypeIconComponent size={14} className="me-1" />
                      {selectedFutRequest.requestType}
                    </span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-light btn-sm" 
                    onClick={handlePrint}
                    title="Imprimir"
                  >
                    <Printer size={16} />
                  </button>
                  <button 
                    className="btn btn-light btn-sm" 
                    onClick={handleShare}
                    title="Compartir"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={onClose}
                  ></button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-0">
              <div className="row g-0">
                {/* Left sidebar */}
                <div className="col-lg-4 col-xl-3 bg-light border-end">
                  <div className="p-4">
                    <div className="d-flex flex-column gap-4">
                      {/* Student Info Card */}
                      <div className="card border-0 shadow-sm slide-in">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                              <User size={20} className="text-primary" />
                            </div>
                            <h6 className="mb-0">Información del Estudiante</h6>
                          </div>
                          <div className="mt-3">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                <User size={20} className="text-muted" />
                              </div>
                              <div>
                                <div className="fw-bold">
                                  {requestStudent
                                    ? `${requestStudent.firstName} ${requestStudent.lastName}`
                                    : getStudentNameById(selectedFutRequest.studentEnrollmentId)}
                                </div>
                                <small className="text-muted">Estudiante</small>
                              </div>
                            </div>
                            {requestStudent && (
                              <div className="mt-3">
                                <div className="d-flex align-items-center mb-2">
                                  <Phone size={16} className="text-muted me-2" />
                                  <small className="text-muted">
                                    {requestStudent.phone || "No registrado"}
                                  </small>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                  <Mail size={16} className="text-muted me-2" />
                                  <small className="text-muted">
                                    {requestStudent.email || "No registrado"}
                                  </small>
                                </div>
                                <div className="d-flex align-items-center">
                                  <User size={16} className="text-muted me-2" />
                                  <small className="text-muted">
                                    {requestStudent.guardianName 
                                      ? `${requestStudent.guardianName} ${requestStudent.guardianLastName || ""}` 
                                      : "No registrado"}
                                  </small>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Origin Institution Card */}
                      <div className="card border-0 shadow-sm slide-in">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <School size={20} className="text-success" />
                            </div>
                            <h6 className="mb-0">Colegio de Procedencia</h6>
                          </div>
                          <div className="mt-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                <School size={20} className="text-muted" />
                              </div>
                              <div>
                                <div className="fw-bold">Institución Educativa</div>
                                <small className="text-muted">Origen del estudiante</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info Card */}
                      <div className="card border-0 shadow-sm slide-in">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                              <Phone size={20} className="text-info" />
                            </div>
                            <h6 className="mb-0">Información de Contacto</h6>
                          </div>
                          <div className="mt-3">
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Solicitante</small>
                              <div className="d-flex align-items-center">
                                <User size={16} className="text-muted me-2" />
                                <span>{selectedFutRequest.requestedBy}</span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Teléfono</small>
                              <div className="d-flex align-items-center">
                                <Phone size={16} className="text-muted me-2" />
                                <a href={`tel:${selectedFutRequest.contactPhone}`} className="text-decoration-none">
                                  {selectedFutRequest.contactPhone}
                                </a>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Email</small>
                              <div className="d-flex align-items-center">
                                <Mail size={16} className="text-muted me-2" />
                                <a href={`mailto:${selectedFutRequest.contactEmail}`} className="text-decoration-none">
                                  {selectedFutRequest.contactEmail}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Info */}
                      <div className="card border-0 shadow-sm slide-in">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <Clock size={20} className="text-success" />
                            </div>
                            <h6 className="mb-0">Fechas Importantes</h6>
                          </div>
                          <div className="mt-3">
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Fecha de Creación</small>
                              <div className="d-flex align-items-center">
                                <Calendar size={16} className="text-muted me-2" />
                                <span>{formatDate(selectedFutRequest.createdAt)}</span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Última Actualización</small>
                              <div className="d-flex align-items-center">
                                <Clock size={16} className="text-muted me-2" />
                                <span>{formatDate(selectedFutRequest.updatedAt)}</span>
                              </div>
                            </div>
                            {selectedFutRequest.estimatedDeliveryDate && (
                              <div className="mb-3">
                                <small className="text-muted d-block mb-1">Fecha Estimada de Entrega</small>
                                <div className="d-flex align-items-center">
                                  <Calendar size={16} className="text-muted me-2" />
                                  <span>{formatDate(selectedFutRequest.estimatedDeliveryDate)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="col-lg-8 col-xl-9">
                  <div className="p-4">
                    {/* Tabs */}
                    <div className="d-flex border-bottom mb-4">
                      {tabs.map((tab) => {
                        const IconComponent = tab.icon
                        return (
                          <button
                            key={tab.id}
                            className={`btn px-4 py-2 me-2 border-0 tab-transition ${activeTab === tab.id ? 'bg-primary text-white' : 'text-muted'}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ borderRadius: "0.375rem 0.375rem 0 0" }}
                          >
                            <IconComponent size={16} className="me-2" />
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {activeTab === "details" && (
                        <div className="tab-pane fade show active slide-in">
                          <div className="row">
                            <div className="col-12">
                              <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body">
                                  <h5 className="card-title d-flex align-items-center">
                                    <Tag size={20} className="text-primary me-2" />
                                    Asunto de la Solicitud
                                  </h5>
                                  <p className="card-text fs-5">{selectedFutRequest.requestSubject}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="col-12">
                              <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                  <h5 className="card-title d-flex align-items-center">
                                    <MessageCircle size={20} className="text-primary me-2" />
                                    Descripción
                                  </h5>
                                  <div className="border-start border-primary ps-3 py-2 bg-light bg-opacity-50 rounded">
                                    <p className="mb-0">{selectedFutRequest.requestDescription}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "documents" && (
                        <div className="tab-pane fade show active slide-in">
                          {selectedFutRequest.attachedDocuments &&
                            Object.keys(selectedFutRequest.attachedDocuments).length > 0 ? (
                            <div className="row">
                              {Object.entries(selectedFutRequest.attachedDocuments).map(([fileId, fileData]) => (
                                <div key={fileId} className="col-md-6 mb-3">
                                  <div className="card border-0 shadow-sm h-100 tab-transition">
                                    <div className="card-body">
                                      <div className="d-flex align-items-center mb-3">
                                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                                          <File size={20} className="text-warning" />
                                        </div>
                                        <div className="flex-grow-1">
                                          <h6 className="mb-0 text-truncate">{fileData.name}</h6>
                                          <small className="text-muted">
                                            {formatFileSize(fileData.size)} • {fileData.type}
                                          </small>
                                        </div>
                                      </div>
                                      <div className="d-flex justify-content-end">
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleDownload(fileData)}
                                        >
                                          <Download size={14} className="me-1" />
                                          Descargar
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-5 slide-in">
                              <File size={48} className="text-muted mb-3" />
                              <h5 className="text-muted">No hay documentos adjuntos</h5>
                              <p className="text-muted">Esta solicitud no tiene documentos adjuntos.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "notes" && (
                        <div className="tab-pane fade show active slide-in">
                          {selectedFutRequest.adminNotes ? (
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <h5 className="card-title d-flex align-items-center">
                                  <MessageSquare size={20} className="text-primary me-2" />
                                  Notas Administrativas
                                </h5>
                                <div className="alert alert-light border mb-0">
                                  <div className="d-flex">
                                    <Edit3 size={16} className="text-muted me-2 mt-1 flex-shrink-0" />
                                    <div>{selectedFutRequest.adminNotes}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-5 slide-in">
                              <MessageSquare size={48} className="text-muted mb-3" />
                              <h5 className="text-muted">Sin notas administrativas</h5>
                              <p className="text-muted">No se han agregado notas administrativas a esta solicitud.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light p-3" style={{ borderTop: "1px solid #e9ecef" }}>
              <div className="d-flex justify-content-between w-100">
                <div className="text-muted">
                  <small>
                    <Clock size={14} className="me-1" />
                    Actualizado: {formatDate(selectedFutRequest.updatedAt)}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                  >
                    <X size={16} className="me-2" />
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onEdit(selectedFutRequest)}
                  >
                    <Edit size={16} className="me-2" />
                    Editar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

DetailModal.propTypes = {
  selectedFutRequest: PropTypes.shape({
    id: PropTypes.string,
    requestNumber: PropTypes.string,
    requestSubject: PropTypes.string,
    requestDescription: PropTypes.string,
    studentEnrollmentId: PropTypes.string,
    requestType: PropTypes.string,
    urgencyLevel: PropTypes.string,
    status: PropTypes.string,
    requestedBy: PropTypes.string,
    contactPhone: PropTypes.string,
    contactEmail: PropTypes.string,
    estimatedDeliveryDate: PropTypes.string,
    adminNotes: PropTypes.string,
    attachedDocuments: PropTypes.object,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      documentType: PropTypes.string,
      documentNumber: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
      district: PropTypes.string,
    })
  ).isRequired,
  originInstitution: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    logo: PropTypes.string,
  }),
  getStatusConfig: PropTypes.func.isRequired,
  getUrgencyConfig: PropTypes.func.isRequired,
  getRequestTypeConfig: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

export default DetailModal