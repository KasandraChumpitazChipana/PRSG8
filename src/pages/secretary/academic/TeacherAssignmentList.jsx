import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Input, Select, Dropdown, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { MoreHorizontal } from 'react-feather';
import teacherAssignmentService from '../../../services/academic/teacherAssignmentService';
import courseService from '../../../services/academic/courseService';
import classroomService from '../../../services/academic/classroomService';
import directorUserService from '../../../services/users/directorUserService';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import AlertModal from '../../../components/AlertModal';
import useAlert from '../../../hooks/useAlert';
import academicExporter from '../../../utils/academic/academicExporter';
import { filterByStatus, getStatusColor, getStatusText } from '../../../utils/academic/academicHelpers';
import TeacherAssignmentFormModal from './TeacherAssignmentFormModal';
import TeacherAssignmentDetailModal from './TeacherAssignmentDetailModal';

const { Option } = Select;

const TeacherAssignmentList = () => {
  const { alertState, showAlert, showSuccess, showError, handleConfirm: alertConfirm, handleCancel: alertCancel } = useAlert();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  
  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  
  // Estados para el modal de detalle
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAssignmentForDetail, setSelectedAssignmentForDetail] = useState(null);

  // Reference data for enrichment
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    loadReferenceData();
    loadAssignments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, searchTerm, statusFilter]);

  const loadReferenceData = async () => {
    try {
      const [teachersResponse, coursesResponse, classroomsResponse] = await Promise.all([
        directorUserService.getStaffByRole('TEACHER'),
        courseService.getAllCourses(),
        classroomService.getAllClassrooms()
      ]);
      
      console.log('📊 Datos de referencia cargados:', {
        teachers: teachersResponse,
        courses: coursesResponse,
        classrooms: classroomsResponse
      });
      
      // Handle potential response wrappers
      const teachersData = teachersResponse?.success ? (teachersResponse.data || []) : (teachersResponse?.data || teachersResponse || []);
      const coursesData = coursesResponse?.success ? (coursesResponse.data || []) : (coursesResponse?.data || coursesResponse || []);
      const classroomsData = classroomsResponse?.success ? (classroomsResponse.data || []) : (classroomsResponse?.data || classroomsResponse || []);
      
      console.log('📊 Datos procesados:', {
        teachersCount: Array.isArray(teachersData) ? teachersData.length : 0,
        coursesCount: Array.isArray(coursesData) ? coursesData.length : 0,
        classroomsCount: Array.isArray(classroomsData) ? classroomsData.length : 0
      });
      
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
    } catch (error) {
      console.error('Error loading reference data:', error);
      setTeachers([]);
      setCourses([]);
      setClassrooms([]);
    }
  };

  const enrichAssignmentData = (assignment) => {
    // Ensure reference data are arrays
    const teachersArray = Array.isArray(teachers) ? teachers : [];
    const coursesArray = Array.isArray(courses) ? courses : [];
    const classroomsArray = Array.isArray(classrooms) ? classrooms : [];

    const teacher = teachersArray.find(t => t.id === assignment.teacherId || t.keycloakId === assignment.teacherId);
    const course = coursesArray.find(c => c.id === assignment.courseId);
    const classroom = classroomsArray.find(c => c.id === assignment.classroomId);

    // Log for debugging
    if (assignment.teacherId && !teacher && teachersArray.length > 0) {
      console.log('⚠️ No se encontró profesor:', {
        teacherId: assignment.teacherId,
        availableTeachers: teachersArray.map(t => ({ id: t.id, keycloakId: t.keycloakId, name: `${t.firstname} ${t.lastname}` }))
      });
    }

    return {
      ...assignment,
      teacherName: teacher ? `${teacher.firstname || teacher.firstName || ''} ${teacher.lastname || teacher.lastName || ''}`.trim() : assignment.teacherId,
      courseName: course ? course.courseName : assignment.courseId,
      classroomName: classroom ? classroom.classroomName : assignment.classroomId
    };
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await teacherAssignmentService.getAllTeacherAssignments();
      if (response.success) {
        setAssignments(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.error || 'Error al cargar asignaciones docentes');
        setAssignments([]);
      }
    } catch (err) {
      showError('Error al cargar asignaciones docentes: ' + err.message);
      setAssignments([]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...assignments];
    
    // Enrich data with names
    filtered = filtered.map(enrichAssignmentData);
    
    // Apply status filter
    filtered = filterByStatus(filtered, statusFilter);
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.teacherName?.toLowerCase().includes(search) ||
        a.courseName?.toLowerCase().includes(search) ||
        a.classroomName?.toLowerCase().includes(search)
      );
    }

    setFilteredAssignments(filtered);
  };

  const handleDeleteAssignment = async (id, teacherId) => {
    showAlert({
      title: '¿Está seguro de eliminar esta asignación?',
      message: `Se eliminará la asignación del profesor "${teacherId}". Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await teacherAssignmentService.deleteTeacherAssignment(id);
          if (response.success) {
            showSuccess('Asignación eliminada correctamente');
            loadAssignments();
          } else {
            showError(response.error || 'Error al eliminar asignación');
          }
        } catch (err) {
          showError('Error al eliminar asignación: ' + err.message);
        }
      }
    });
  };

  const handleExport = () => {
    try {
      const success = academicExporter.exportTeacherAssignments(filteredAssignments);
      if (success) {
        showSuccess('Asignaciones exportadas exitosamente');
      } else {
        showError('Error al exportar asignaciones');
      }
    } catch (error) {
      showError('Error al exportar asignaciones: ' + error.message);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedAssignment(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleOpenEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAssignment(null);
  };

  const handleModalSuccess = () => {
    loadAssignments();
  };
  
  const handleOpenDetailModal = (assignment) => {
    setSelectedAssignmentForDetail(assignment);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedAssignmentForDetail(null);
  };

  const columns = [
    {
      title: 'Profesor',
      dataIndex: 'teacherName',
      key: 'teacherName',
      sorter: (a, b) => (a.teacherName || '').localeCompare(b.teacherName || ''),
      width: 200,
    },
    {
      title: 'Curso',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => (a.courseName || '').localeCompare(b.courseName || ''),
      width: 200,
    },
    {
      title: 'Aula',
      dataIndex: 'classroomName',
      key: 'classroomName',
      sorter: (a, b) => (a.classroomName || '').localeCompare(b.classroomName || ''),
      width: 150,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'Ver Detalles',
            icon: <EyeOutlined />,
            onClick: () => handleOpenDetailModal(record),
          },
          {
            key: 'edit',
            label: 'Editar',
            icon: <EditOutlined />,
            onClick: () => handleOpenEditModal(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteAssignment(record.id, record.teacherName),
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreHorizontal size={16} />} onClick={(e) => e.preventDefault()} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <div className="page-sub-header">
                  <h3 className="page-title">Gestión de Asignaciones Docentes</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Asignaciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table">
                <div className="card-body">
                  <div className="row mb-3 mt-3">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                      <Input
                        placeholder="Buscar por profesor, curso, aula..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-lg-2 col-md-3 col-sm-6 mb-2">
                      <Select value={statusFilter} onChange={setStatusFilter} className="w-100">
                        <Option value="all">Todos los estados</Option>
                        <Option value="A">Activo</Option>
                        <Option value="I">Inactivo</Option>
                      </Select>
                    </div>
                    <div className="col-lg-4 col-md-12 col-sm-12 mb-2">
                      <div className="d-flex flex-wrap justify-content-end gap-2">
                        <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={filteredAssignments.length === 0}>
                          Exportar
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                          Nueva Asignación
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table
                      columns={columns}
                      dataSource={filteredAssignments}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        total: filteredAssignments.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} asignaciones`,
                      }}
                      scroll={{ x: 1000 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sidebar />
      <Header />
      <AlertModal alert={alertState} onConfirm={alertConfirm} onCancel={alertCancel} />
      
      <TeacherAssignmentFormModal
        visible={modalVisible}
        onCancel={handleCloseModal}
        onSuccess={handleModalSuccess}
        assignmentData={selectedAssignment}
        mode={modalMode}
      />
      
      <TeacherAssignmentDetailModal
        visible={detailModalVisible}
        onCancel={handleCloseDetailModal}
        assignmentData={selectedAssignmentForDetail}
      />
    </>
  );
};

export default TeacherAssignmentList;
