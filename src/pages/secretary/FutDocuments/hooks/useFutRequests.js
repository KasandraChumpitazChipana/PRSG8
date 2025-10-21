import { useState, useEffect } from "react"
import FutRequestService from "../../../../services/fut/FutRequestService"
import StudentService from "../../../../services/students/studentService"
import InstitutionPersonalService from "../../../../services/institutions/institutionPersonalService"

/**
 * Custom hook for managing FUT requests data
 */
export const useFutRequests = () => {
  const [futRequests, setFutRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [originInstitution, setOriginInstitution] = useState(null)
  const [institutionLoading, setInstitutionLoading] = useState(false)

  /**
   * Carga todas las solicitudes FUT
   */
  const loadFutRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await FutRequestService.getAll()

      if (response.success) {
        setFutRequests(response.data)
      } else {
        setError(response.error || "Error al cargar las solicitudes FUT")
      }
    } catch (err) {
      setError("Error inesperado al cargar las solicitudes")
      console.error("Error loading FUT requests:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carga todos los estudiantes para el selector
   */
  const loadStudents = async () => {
    try {
      setStudentsLoading(true)
      const response = await StudentService.getAllStudents()

      if (response.success) {
        setStudents(response.data)
      } else {
        console.error("Error loading students:", response.error)
      }
    } catch (err) {
      console.error("Error loading students:", err)
    } finally {
      setStudentsLoading(false)
    }
  }

  /**
   * Carga la institución de origen del personal autenticado
   */
  const loadOriginInstitution = async () => {
    try {
      setInstitutionLoading(true)
      const response = await InstitutionPersonalService.getPersonalInstitution()

      if (response.success) {
        setOriginInstitution(response.data)
      } else {
        console.error("Error loading origin institution:", response.error)
      }
    } catch (err) {
      console.error("Error loading origin institution:", err)
    } finally {
      setInstitutionLoading(false)
    }
  }

  /**
   * Maneja la búsqueda de solicitudes
   */
  const searchFutRequests = async (searchTerm) => {
    if (!searchTerm.trim()) {
      await loadFutRequests()
      return { data: futRequests, success: true }
    }

    try {
      setLoading(true)
      setError(null)

      // Filtrar las solicitudes existentes por número de solicitud
      const filteredRequests = futRequests.filter(req => 
        req.requestNumber && req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )

      return { data: filteredRequests, success: true }
    } catch (err) {
      setError("Error inesperado al buscar las solicitudes")
      console.error("Error searching FUT requests:", err)
      return { success: false, error: "Error inesperado al buscar las solicitudes" }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crea una nueva solicitud FUT
   */
  const createFutRequest = async (formData, validateFutRequest, generateRequestNumber) => {
    try {
      // If requestNumber is not provided, it should have been generated in the form
      // If for some reason it's still missing, we can generate a default one
      const dataToSend = {
        ...formData,
        requestNumber: formData.requestNumber || generateRequestNumber(),
      }

      // Validate the form data
      const validation = validateFutRequest(dataToSend)

      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(", ")
        return { success: false, error: `Errores de validación: ${errorMessages}` }
      }

      const response = await FutRequestService.create(dataToSend)
      return response
    } catch (err) {
      console.error("Error creating FUT:", err)
      return { success: false, error: "Error inesperado al crear la solicitud" }
    }
  }

  /**
   * Actualiza una solicitud FUT
   */
  const updateFutRequest = async (id, formData) => {
    try {
      const response = await FutRequestService.update(id, formData)
      return response
    } catch (err) {
      console.error("Error updating FUT:", err)
      return { success: false, error: "Error inesperado al actualizar la solicitud" }
    }
  }

  /**
   * Elimina una solicitud FUT
   */
  const deleteFutRequest = async (id) => {
    try {
      const response = await FutRequestService.delete(id)
      return response
    } catch (err) {
      console.error("Error deleting FUT:", err)
      return { success: false, error: "Error inesperado al eliminar la solicitud" }
    }
  }

  // Cargar solicitudes FUT y estudiantes al montar el hook
  useEffect(() => {
    loadFutRequests()
    loadStudents()
    loadOriginInstitution()
  }, [])

  return {
    // Data
    futRequests,
    students,
    originInstitution,
    
    // Loading states
    loading,
    studentsLoading,
    institutionLoading,
    
    // Errors
    error,
    
    // Functions
    loadFutRequests,
    loadStudents,
    loadOriginInstitution,
    searchFutRequests,
    createFutRequest,
    updateFutRequest,
    deleteFutRequest,
  }
}