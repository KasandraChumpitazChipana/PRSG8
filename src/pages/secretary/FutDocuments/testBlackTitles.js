import { generateModernFutPDF } from "./utils/futHelpers.modern";

// Mock data for testing
const mockFutRequest = {
  requestNumber: "FUT-2023-001",
  requestType: "CERTIFICADO",
  requestSubject: "Solicitud de Certificado de Estudios",
  requestDescription: "Por medio de la presente solicito se me entregue certificado de estudios correspondiente al presente año académico para trámites administrativos personales. Agradezco su pronta atención a la presente solicitud.",
  requestedBy: "María Elena Pérez Rodríguez",
  contactPhone: "987654321",
  contactEmail: "maria.perez@example.com",
  guardianDni: "12345678",
  guardianAddress: "Av. Principal 123, San Isidro, Lima",
  guardianDistrict: "San Isidro",
  guardianProvince: "Lima",
  urgencyLevel: "MEDIA",
  estimatedDeliveryDate: "2023-12-15T10:00:00Z",
  attachedDocuments: {
    "doc1": {
      name: "Copia de DNI.pdf",
      size: 1024000,
      type: "application/pdf"
    }
  },
  adminNotes: "Solicitud procesada. Documento listo para entrega el 15/12/2023.",
  status: "APROBADO",
  studentEnrollmentId: "STU001",
  createdAt: "2023-12-01T09:30:00Z"
};

const mockStudents = [
  {
    id: "STU001",
    firstName: "Carlos Alberto",
    lastName: "González Torres",
    documentType: "DNI",
    documentNumber: "98765432",
    birthDate: "2010-05-15T00:00:00Z",
    gender: "MALE",
    address: "Calle Secundaria 456, Miraflores, Lima",
    guardianDocumentType: "DNI",
    guardianDocumentNumber: "12345678",
    guardianPhone: "987654321",
    guardianEmail: "maria.perez@example.com",
    guardianAddress: "Av. Principal 123, San Isidro, Lima",
    guardianRelationship: "Madre"
  }
];

// Generate the PDF
console.log("Generating FUT PDF with black titles...");
try {
  const result = generateModernFutPDF(mockFutRequest, mockStudents);
  if (result.success) {
    console.log("PDF generated successfully:", result.fileName);
  } else {
    console.error("Error generating PDF:", result.error);
  }
} catch (error) {
  console.error("Unexpected error:", error);
}