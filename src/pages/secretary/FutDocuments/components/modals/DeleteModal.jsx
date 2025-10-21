import React from "react"
import PropTypes from "prop-types"
import { Trash2, AlertTriangle, Info, X } from "feather-icons-react"

const DeleteModal = ({ 
  selectedFutRequest, 
  students, 
  onClose, 
  onConfirm, 
  loading = false 
}) => {
  if (!selectedFutRequest) return null

  const getStudentNameById = (studentId) => {
    const student = students.find((s) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : studentId
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <Trash2 size={20} className="me-2" />
              Confirmar Eliminación
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="text-center">
              <div className="mb-4">
                <AlertTriangle size={64} className="text-warning" />
              </div>
              <h4 className="text-danger mb-3">¿Estás seguro?</h4>
              <div className="alert alert-warning">
                <div className="mb-2">
                  <strong>Solicitud:</strong> #{selectedFutRequest.requestNumber}
                </div>
                <div className="mb-2">
                  <strong>Asunto:</strong> {selectedFutRequest.requestSubject}
                </div>
                <div>
                  <strong>Estudiante:</strong> {getStudentNameById(selectedFutRequest.studentEnrollmentId)}
                </div>
              </div>
              <div className="alert alert-danger">
                <Info size={16} className="me-2" />
                <strong>¡Atención!</strong> Esta acción no se puede deshacer. La solicitud será eliminada
                permanentemente del sistema.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <X size={16} className="me-2" />
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="me-2" />
                  Sí, Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal

DeleteModal.propTypes = {
  selectedFutRequest: PropTypes.shape({
    id: PropTypes.string,
    requestNumber: PropTypes.string,
    requestSubject: PropTypes.string,
    studentEnrollmentId: PropTypes.string,
  }).isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}
