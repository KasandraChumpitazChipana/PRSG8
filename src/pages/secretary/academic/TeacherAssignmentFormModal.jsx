import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Modal, Row, Col, Select, DatePicker, Spin, Input, Space } from 'antd';
import { SaveOutlined, UserOutlined, BookOutlined, HomeOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import teacherAssignmentService from '../../../services/academic/teacherAssignmentService';
import courseService from '../../../services/academic/courseService';
import classroomService from '../../../services/academic/classroomService';
import directorUserService from '../../../services/users/directorUserService';
import AlertModal from '../../../components/AlertModal';
import useAlert from '../../../hooks/useAlert';
import { TeacherAssignmentRequest, validateTeacherAssignment } from '../../../types/academic/teacherAssignment.types';

const { Option } = Select;

const TeacherAssignmentFormModal = ({
  visible,
  onCancel,
  onSuccess,
  assignmentData = null,
  mode = 'create' // 'create' o 'edit'
}) => {
  const [form] = Form.useForm();
  const { alertState, showSuccess, showError, handleConfirm: alertConfirm, handleCancel: alertCancel } = useAlert();
  
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(mode === 'edit');
  
  // Estados para las opciones de los selectores
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  
  // Estados de carga
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  
  // Estado para modo manual de profesor
  const [manualTeacherMode, setManualTeacherMode] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAllData();
      if (assignmentData && mode === 'edit') {
        setIsEdit(true);
        populateForm(assignmentData);
      } else {
        setIsEdit(false);
        resetForm();
      }
    } else {
      // Resetear el modo manual cuando se cierra el modal
      setManualTeacherMode(false);
    }
  }, [visible, assignmentData, mode]);
  
  // Auto-activar modo manual si no hay profesores disponibles
  useEffect(() => {
    if (!loadingTeachers && teachers.length === 0 && visible) {
      setManualTeacherMode(true);
    }
  }, [loadingTeachers, teachers, visible]);

  /**
   * Cargar todos los datos necesarios para los selectores
   */
  const loadAllData = async () => {
    await Promise.all([
      loadTeachers(),
      loadCourses(),
      loadClassrooms()
    ]);
  };

  /**
   * Cargar lista de profesores (TEACHER role)
   */
  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await directorUserService.getStaffByRole('TEACHER');
      if (response.success) {
        setTeachers(response.data || []);
        console.log('✅ Profesores cargados:', response.data);
      } else {
        console.error('❌ Error al cargar profesores:', response.error);
        setTeachers([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar profesores:', error);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  /**
   * Cargar lista de cursos
   */
  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await courseService.getAllCourses();
      if (response.success) {
        setCourses(response.data || []);
        console.log('✅ Cursos cargados:', response.data);
      } else {
        console.error('❌ Error al cargar cursos:', response.error);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar cursos:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  /**
   * Cargar lista de aulas
   */
  const loadClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const response = await classroomService.getAllClassrooms();
      if (response.success) {
        setClassrooms(response.data || []);
        console.log('✅ Aulas cargadas:', response.data);
      } else {
        console.error('❌ Error al cargar aulas:', response.error);
        setClassrooms([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar aulas:', error);
      setClassrooms([]);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
  };

  const populateForm = (assignment) => {
    form.setFieldsValue({
      teacherId: assignment.teacherId,
      courseId: assignment.courseId,
      classroomId: assignment.classroomId,
      assignmentDate: assignment.assignmentDate ? moment(assignment.assignmentDate) : moment()
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Formatear la fecha
      const assignmentDate = values.assignmentDate 
        ? values.assignmentDate.format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

      const assignmentPayload = new TeacherAssignmentRequest({
        teacherId: values.teacherId,
        courseId: values.courseId,
        classroomId: values.classroomId,
        assignmentDate: assignmentDate,
        assignmentType: 'REGULAR'
      });

      console.log('📤 Enviando asignación:', assignmentPayload);

      const validationError = validateTeacherAssignment(assignmentPayload);
      if (validationError) {
        showError(validationError);
        setLoading(false);
        return;
      }

      let response;
      if (isEdit && assignmentData?.id) {
        response = await teacherAssignmentService.updateTeacherAssignment(assignmentData.id, assignmentPayload);
      } else {
        response = await teacherAssignmentService.createTeacherAssignment(assignmentPayload);
      }

      if (response.success) {
        showSuccess(isEdit ? 'Asignación actualizada exitosamente' : 'Asignación creada exitosamente');
        form.resetFields();
        onSuccess && onSuccess(response.data);
        onCancel();
      } else {
        showError(response.error || `Error al ${isEdit ? 'actualizar' : 'crear'} asignación`);
      }
    } catch (err) {
      showError(`Error al ${isEdit ? 'actualizar' : 'crear'} asignación: ` + err.message);
    }
    setLoading(false);
  };

  const handleModalCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <>
      <Modal
        title={isEdit ? 'Editar Asignación Docente' : 'Nueva Asignación Docente'}
        open={visible}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Profesor</span>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setManualTeacherMode(!manualTeacherMode)}
                      style={{ padding: 0, height: 'auto' }}
                    >
                      {manualTeacherMode ? 'Usar lista' : 'Ingresar ID manual'}
                    </Button>
                  </Space>
                }
                name="teacherId"
                rules={[
                  { required: true, message: 'El profesor es obligatorio' }
                ]}
              >
                {manualTeacherMode ? (
                  <Input
                    placeholder="Ingrese el ID del profesor"
                    prefix={<UserOutlined />}
                    allowClear
                  />
                ) : (
                  <Select
                    showSearch
                    placeholder="Buscar o seleccionar un profesor"
                    loading={loadingTeachers}
                    optionFilterProp="children"
                    allowClear
                    filterOption={(input, option) => {
                      const text = option.children.join(' ').toLowerCase();
                      return text.includes(input.toLowerCase());
                    }}
                    notFoundContent={loadingTeachers ? <Spin size="small" /> : 'No hay profesores disponibles'}
                    suffixIcon={<UserOutlined />}
                    style={{ width: '100%' }}
                  >
                    {teachers.map(teacher => (
                      <Option key={teacher.id || teacher.keycloakId} value={teacher.id || teacher.keycloakId}>
                        {teacher.firstname || teacher.firstName || ''} {teacher.lastname || teacher.lastName || ''}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Curso"
                name="courseId"
                rules={[
                  { required: true, message: 'El curso es obligatorio' }
                ]}
              >
                <Select
                  showSearch
                  placeholder="Seleccione un curso"
                  loading={loadingCourses}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent={loadingCourses ? <Spin size="small" /> : 'No hay cursos disponibles'}
                  suffixIcon={<BookOutlined />}
                >
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>
                      {course.courseName || course.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Aula"
                name="classroomId"
                rules={[
                  { required: true, message: 'El aula es obligatoria' }
                ]}
              >
                <Select
                  showSearch
                  placeholder="Seleccione un aula"
                  loading={loadingClassrooms}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent={loadingClassrooms ? <Spin size="small" /> : 'No hay aulas disponibles'}
                  suffixIcon={<HomeOutlined />}
                >
                  {classrooms.map(classroom => (
                    <Option key={classroom.id} value={classroom.id}>
                      {classroom.classroomName || classroom.name} {classroom.level ? `- Nivel: ${classroom.level}` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Fecha de Asignación"
                name="assignmentDate"
                rules={[
                  { required: true, message: 'La fecha de asignación es obligatoria' }
                ]}
                initialValue={moment()}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Seleccione la fecha"
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button onClick={handleModalCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
            </Button>
          </div>
        </Form>
      </Modal>

      <AlertModal alert={alertState} onConfirm={alertConfirm} onCancel={alertCancel} />
    </>
  );
};

TeacherAssignmentFormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  assignmentData: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
};

TeacherAssignmentFormModal.defaultProps = {
  onSuccess: null,
  assignmentData: null,
};

export default TeacherAssignmentFormModal;
