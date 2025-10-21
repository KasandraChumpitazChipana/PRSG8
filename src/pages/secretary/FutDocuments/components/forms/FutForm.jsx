import React, { useState } from "react"
import PropTypes from "prop-types"
import { 
  User, Hash, Folder, AlertTriangle, Tag, Edit, File, Phone, Mail, Calendar, MessageSquare, Info, X, Save, Check, Home, MapPin, School
} from "feather-icons-react"

// Helper component for rendering icons
const IconComponent = ({ icon, ...props }) => {
  const iconMap = {
    User,
    Hash,
    Folder,
    AlertTriangle,
    Tag,
    Edit,
    File,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Info,
    X,
    Save,
    Check,
    Home,
    MapPin,
    School
  };
  
  const Icon = iconMap[icon];
  return Icon ? <Icon {...props} /> : null;
};

IconComponent.propTypes = {
  icon: PropTypes.string.isRequired
};

const FutForm = ({ 
  formData, 
  handleInputChange, 
  handleStudentSelect, 
  students, 
  studentsLoading, 
  institutionLoading,
  selectedStudent, 
  originInstitution,
  handleFileUpload, 
  removeAttachedDocument, 
  formatFileSize, 
  handleSubmit, 
  isEdit = false, 
  loading = false,
  onCancel 
}) => {
  const [activeSection, setActiveSection] = useState("student")

  const sections = [
    { id: "student", title: "Información del Estudiante", icon: "User" },
    { id: "request", title: "Detalles de la Solicitud", icon: "File" },
    { id: "documents", title: "Documentos Adjuntos", icon: "File" },
    { id: "guardian", title: "Datos del Apoderado", icon: "User" },
    { id: "additional", title: "Información Adicional", icon: "Calendar" }
  ]

  // Icon mapping for section navigation
  const iconMap = {
    User,
    File,
    Calendar,
    AlertTriangle,
    Tag,
    Edit,
    Phone,
    Mail,
    MessageSquare,
    Info,
    X,
    Save,
    Check,
    Home,
    MapPin,
    School
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body p-0">
        <div className="row g-0">
          {/* Sidebar Navigation */}
          <div className="col-md-3">
            <div className="list-group list-group-flush border-end">
              {sections.map((section) => {
                const IconComponent = iconMap[section.icon];
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex align-items-center ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="me-2"><IconComponent size={16} /></span>
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="col-md-9">
            <div className="p-4">
              {/* Sección 1: Información del Estudiante */}
              {activeSection === "student" && (
                <div>
                  <h5 className="mb-4">
                    <IconComponent icon="User" size={20} className="me-2 text-primary" />
                    Información del Estudiante
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="User" size={16} className="me-1" />
                          Seleccionar Estudiante <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          name="studentEnrollmentId"
                          value={formData.studentEnrollmentId}
                          onChange={handleStudentSelect}
                          required
                          disabled={studentsLoading}
                        >
                          <option value="">{studentsLoading ? "Cargando estudiantes..." : "Seleccionar estudiante"}</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} - {student.documentNumber}
                            </option>
                          ))}
                        </select>
                        {studentsLoading && (
                          <small className="text-muted">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            Cargando lista de estudiantes...
                          </small>
                        )}
                      </div>

                      {selectedStudent && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <h6 className="text-primary mb-2">
                            <IconComponent icon="Info" size={16} className="me-1" />
                            Información del Estudiante Seleccionado
                          </h6>
                          <div className="row">
                            <div className="col-12">
                              <small className="text-muted d-block">
                                <strong>Nombre:</strong> {selectedStudent.firstName} {selectedStudent.lastName}
                              </small>
                              <small className="text-muted d-block">
                                <strong>Documento:</strong> {selectedStudent.documentType} - {selectedStudent.documentNumber}
                              </small>
                              {selectedStudent.phone && (
                                <small className="text-muted d-block">
                                  <strong>Teléfono:</strong> {selectedStudent.phone}
                                </small>
                              )}
                              {selectedStudent.email && (
                                <small className="text-muted d-block">
                                  <strong>Email:</strong> {selectedStudent.email}
                                </small>
                              )}
                              {selectedStudent.guardianName && (
                                <small className="text-muted d-block">
                                  <strong>Apoderado:</strong> {selectedStudent.guardianName} {selectedStudent.guardianLastName}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      {/* Número de Solicitud field removed as per requirements */}
                      {/* The field is now automatically generated and hidden from the form */}
                      
                      {/* Colegio de procedencia */}
                      <div className="form-group mt-3">
                        <label className="form-label">
                          <IconComponent icon="School" size={16} className="me-1" />
                          Colegio de Procedencia
                        </label>
                        {institutionLoading ? (
                          <div className="d-flex align-items-center p-2 bg-light rounded">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            <small className="text-muted">Cargando información del colegio...</small>
                          </div>
                        ) : originInstitution ? (
                          <div className="d-flex align-items-center p-2 bg-light rounded">
                            {originInstitution.logo && (
                              <img 
                                src={originInstitution.logo} 
                                alt="Logo del colegio" 
                                style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} 
                              />
                            )}
                            <div>
                              <div className="fw-bold">{originInstitution.name}</div>
                              <small className="text-muted">Institución de origen</small>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-light rounded">
                            <small className="text-muted">No se encontró información del colegio de procedencia</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección 2: Detalles de la Solicitud */}
              {activeSection === "request" && (
                <div>
                  <h5 className="mb-4">
                    <IconComponent icon="File" size={20} className="me-2 text-info" />
                    Detalles de la Solicitud
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Folder" size={16} className="me-1" />
                          Tipo de Solicitud <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          name="requestType"
                          value={formData.requestType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="CERTIFICADO">🏆 Certificado</option>
                          <option value="CONSTANCIA">📄 Constancia</option>
                          <option value="TRASLADO">➡️ Traslado</option>
                          <option value="RECTIFICACION">✏️ Rectificación</option>
                          <option value="OTROS">📋 Otros</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="AlertTriangle" size={16} className="me-1" />
                          Nivel de Urgencia <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          name="urgencyLevel"
                          value={formData.urgencyLevel}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="BAJA">🟢 Baja</option>
                          <option value="MEDIA">🟡 Media</option>
                          <option value="ALTA">🔴 Alta</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Tag" size={16} className="me-1" />
                          Asunto de la Solicitud <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="requestSubject"
                          value={formData.requestSubject}
                          onChange={handleInputChange}
                          placeholder="Ingrese el asunto de la solicitud"
                          maxLength="150"
                          required
                        />
                        <small className="text-muted">
                          <IconComponent icon="Info" size={14} className="me-1" />
                          {formData.requestSubject.length}/150 caracteres
                        </small>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Edit" size={16} className="me-1" />
                          Descripción de la Solicitud <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          name="requestDescription"
                          value={formData.requestDescription}
                          onChange={handleInputChange}
                          placeholder="Describa detalladamente su solicitud"
                          rows="4"
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección 3: Documentos Adjuntos */}
              {activeSection === "documents" && (
                <div>
                  <h5 className="mb-4">
                    <IconComponent icon="File" size={20} className="me-2 text-success" />
                    Documentos Adjuntos
                  </h5>
                  <div className="row">
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="File" size={16} className="me-1" />
                          Subir Documentos
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          multiple
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        />
                        <small className="text-muted">
                          <IconComponent icon="Info" size={14} className="me-1" />
                          Formatos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT. Máximo 10MB por archivo.
                        </small>
                      </div>

                      {Object.keys(formData.attachedDocuments).length > 0 && (
                        <div className="mt-3">
                          <h6 className="text-muted mb-2">
                            <IconComponent icon="File" size={16} className="me-1" />
                            Archivos Adjuntos ({Object.keys(formData.attachedDocuments).length})
                          </h6>
                          <div className="border rounded p-3 bg-light">
                            {Object.entries(formData.attachedDocuments).map(([fileId, fileData]) => (
                              <div
                                key={fileId}
                                className="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded border"
                              >
                                <div className="d-flex align-items-center">
                                  <IconComponent icon="File" size={16} className="me-2 text-primary" />
                                  <div>
                                    <div className="fw-medium">{fileData.name}</div>
                                    <small className="text-muted">
                                      {formatFileSize(fileData.size)} • {fileData.type}
                                    </small>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeAttachedDocument(fileId)}
                                  title="Eliminar archivo"
                                >
                                  <IconComponent icon="X" size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sección 4: Datos del Apoderado */}
              {activeSection === "guardian" && (
                <div>
                  <h5 className="mb-4">
                    <IconComponent icon="User" size={20} className="me-2 text-warning" />
                    Datos del Apoderado
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="User" size={16} className="me-1" />
                          Apellidos y Nombres <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="requestedBy"
                          value={formData.requestedBy}
                          onChange={handleInputChange}
                          placeholder="Apellidos y nombres completos"
                          required
                        />
                        <small className="text-muted">
                          <Info size={14} className="me-1" />
                          Se auto-completa al seleccionar estudiante
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Phone" size={16} className="me-1" />
                          Teléfono <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="999999999"
                          pattern="[0-9]{9,12}"
                          minLength="9"
                          maxLength="12"
                          required
                        />
                        <small className="text-muted">
                          <Info size={14} className="me-1" />
                          Se auto-completa al seleccionar estudiante
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="File" size={16} className="me-1" />
                          DNI <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="guardianDni"
                          value={formData.guardianDni || ''}
                          onChange={handleInputChange}
                          placeholder="Documento de identidad"
                          maxLength="8"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Mail" size={16} className="me-1" />
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          placeholder="correo@ejemplo.com"
                        />
                        <small className="text-muted">
                          <Info size={14} className="me-1" />
                          Se auto-completa al seleccionar estudiante
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Home" size={16} className="me-1" />
                          Domicilio
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="guardianAddress"
                          value={formData.guardianAddress || ''}
                          onChange={handleInputChange}
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="MapPin" size={16} className="me-1" />
                          Distrito
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="guardianDistrict"
                          value={formData.guardianDistrict || ''}
                          onChange={handleInputChange}
                          placeholder="Distrito"
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label className="form-label">
                          <MapPin size={16} className="me-1" />
                          Provincia
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="guardianProvince"
                          value={formData.guardianProvince || ''}
                          onChange={handleInputChange}
                          placeholder="Provincia"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección 5: Información Adicional */}
              {activeSection === "additional" && (
                <div>
                  <h5 className="mb-4">
                    <IconComponent icon="Calendar" size={20} className="me-2 text-secondary" />
                    Información Adicional
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="Calendar" size={16} className="me-1" />
                          Fecha Estimada de Entrega
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="estimatedDeliveryDate"
                          value={formData.estimatedDeliveryDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">
                          <IconComponent icon="MessageSquare" size={16} className="me-1" />
                          Notas Administrativas
                        </label>
                        <textarea
                          className="form-control"
                          name="adminNotes"
                          value={formData.adminNotes}
                          onChange={handleInputChange}
                          placeholder="Notas adicionales (opcional)"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          <IconComponent icon="X" size={16} className="me-2" />
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <div className="d-flex align-items-center">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {isEdit ? "Actualizando..." : "Creando..."}
            </div>
          ) : (
            <div className="d-flex align-items-center">
              {isEdit ? <IconComponent icon="Save" size={16} className="me-2" /> : <IconComponent icon="Check" size={16} className="me-2" />}
              {isEdit ? "Actualizar Solicitud" : "Crear Solicitud"}
            </div>
          )}
        </button>
      </div>
    </form>
  )
}

FutForm.propTypes = {
  formData: PropTypes.shape({
    studentEnrollmentId: PropTypes.string,
    requestType: PropTypes.string,
    requestSubject: PropTypes.string,
    requestDescription: PropTypes.string,
    requestedBy: PropTypes.string,
    contactPhone: PropTypes.string,
    contactEmail: PropTypes.string,
    guardianDni: PropTypes.string,
    guardianAddress: PropTypes.string,
    guardianDistrict: PropTypes.string,
    guardianProvince: PropTypes.string,
    urgencyLevel: PropTypes.string,
    estimatedDeliveryDate: PropTypes.string,
    attachedDocuments: PropTypes.object,
    adminNotes: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleStudentSelect: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      documentType: PropTypes.string,
      documentNumber: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
      guardianName: PropTypes.string,
      guardianLastName: PropTypes.string,
    })
  ).isRequired,
  studentsLoading: PropTypes.bool.isRequired,
  institutionLoading: PropTypes.bool,
  selectedStudent: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    documentType: PropTypes.string,
    documentNumber: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    guardianName: PropTypes.string,
    guardianLastName: PropTypes.string,
  }),
  originInstitution: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    logo: PropTypes.string,
  }),
  handleFileUpload: PropTypes.func.isRequired,
  removeAttachedDocument: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  loading: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
}

export default FutForm
