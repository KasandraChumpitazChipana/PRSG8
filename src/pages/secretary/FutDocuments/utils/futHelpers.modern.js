import { jsPDF } from "jspdf"
import logoImg from "../../../../assets/img/logo.png"

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
 * Genera un PDF moderno con estilo gubernamental y diseño compacto en una sola página
 */
export const generateModernFutPDF = (futRequest, students, originInstitution = null) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configuración de márgenes reducidos para diseño compacto
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 12 // Reducido de 15 a 12mm
    const contentWidth = pageWidth - margin * 2
    let yPosition = margin

    // Funciones auxiliares para el PDF optimizadas para diseño compacto
    const addText = (text, x, y, options = {}) => {
      doc.setFontSize(options.size || 9) // Reducido tamaño de fuente por defecto
      doc.setFont(undefined, options.weight || "normal")
      doc.text(text, x, y, options)
      return y + (options.lineHeight || 4) // Reducido espaciado de línea
    }

    const addLine = (x1, y1, x2, y2) => {
      doc.setDrawColor(0)
      doc.setLineWidth(0.1)
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

    // Encabezado profesional con logo y datos de la institución
    doc.setFillColor(25, 118, 210) // Azul institucional
    doc.rect(0, 0, pageWidth, 32, 'F')
    
    // Agregar logo de la institución
    try {
      // Si la institución tiene un logo, intentar usarlo
      if (originInstitution && originInstitution.logo) {
        // Intentar cargar el logo de la institución
        doc.addImage(originInstitution.logo, 'PNG', margin, 8, 25, 16)
      } else {
        // Logo de la institución desde assets (fallback)
        doc.addImage(logoImg, 'PNG', margin, 8, 25, 16)
      }
    } catch (error) {
      // Fallback si hay error con la imagen
      doc.setFillColor(255, 255, 255)
      doc.rect(margin, 8, 25, 16, 'F')
      doc.setTextColor(25, 118, 210)
      addText("LOGO", margin + 12.5, 17, { size: 10, align: "center" })
    }
    
    // Información de la institución - Diseño profesional
    doc.setTextColor(0, 0, 0) // Texto negro para mejor contraste
    let instYPos = 18
    const institutionName = originInstitution?.name || "INSTITUCIÓN EDUCATIVA PÚBLICA Nº 20188"
    instYPos = addText(institutionName, margin + 35, instYPos, {
      size: 12,
      weight: "bold",
    })
    
    const institutionDetails = originInstitution 
      ? `${originInstitution.codeInstitution} - "${originInstitution.address}"`
      : 'INICIAL 627 - "Centro de Mujeres"'
    instYPos = addText(institutionDetails, margin + 35, instYPos, { size: 11, weight: "bold" })
    
    const contactInfo = originInstitution 
      ? `RUC: ${originInstitution.codeInstitution} | ${originInstitution.address}`
      : "RUC: 20131378921"
    instYPos = addText(contactInfo, margin + 35, instYPos, { size: 9 })
    
    const contactDetails = originInstitution 
      ? `Tel: ${originInstitution.contactPhone} | Email: ${originInstitution.contactEmail}`
      : "Tel: (01) 1234567 | Email: contacto@institucion.edu.pe"
    instYPos = addText(contactDetails, margin + 35, instYPos, { size: 9 })
    
    yPosition = instYPos + 4

    addLine(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // Título del documento - Diseño profesional
    doc.setFillColor(25, 118, 210) // Azul institucional
    doc.setTextColor(0, 0, 0) // Negro para el título principal
    addRect(margin, yPosition, contentWidth, 15, 'F')
    yPosition = addText("FORMATO ÚNICO DE TRÁMITES (FUT)", pageWidth / 2, yPosition + 10, {
      size: 14,
      weight: "bold",
      align: "center"
    })
    doc.setTextColor(0, 0, 0)
    yPosition += 15

    // Información general del FUT - Diseño profesional en dos columnas
    doc.setFillColor(245, 245, 245)
    addRect(margin, yPosition, contentWidth, 28, 'F')
    
    // Línea divisoria vertical para las dos columnas
    const infoColumnWidth = (contentWidth - 10) / 2
    addLine(margin + infoColumnWidth + 5, yPosition + 2, margin + infoColumnWidth + 5, yPosition + 26)
    
    // Columna izquierda - Información básica
    let infoLeftY = yPosition + 8
    doc.setFont(undefined, "bold")
    addText(`Nº SOLICITUD: ${futRequest.requestNumber || "_______________"}`, margin + 5, infoLeftY, {
      size: 10,
    })
    doc.setFont(undefined, "normal")
    infoLeftY += 6
    doc.setFont(undefined, "bold")
    addText(`TIPO: ${futRequest.requestType || "_______________"}`, margin + 5, infoLeftY, {
      size: 10,
    })
    doc.setFont(undefined, "normal")
    
    // Columna derecha - Fechas
    let infoRightY = yPosition + 8
    doc.setFont(undefined, "bold")
    infoRightY = addText(`FECHA SOLICITUD:`, margin + infoColumnWidth + 10, infoRightY, {
      size: 9,
    })
    doc.setFont(undefined, "normal")
    infoRightY += 5
    addText(`${futRequest.createdAt ? new Date(futRequest.createdAt).toLocaleDateString("es-ES") : new Date().toLocaleDateString("es-ES")}`, margin + infoColumnWidth + 10, infoRightY, {
      size: 9,
    })
    infoRightY += 6
    doc.setFont(undefined, "bold")
    addText(`FECHA GENERACIÓN:`, margin + infoColumnWidth + 10, infoRightY, {
      size: 9,
    })
    doc.setFont(undefined, "normal")
    addText(`${new Date().toLocaleDateString("es-ES")} ${new Date().toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}`, margin + infoColumnWidth + 10, infoRightY + 5, {
      size: 8,
    })
    
    yPosition += 30

    // Urgencia y Estado - Diseño profesional
    doc.setFont(undefined, "bold")
    yPosition = addText(`URGENCIA: ${futRequest.urgencyLevel || "_______________"}`, margin, yPosition, {
      size: 10,
    })
    yPosition = addText(`ESTADO: ${futRequest.status || "_______________"}`, margin + 80, yPosition, {
      size: 10,
    })
    doc.setFont(undefined, "normal")
    yPosition += 10

    // DATOS DEL ESTUDIANTE Y APODERADO - Diseño profesional en dos columnas
    doc.setFillColor(33, 150, 243) // Azul más vibrante
    doc.setTextColor(0, 0, 0) // Texto negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 7, 'F')
    yPosition = addText("DATOS DEL ESTUDIANTE Y APODERADO", margin + 3, yPosition + 5, { size: 9, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 2

    // Buscar estudiante por ID de matrícula
    const requestStudent = students.find((s) => s.id === futRequest.studentEnrollmentId)
    
    // Obtener información del apoderado del estudiante o del FUT
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
    
    const guardianRelationship = requestStudent?.guardianRelationship || 
                                 "_______________"
    
    // Sección para datos en dos columnas
    const sectionHeight = 45
    addRect(margin, yPosition, contentWidth, sectionHeight, 'S')
    
    // Línea divisoria vertical para las dos columnas
    const columnWidth = (contentWidth - 10) / 2
    addLine(margin + columnWidth + 5, yPosition + 2, margin + columnWidth + 5, yPosition + sectionHeight - 2)
    
    // Columna izquierda - Datos del estudiante
    let leftY = yPosition + 7
    doc.setFont(undefined, "bold")
    doc.setTextColor(0, 0, 0) // Texto negro
    leftY = addText("DATOS DEL ESTUDIANTE", margin + 5, leftY, { size: 9 })
    doc.setFont(undefined, "normal")
    leftY += 3
    
    if (requestStudent) {
      addText(`Nombres: ${requestStudent.firstName} ${requestStudent.lastName}`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Documento: ${requestStudent.documentType} ${requestStudent.documentNumber}`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Fecha Nac: ${requestStudent.birthDate ? new Date(requestStudent.birthDate).toLocaleDateString("es-ES") : "_______________"}`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Género: ${requestStudent.gender === 'MALE' ? 'Masculino' : 'Femenino'}`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Dirección: ${requestStudent.address || "_______________"}`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Código: ${requestStudent.id || "_______________"}`, margin + 5, leftY, { size: 8 })
    } else {
      addText(`Nombres: _______________`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Documento: _______________`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Fecha Nac: _______________`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Género: _______________`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Dirección: _______________`, margin + 5, leftY, { size: 8 })
      leftY += 5
      addText(`Código: _______________`, margin + 5, leftY, { size: 8 })
    }
    
    // Columna derecha - Datos del apoderado
    let rightY = yPosition + 7
    doc.setFont(undefined, "bold")
    doc.setTextColor(0, 0, 0) // Texto negro
    rightY = addText("DATOS DEL APODERADO", margin + columnWidth + 10, rightY, { size: 9 })
    doc.setFont(undefined, "normal")
    rightY += 3
    
    addText(`Nombre: ${guardianName}`, margin + columnWidth + 10, rightY, { size: 8 })
    rightY += 5
    addText(`Documento: ${guardianDocument}`, margin + columnWidth + 10, rightY, { size: 8 })
    rightY += 5
    addText(`Parentesco: ${guardianRelationship}`, margin + columnWidth + 10, rightY, { size: 8 })
    rightY += 5
    addText(`Teléfono: ${guardianPhone}`, margin + columnWidth + 10, rightY, { size: 8 })
    rightY += 5
    addText(`Email: ${guardianEmail}`, margin + columnWidth + 10, rightY, { size: 8 })
    rightY += 5
    const addressLines = doc.splitTextToSize(`Dirección: ${guardianAddress}`, columnWidth - 10)
    addressLines.slice(0, 2).forEach((line) => {
      addText(line, margin + columnWidth + 10, rightY, { size: 8 })
      rightY += 4
    })
    
    yPosition += sectionHeight + 5

    // Asunto de la Solicitud - Diseño profesional
    doc.setFillColor(255, 152, 0) // Naranja
    doc.setTextColor(0, 0, 0) // Texto negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("ASUNTO DE LA SOLICITUD", margin + 3, yPosition + 6, { size: 10, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    addRect(margin, yPosition, contentWidth, 20, 'S')
    yPosition = addText(futRequest.requestSubject || "_______________", margin + 5, yPosition + 12, { size: 10 })
    yPosition += 12

    // Descripción detallada - Diseño profesional
    doc.setFillColor(156, 39, 176) // Púrpura
    doc.setTextColor(0, 0, 0) // Texto negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("DESCRIPCIÓN DETALLADA", margin + 3, yPosition + 6, { size: 10, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    // Dividir el espacio en dos columnas: descripción (75%) y firmas (25%)
    const descriptionWidth = contentWidth * 0.73
    const signaturesWidth = contentWidth * 0.25
    const gap = contentWidth * 0.02

    // Crear contenedores para ambas secciones
    const descriptionHeight = 42 // Altura optimizada
    
    // Contenedor de la descripción
    addRect(margin, yPosition, descriptionWidth, descriptionHeight, 'S')
    
    // Contenedor de las firmas
    addRect(margin + descriptionWidth + gap, yPosition, signaturesWidth, descriptionHeight, 'S')
    
    // Contenido de la descripción
    const description = futRequest.requestDescription || "_______________"
    const descriptionLines = doc.splitTextToSize(description, descriptionWidth - 6)
    
    let descY = yPosition + 5
    descriptionLines.slice(0, 5).forEach((line) => {
      if (descY < yPosition + descriptionHeight - 3) {
        addText(line, margin + 3, descY, { size: 8 })
        descY += 7
      }
    })
    
    // SECCIÓN DE FIRMAS - AL COSTADO DE LA DESCRIPCIÓN
    const signaturesX = margin + descriptionWidth + gap
    
    // Línea divisoria vertical entre descripción y firmas
    addLine(signaturesX - (gap/2), yPosition + 2, signaturesX - (gap/2), yPosition + descriptionHeight - 2)
    
    // Título de firmas
    doc.setFont(undefined, "bold")
    doc.setTextColor(0, 0, 0)
    addText("FIRMAS", signaturesX + (signaturesWidth/2), yPosition + 7, { size: 8, align: "center" })
    doc.setTextColor(0, 0, 0)
    
    // Línea divisoria horizontal para separar el título de las firmas
    addLine(signaturesX + 2, yPosition + 9, signaturesX + signaturesWidth - 2, yPosition + 9)
    
    // Dividir el área de firmas en dos secciones verticales
    const signatureSectionHeight = (descriptionHeight - 12) / 2
    
    // Firma del solicitante (apoderado) - arriba
    const requesterY = yPosition + 11
    doc.setFont(undefined, "bold")
    addText("SOLICITANTE", signaturesX + (signaturesWidth/2), requesterY + 5, { size: 7, align: "center" })
    doc.setFont(undefined, "normal")
    addText("________________", signaturesX + (signaturesWidth/2), requesterY + 11, { size: 7, align: "center" })
    addText("(Firma)", signaturesX + (signaturesWidth/2), requesterY + 16, { size: 6, align: "center" })
    
    // Firma de la institución - abajo
    const institutionY = requesterY + signatureSectionHeight + 1
    doc.setFont(undefined, "bold")
    addText("INSTITUCIÓN", signaturesX + (signaturesWidth/2), institutionY + 5, { size: 7, align: "center" })
    doc.setFont(undefined, "normal")
    addText("________________", signaturesX + (signaturesWidth/2), institutionY + 11, { size: 7, align: "center" })
    addText("(Firma)", signaturesX + (signaturesWidth/2), institutionY + 16, { size: 6, align: "center" })
    
    yPosition += descriptionHeight + 5

    // Documentos Adjuntos - Diseño profesional
    doc.setFillColor(233, 30, 99) // Rosa
    doc.setTextColor(0, 0, 0) // Texto negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("DOCUMENTOS ADJUNTOS", margin + 3, yPosition + 6, { size: 10, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    if (futRequest.attachedDocuments && Object.keys(futRequest.attachedDocuments).length > 0) {
      const documents = Object.entries(futRequest.attachedDocuments)
      const documentsHeight = Math.max(30, documents.length * 8 + 10)
      addRect(margin, yPosition, contentWidth, documentsHeight, 'S')
      let docListY = yPosition + 7
      documents.slice(0, 5).forEach(([, fileData], index) => { // Mostrar hasta 5 documentos
        const docInfo = `${index + 1}. ${fileData.name} (${formatFileSize(fileData.size)})`
        addText(docInfo, margin + 5, docListY, { size: 9 })
        docListY += 7
      })
      yPosition += documentsHeight + 5
    } else {
      addRect(margin, yPosition, contentWidth, 20, 'S')
      yPosition = addText("No se adjuntaron documentos", margin + 5, yPosition + 12, { size: 10 })
      yPosition += 25
    }

    // Notas administrativas - Diseño profesional
    doc.setFillColor(139, 195, 74) // Verde claro
    doc.setTextColor(0, 0, 0) // Texto negro para mejor contraste
    addRect(margin, yPosition, contentWidth, 8, 'F')
    yPosition = addText("NOTAS ADMINISTRATIVAS", margin + 3, yPosition + 6, { size: 10, weight: "bold" })
    doc.setTextColor(0, 0, 0)
    yPosition += 3

    const adminNotes = futRequest.adminNotes || "Sin observaciones"
    const notesLines = doc.splitTextToSize(adminNotes, contentWidth - 10)
    const notesHeight = Math.max(25, notesLines.length * 6 + 10)
    addRect(margin, yPosition, contentWidth, notesHeight, 'S')
    
    let notesY = yPosition + 7
    notesLines.slice(0, 4).forEach((line) => {
      if (notesY < yPosition + notesHeight - 5) {
        addText(line, margin + 5, notesY, { size: 9 })
        notesY += 6
      }
    })
    yPosition += notesHeight + 5

    // Fecha estimada de entrega
    if (futRequest.estimatedDeliveryDate) {
      yPosition = addText(`FECHA ENTREGA: ${new Date(futRequest.estimatedDeliveryDate).toLocaleDateString("es-ES")}`, margin, yPosition, { size: 9, weight: "bold" })
      yPosition += 6
    }

    // Sello de recepción - Diseño profesional
    addRect(margin, yPosition, contentWidth, 25, 'S')
    doc.setFont(undefined, "bold")
    addText("SELLO DE RECEPCIÓN", pageWidth / 2, yPosition + 10, { size: 10, align: "center" })
    doc.setFont(undefined, "normal")
    addText("(Fecha y Hora de Recepción)", pageWidth / 2, yPosition + 16, { size: 8, align: "center" })
    addText("_______________________________", pageWidth / 2, yPosition + 22, { size: 8, align: "center" })
    yPosition += 30

    const fileName = `FUT_${futRequest.requestNumber}_${new Date().getTime()}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error("Error generating PDF:", error)
    return { success: false, error: "Error al generar el PDF" }
  }
}