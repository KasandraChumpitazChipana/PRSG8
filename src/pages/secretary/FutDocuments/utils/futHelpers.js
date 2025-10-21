import { jsPDF } from "jspdf"
import { formatGuardianRelationship } from "../../../../types/students/students"

/**
 * Obtiene el nombre completo del estudiante por ID
 */
export const getStudentNameById = (studentId, students) => {
  const student = students.find((s) => s.id === studentId)
  return student ? `${student.firstName} ${student.lastName}` : studentId
}

/**
 * Obtiene la clase CSS para el estado
 */
export const getStatusConfig = (status) => {
  const configs = {
    PENDIENTE: { class: "bg-warning text-dark", icon: "Clock", text: "Pendiente" },
    APROBADO: { class: "bg-success", icon: "CheckCircle", text: "Aprobado" },
    RECHAZADO: { class: "bg-danger", icon: "XCircle", text: "Rechazado" },
    COMPLETADO: { class: "bg-info", icon: "CheckSquare", text: "Completado" },
  }
  return configs[status] || { class: "bg-secondary", icon: "HelpCircle", text: status }
}

/**
 * Obtiene la configuración para el nivel de urgencia
 */
export const getUrgencyConfig = (urgency) => {
  const configs = {
    ALTA: { class: "bg-danger", icon: "AlertTriangle", text: "Alta" },
    MEDIA: { class: "bg-warning text-dark", icon: "AlertCircle", text: "Media" },
    BAJA: { class: "bg-success", icon: "CheckCircle", text: "Baja" },
  }
  return configs[urgency] || { class: "bg-secondary", icon: "HelpCircle", text: urgency }
}

/**
 * Obtiene la configuración del tipo de solicitud
 */
export const getRequestTypeConfig = (type) => {
  const configs = {
    CERTIFICADO: { icon: "Award", color: "text-primary" },
    CONSTANCIA: { icon: "FileText", color: "text-info" },
    TRASLADO: { icon: "ArrowRightCircle", color: "text-warning" },
    RECTIFICACION: { icon: "Edit3", color: "text-success" },
    OTROS: { icon: "MoreHorizontal", color: "text-secondary" },
  }
  return configs[type] || { icon: "File", color: "text-muted" }
}

/**
 * Formatea la fecha para mostrar
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A"

  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return "Fecha inválida"
  }
}

/**
 * Formatea el tamaño del archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Obtiene estadísticas de las solicitudes
 */
export const getStatistics = (futRequests) => {
  const total = futRequests.length
  const pending = futRequests.filter((req) => req.status === "PENDIENTE").length
  const approved = futRequests.filter((req) => req.status === "APROBADO").length
  const completed = futRequests.filter((req) => req.status === "COMPLETADO").length
  const rejected = futRequests.filter((req) => req.status === "RECHAZADO").length

  return { total, pending, approved, completed, rejected }
}

/**
 * Genera un PDF con los datos del formulario FUT
 */
export const generateFutPDF = (futRequest, students) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configuración de estilos
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let yPosition = margin

    // Funciones auxiliares para el PDF
    const addText = (text, x, y, options = {}) => {
      doc.setFontSize(options.size || 10)
      doc.setFont(undefined, options.weight || "normal")
      doc.text(text, x, y, options)
      return y + (options.lineHeight || 5)
    }

    const addLine = (x1, y1, x2, y2) => {
      doc.setDrawColor(0)
      doc.setLineWidth(0.2)
      doc.line(x1, y1, x2, y2)
    }

    const addRect = (x, y, width, height, style = null) => {
      if (style === 'F') {
        doc.setFillColor(240, 240, 240)
      } else if (style === 'S') {
        doc.setFillColor(255, 255, 255)
      }
      doc.rect(x, y, width, height, style)
    }

    // Encabezado con logo y datos de la institución
    doc.setFillColor(25, 118, 210) // Azul institucional
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    // Logo placeholder (se puede reemplazar con una imagen real)
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, 8, 25, 20, 'F')
    doc.setTextColor(25, 118, 210)
    addText("LOGO", margin + 12.5, 19, { size: 10, align: "center" })
    
    // Información de la institución
    doc.setTextColor(0, 0, 0)
    yPosition = addText("INSTITUCIÓN EDUCATIVA PÚBLICA Nº 20188 – INICIAL 627", margin + 35, yPosition + 15, {
      size: 14,
      weight: "bold",
    })
    yPosition = addText('"Centro de Mujeres"', margin + 35, yPosition, { size: 12, weight: "bold" })
    yPosition = addText("RUC: 20131378921", margin + 35, yPosition, { size: 10 })
    yPosition = addText("Dirección: Av. Los Pinos 123, San Vicente", margin + 35, yPosition, { size: 10 })
    yPosition = addText("Teléfono: (01) 1234567 | Email: contacto@institucion.edu.pe", margin + 35, yPosition, { size: 10 })
    yPosition += 5

    addLine(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Título del documento
    doc.setFillColor(25, 118, 210) // Azul institucional
    doc.setTextColor(0, 0, 0) // Negro para el título principal
    addRect(margin, yPosition, contentWidth, 15, 'F')
    yPosition = addText("FORMATO ÚNICO DE TRÁMITES (FUT)", pageWidth / 2, yPosition + 10, {
      size: 16,
      weight: "bold",
      align: "center"
    })
    doc.setTextColor(0, 0, 0)
    yPosition += 18

    // Información general del FUT
    doc.setFillColor(245, 245, 245)
    addRect(margin, yPosition, contentWidth, 30, 'F')
    yPosition = addText(`Nº SOLICITUD: ${futRequest.requestNumber || "_______________"}`, margin + 5, yPosition + 10, {
      size: 12,
      weight: "bold",
    })
    yPosition = addText(`FECHA DE SOLICITUD: ${futRequest.createdAt ? new Date(futRequest.createdAt).toLocaleDateString("es-ES") : new Date().toLocaleDateString("es-ES")}`, pageWidth - margin - 80, yPosition, {
      size: 10,
      align: "right"
    })
    yPosition = addText(`FECHA DE GENERACIÓN: ${new Date().toLocaleDateString("es-ES")}`, pageWidth - margin - 80, yPosition, {
      size: 10,
      align: "right"
    })
    yPosition = addText(`HORA DE GENERACIÓN: ${new Date().toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin - 80, yPosition, {
      size: 10,
      align: "right"
    })
    yPosition += 12

    // Tipo de solicitud y urgencia
    yPosition = addText(`TIPO DE SOLICITUD: ${futRequest.requestType || "_______________"}`, margin, yPosition, {
      size: 11,
      weight: "bold",
    })
    yPosition += 3

    // Urgencia
    const urgencyText = {
      "ALTA": "ALTA (Requiere atención inmediata)",
      "MEDIA": "MEDIA (Atención en 3-5 días)",
      "BAJA": "BAJA (Atención en 5-10 días)"
    }
    yPosition = addText(`URGENCIA: ${urgencyText[futRequest.urgencyLevel] || futRequest.urgencyLevel}`, margin, yPosition, {
      size: 11,
    })
    yPosition += 3

    // Estado
    const statusText = {
      "PENDIENTE": "PENDIENTE",
      "APROBADO": "APROBADO",
      "RECHAZADO": "RECHAZADO",
      "COMPLETADO": "COMPLETADO"
    }
    yPosition = addText(`ESTADO: ${statusText[futRequest.status] || futRequest.status}`, margin, yPosition, {
      size: 11,
    })
    yPosition += 12

    // Datos del Estudiante
    doc.setFillColor(33, 150, 243) // Azul más vibrante
    doc.setTextColor(0, 0, 0) // Negro para el título
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("DATOS DEL ESTUDIANTE", margin + 3, yPosition + 6, { size: 11, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    // Buscar estudiante por ID de matrícula
    const requestStudent = students.find((s) => s.id === futRequest.studentEnrollmentId)
    
    if (requestStudent) {
      addRect(margin, yPosition, contentWidth, 140, 'S')
      yPosition = addText(`Nombres y Apellidos: ${requestStudent.firstName} ${requestStudent.lastName}`, margin + 5, yPosition + 8, { size: 11 })
      yPosition = addText(`Documento: ${requestStudent.documentType} ${requestStudent.documentNumber}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Fecha de Nacimiento: ${requestStudent.birthDate ? new Date(requestStudent.birthDate).toLocaleDateString("es-ES") : "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Género: ${requestStudent.gender === 'MALE' ? 'Masculino' : 'Femenino'}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Grado/Aula: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Dirección: ${requestStudent.address || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Distrito: ${requestStudent.district || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Provincia: ${requestStudent.province || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Departamento: ${requestStudent.department || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Teléfono: ${requestStudent.phone || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Email: ${requestStudent.email || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Código Estudiantil: ${requestStudent.id || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Estado: ${requestStudent.status || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      
      // Información adicional del estudiante
      yPosition = addText(`Relación con Apoderado: ${requestStudent.guardianRelationship || "_______________"}`, margin + 5, yPosition + 7, { size: 11 })
      yPosition += 12
    } else {
      addRect(margin, yPosition, contentWidth, 100, 'S')
      yPosition = addText(`Nombres y Apellidos: _______________`, margin + 5, yPosition + 8, { size: 11 })
      yPosition = addText(`Documento: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Fecha de Nacimiento: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Género: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Grado/Aula: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Dirección: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Distrito: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Provincia: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Departamento: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Teléfono: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Email: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Código Estudiantil: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition = addText(`Relación con Apoderado: _______________`, margin + 5, yPosition + 7, { size: 11 })
      yPosition += 12
    }

    // DATOS DEL APODERADO - Sección mejorada con diseño
    doc.setFillColor(76, 175, 80) // Verde para resaltar
    doc.setTextColor(0, 0, 0) // Negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 10, 'F')
    yPosition = addText("DATOS DEL APODERADO", margin + 3, yPosition + 7, { size: 12, weight: "bold" })
    doc.setTextColor(0, 0, 0) // Restaurar color de texto a negro
    yPosition += 5 // Aumentar espacio después del título

    // Obtener información del apoderado del estudiante o del FUT
    // Primero intentamos obtener del FUT, luego del estudiante
    const guardianName = futRequest.requestedBy || 
                         (requestStudent ? `${requestStudent.firstName} ${requestStudent.lastName}` : "") ||
                         "_______________"
    
    const guardianDocument = futRequest.guardianDni || 
                             requestStudent?.guardianDocumentNumber || 
                             (requestStudent ? `${requestStudent.guardianDocumentType} ${requestStudent.guardianDocumentNumber}` : "") ||
                             "_______________"
    
    const guardianPhone = futRequest.contactPhone || 
                          requestStudent?.guardianPhone || 
                          "_______________"
    
    const guardianEmail = futRequest.contactEmail || 
                          requestStudent?.guardianEmail || 
                          "_______________"
    
    const guardianAddress = futRequest.guardianAddress || 
                            requestStudent?.guardianAddress || 
                            requestStudent?.address || 
                            "_______________"
    
    const guardianDistrict = futRequest.guardianDistrict || 
                             requestStudent?.guardianDistrict || 
                             requestStudent?.district || 
                             "_______________"
    
    const guardianProvince = futRequest.guardianProvince || 
                             requestStudent?.guardianProvince || 
                             requestStudent?.province || 
                             "_______________"
    
    const guardianRelationship = requestStudent?.guardianRelationship || 
                                 "_______________"
    
    // Crear un contenedor con mejor diseño para los datos del apoderado
    const guardianSectionHeight = 230 // Ajustar altura según contenido
    addRect(margin, yPosition, contentWidth, guardianSectionHeight, 'S')
    
    // Verificar si necesitamos una nueva página
    if (yPosition + guardianSectionHeight > pageHeight - 50) {
      doc.addPage()
      yPosition = margin
    }
    
    let currentY = yPosition + 5 // Posición inicial dentro del contenedor
    
    // Información principal del apoderado (en la parte superior)
    doc.setFillColor(245, 245, 245) // Fondo gris claro para sección principal
    addRect(margin + 5, currentY, contentWidth - 10, 45, 'F')
    
    // Nombre completo del apoderado
    doc.setFont(undefined, "bold")
    currentY = addText("Nombre Completo:", margin + 10, currentY + 10, { size: 11 })
    doc.setFont(undefined, "normal")
    currentY = addText(guardianName, margin + 10, currentY + 1, { size: 11 })
    
    // Documento de identidad
    doc.setFont(undefined, "bold")
    currentY = addText("Documento de Identidad:", margin + 10, currentY + 8, { size: 11 })
    doc.setFont(undefined, "normal")
    currentY = addText(guardianDocument, margin + 10, currentY + 1, { size: 11 })
    
    // Relación con el estudiante
    doc.setFont(undefined, "bold")
    currentY = addText("Relación con el Estudiante:", margin + 10, currentY + 8, { size: 11 })
    doc.setFont(undefined, "normal")
    const relationshipDisplay = requestStudent ? formatGuardianRelationship(requestStudent.guardianRelationship) : guardianRelationship;
    currentY = addText(relationshipDisplay, margin + 10, currentY + 1, { size: 11 })
    
    // Línea divisoria
    addLine(margin + 10, currentY + 5, pageWidth - margin - 10, currentY + 5)
    currentY += 10
    
    // Información de contacto (segunda sección)
    doc.setFillColor(248, 248, 248) // Fondo gris muy claro para contacto
    addRect(margin + 5, currentY, contentWidth - 10, 45, 'F')
    
    doc.setFont(undefined, "bold")
    currentY = addText("INFORMACIÓN DE CONTACTO", margin + 10, currentY + 10, { size: 10, weight: "bold" })
    doc.setFont(undefined, "normal")
    
    // Teléfono
    currentY = addText("Teléfono:", margin + 15, currentY + 8, { size: 10 })
    currentY = addText(guardianPhone, margin + 35, currentY, { size: 10 })
    
    // Email
    currentY = addText("Email:", margin + 15, currentY + 6, { size: 10 })
    currentY = addText(guardianEmail, margin + 35, currentY, { size: 10 })
    
    // Línea divisoria
    addLine(margin + 10, currentY + 5, pageWidth - margin - 10, currentY + 5)
    currentY += 10
    
    // Información de domicilio (tercera sección)
    doc.setFillColor(250, 250, 250) // Fondo gris muy claro para domicilio
    addRect(margin + 5, currentY, contentWidth - 10, 55, 'F')
    
    doc.setFont(undefined, "bold")
    currentY = addText("DOMICILIO", margin + 10, currentY + 10, { size: 10, weight: "bold" })
    doc.setFont(undefined, "normal")
    
    // Dirección
    currentY = addText("Dirección:", margin + 15, currentY + 8, { size: 10 })
    currentY = addText(guardianAddress, margin + 35, currentY, { size: 10 })
    
    // Distrito
    currentY = addText("Distrito:", margin + 15, currentY + 6, { size: 10 })
    currentY = addText(guardianDistrict, margin + 35, currentY, { size: 10 })
    
    // Provincia
    currentY = addText("Provincia:", margin + 15, currentY + 6, { size: 10 })
    currentY = addText(guardianProvince, margin + 35, currentY, { size: 10 })
    
    // Información adicional del apoderado si está disponible
    if (requestStudent) {
      // Línea divisoria
      addLine(margin + 10, currentY + 5, pageWidth - margin - 10, currentY + 5)
      currentY += 10
      
      // Sección de información adicional
      doc.setFont(undefined, "bold")
      currentY = addText("INFORMACIÓN ADICIONAL", margin + 10, currentY + 5, { size: 10, weight: "bold" })
      doc.setFont(undefined, "normal")
      
      // Tipo de documento
      currentY = addText("Tipo de Documento:", margin + 15, currentY + 7, { size: 10 })
      currentY = addText(requestStudent.guardianDocumentType || "_______________", margin + 50, currentY, { size: 10 })
      
      // Teléfono adicional
      if (requestStudent.guardianPhone) {
        currentY = addText("Teléfono Adicional:", margin + 15, currentY + 6, { size: 10 })
        currentY = addText(requestStudent.guardianPhone, margin + 50, currentY, { size: 10 })
      }
      
      // Email alternativo
      if (requestStudent.guardianEmail) {
        currentY = addText("Email Alternativo:", margin + 15, currentY + 6, { size: 10 })
        currentY = addText(requestStudent.guardianEmail, margin + 50, currentY, { size: 10 })
      }
    }
    
    // Actualizar posición Y después de la sección del apoderado
    yPosition += guardianSectionHeight + 15

    // Código del estudiante
    doc.setFont(undefined, "bold")
    yPosition = addText(`Código Estudiantil: ${futRequest.studentEnrollmentId || "_______________"}`, margin + 5, yPosition, { size: 11 })
    doc.setFont(undefined, "normal")
    yPosition += 15

    // Asunto de la Solicitud
    doc.setFillColor(255, 152, 0) // Naranja
    doc.setTextColor(0, 0, 0) // Negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("ASUNTO DE LA SOLICITUD", margin + 3, yPosition + 6, { size: 11, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    addRect(margin, yPosition, contentWidth, 30, 'S')
    yPosition = addText(futRequest.requestSubject || "_______________", margin + 5, yPosition + 16, { size: 11 })
    yPosition += 15

    // Descripción detallada
    doc.setFillColor(156, 39, 176) // Púrpura
    doc.setTextColor(0, 0, 0) // Negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("DESCRIPCIÓN DETALLADA", margin + 3, yPosition + 6, { size: 11, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    const description = futRequest.requestDescription || "_______________"
    const descriptionLines = doc.splitTextToSize(description, contentWidth - 10)
    
    // Ajustar altura del rectángulo según la cantidad de líneas
    const descriptionHeight = Math.max(60, descriptionLines.length * 7 + 15)
    addRect(margin, yPosition, contentWidth, descriptionHeight, 'S')
    
    descriptionLines.forEach((line, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = margin + 20
      }
      yPosition = addText(line, margin + 5, yPosition + 8, { size: 11 })
      // Add extra spacing between lines for better readability
      if (index < descriptionLines.length - 1) {
        yPosition += 2
      }
    })
    yPosition += descriptionHeight - (descriptionLines.length * 9) + 15

    // Documentos Adjuntos
    doc.setFillColor(233, 30, 99) // Rosa
    doc.setTextColor(0, 0, 0) // Negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("DOCUMENTOS ADJUNTOS", margin + 3, yPosition + 6, { size: 11, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    if (futRequest.attachedDocuments && Object.keys(futRequest.attachedDocuments).length > 0) {
      const documents = Object.entries(futRequest.attachedDocuments)
      const documentsHeight = Math.max(45, documents.length * 18 + 10)
      addRect(margin, yPosition, contentWidth, documentsHeight, 'S')
      let docListY = yPosition + 10
      documents.forEach(([, fileData], index) => {
        if (docListY > pageHeight - 50) {
          doc.addPage()
          docListY = margin + 20
        }
        addText(`${index + 1}. ${fileData.name}`, margin + 5, docListY, { size: 10 })
        docListY += 7
        addText(`   Tamaño: ${formatFileSize(fileData.size)} | Tipo: ${fileData.type}`, margin + 5, docListY, { size: 8, color: [100, 100, 100] })
        docListY += 11
      })
      yPosition += documentsHeight + 10
    } else {
      addRect(margin, yPosition, contentWidth, 35, 'S')
      yPosition = addText("No se adjuntaron documentos", margin + 5, yPosition + 20, { size: 11 })
      yPosition += 40
    }

    // Notas administrativas
    doc.setFillColor(139, 195, 74) // Verde claro
    doc.setTextColor(0, 0, 0) // Negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("NOTAS ADMINISTRATIVAS", margin + 3, yPosition + 6, { size: 11, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    const adminNotes = futRequest.adminNotes || "Sin observaciones"
    const notesLines = doc.splitTextToSize(adminNotes, contentWidth - 10)
    const notesHeight = Math.max(45, notesLines.length * 7 + 15)
    addRect(margin, yPosition, contentWidth, notesHeight, 'S')
    
    notesLines.forEach((line, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = margin + 20
      }
      yPosition = addText(line, margin + 5, yPosition + 8, { size: 11 })
      // Add extra spacing between lines for better readability
      if (index < notesLines.length - 1) {
        yPosition += 2
      }
    })
    yPosition += notesHeight - (notesLines.length * 9) + 15

    // Fecha estimada de entrega
    if (futRequest.estimatedDeliveryDate) {
      yPosition = addText(`FECHA ESTIMADA DE ENTREGA: ${new Date(futRequest.estimatedDeliveryDate).toLocaleDateString("es-ES")}`, margin, yPosition, { size: 11, weight: "bold" })
      yPosition += 8
    }

    // Firmas
    if (yPosition > pageHeight - 150) {
      doc.addPage()
      yPosition = margin
    }

    doc.setFillColor(96, 125, 139) // Gris azulado
    doc.setTextColor(0, 0, 0) // Negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("FIRMAS", margin + 3, yPosition + 6, { size: 11, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 8

    // Firma del solicitante
    doc.setFillColor(248, 248, 248)
    addRect(margin, yPosition, (contentWidth / 2) - 5, 60, 'F')
    addText("FIRMA DEL SOLICITANTE", margin + ((contentWidth / 2) - 5) / 2, yPosition + 18, { size: 11, align: "center" })
    addLine(margin + 15, yPosition + 45, margin + ((contentWidth / 2) - 5) - 15, yPosition + 45)
    addText("Apellidos y Nombres:", margin + 5, yPosition + 52, { size: 9 })
    addText(guardianName, margin + 50, yPosition + 52, { size: 9 })
    addText("DNI:", margin + 5, yPosition + 59, { size: 9 })
    addText(guardianDocument, margin + 30, yPosition + 59, { size: 9 })
    yPosition += 65

    // Firma del responsable
    addRect(margin + (contentWidth / 2) + 5, yPosition - 65, (contentWidth / 2) - 5, 60, 'F')
    addText("FIRMA DEL RESPONSABLE", margin + (contentWidth / 2) + 5 + ((contentWidth / 2) - 5) / 2, yPosition - 47, { size: 11, align: "center" })
    addLine(margin + (contentWidth / 2) + 20, yPosition - 25, margin + contentWidth - 20, yPosition - 25)
    addText("Nombres y Cargo:", margin + (contentWidth / 2) + 15, yPosition - 18, { size: 9 })
    yPosition += 5

    // Sello de recepción
    addRect(margin, yPosition, contentWidth, 50, 'S')
    addText("SELLO DE RECEPCIÓN", pageWidth / 2, yPosition + 20, { size: 11, align: "center" })
    addText("(Fecha y Hora de Recepción)", pageWidth / 2, yPosition + 28, { size: 9, align: "center" })
    addText("_______________________________", pageWidth / 2, yPosition + 40, { size: 9, align: "center" })
    yPosition += 55

    // Pie de página
    doc.setFillColor(63, 81, 181) // Azul oscuro
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    addText("Documento generado electrónicamente - Sistema EduAssist", pageWidth / 2, pageHeight - 14, { 
      size: 9, 
      align: "center",
      weight: "bold"
    })
    addText(`Fecha de generación: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, pageHeight - 8, { 
      size: 8, 
      align: "center"
    })

    const fileName = `FUT_${futRequest.requestNumber}_${new Date().getTime()}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error("Error generating PDF:", error)
    return { success: false, error: "Error al generar el PDF" }
  }
}