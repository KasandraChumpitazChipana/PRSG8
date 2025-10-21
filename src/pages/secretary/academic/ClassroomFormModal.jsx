import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Select, InputNumber, Button, Modal, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import classroomService from '../../../services/academic/classroomService';
import periodService from '../../../services/academic/periodService';
import AlertModal from '../../../components/AlertModal';
import useAlert from '../../../hooks/useAlert';
import { ClassroomRequest, validateClassroom, ShiftEnum, getShiftText } from '../../../types/academic/classroom.types';

const { Option } = Select;

const ClassroomFormModal = ({
  visible,
  onCancel,
  onSuccess,
  classroomData = null,
  mode = 'create' // 'create' o 'edit'
}) => {
  const [form] = Form.useForm();
  const { alertState, showSuccess, showError, handleConfirm: alertConfirm, handleCancel: alertCancel } = useAlert();
  
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(mode === 'edit');
  const [periods, setPeriods] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Datos mock para headquarters (sedes)
  // IMPORTANTE: Usar el ID real que viene del backend
  const headquartersMock = [
    { id: '9fcee0af-3bf1-44dc-9d25-6fe540618a62', name: 'Sede Central' },
    { id: '112aa-wwa21-uuid-002', name: 'Sede Norte' },
    { id: '112aa-wwa21-uuid-003', name: 'Sede Sur' },
  ];

  useEffect(() => {
    if (visible) {
      loadInitialData();
      if (classroomData && mode === 'edit') {
        setIsEdit(true);
        populateForm(classroomData);
      } else {
        setIsEdit(false);
        resetForm();
      }
    }
  }, [visible, classroomData, mode]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Cargar períodos desde el backend
      const periodResponse = await periodService.getAllPeriods();
      if (periodResponse.success) {
        // Construir nombres de períodos
        const periodsWithNames = (periodResponse.data || []).map(period => {
          const periodTypeMap = {
            'BIMESTER': 'Bimestre',
            'TRIMESTER': 'Trimestre',
            'SEMESTER': 'Semestre',
            'ANNUAL': 'Anual'
          };
          const periodTypeName = periodTypeMap[period.periodType] || period.periodType;
          const name = `${period.period} ${periodTypeName} - ${period.academicYear} (${period.level})`;
          return {
            ...period,
            name: name
          };
        });
        setPeriods(periodsWithNames);
      }
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
    setLoadingData(false);
  };

  const resetForm = () => {
    form.resetFields();
  };

  const populateForm = (classroom) => {
    form.setFieldsValue({
      headquarterId: classroom.headquarterId,
      periodId: classroom.periodId,
      section: classroom.section,
      grade: classroom.grade,
      shift: classroom.shift,
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const classroomPayload = new ClassroomRequest({
        headquarterId: values.headquarterId,
        periodId: values.periodId,
        section: values.section.toUpperCase(),
        grade: values.grade,
        shift: values.shift,
      });

      console.log('📤 Enviando payload al backend:', {
        isEdit,
        classroomId: classroomData?.id,
        payload: classroomPayload,
        formValues: values
      });

      const validationError = validateClassroom(classroomPayload);
      if (validationError) {
        showError(validationError);
        setLoading(false);
        return;
      }

      let response;
      if (isEdit && classroomData?.id) {
        console.log('🔄 Actualizando aula con ID:', classroomData.id);
        response = await classroomService.updateClassroom(classroomData.id, classroomPayload);
      } else {
        console.log('➕ Creando nueva aula');
        response = await classroomService.createClassroom(classroomPayload);
      }

      console.log('📥 Respuesta del backend:', response);

      if (response.success) {
        showSuccess(isEdit ? 'Aula actualizada exitosamente' : 'Aula creada exitosamente');
        form.resetFields();
        
        // Preparar datos para actualización local en el frontend
        const updatedData = {
          ...(response.data || {}),
          id: isEdit ? classroomData.id : (response.data?.id || null),
          headquarterId: classroomPayload.headquarterId,
          periodId: classroomPayload.periodId,
          section: classroomPayload.section,
          grade: classroomPayload.grade,
          shift: classroomPayload.shift,
          status: classroomPayload.status
        };
        
        console.log('📤 Datos para actualización local:', updatedData);
        onSuccess && onSuccess(updatedData);
        onCancel();
      } else {
        showError(response.error || `Error al ${isEdit ? 'actualizar' : 'crear'} aula`);
      }
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err);
      showError(`Error al ${isEdit ? 'actualizar' : 'crear'} aula: ` + err.message);
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
        title={isEdit ? 'Editar Aula' : 'Nueva Aula'}
        open={visible}
        onCancel={handleModalCancel}
        width={700}
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
                label="Sede (Mock)"
                name="headquarterId"
                rules={[
                  { required: true, message: 'La sede es obligatoria' }
                ]}
                tooltip="Datos de prueba - usar '112aa-wwa21-uuid-001'"
              >
                <Select
                  placeholder="Seleccione una sede"
                  showSearch
                  optionFilterProp="children"
                >
                  {headquartersMock.map(hq => (
                    <Option key={hq.id} value={hq.id}>
                      {hq.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Período Académico"
                name="periodId"
                rules={[
                  { required: true, message: 'El período es obligatorio' }
                ]}
              >
                <Select
                  placeholder="Seleccione un período"
                  loading={loadingData}
                  disabled={loadingData}
                  showSearch
                  optionFilterProp="children"
                >
                  {periods.map(period => (
                    <Option key={period.id} value={period.id}>
                      {period.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Grado"
                name="grade"
                rules={[
                  { required: true, message: 'El grado es obligatorio' }
                ]}
              >
                <InputNumber
                  placeholder="1-6"
                  min={1}
                  max={6}
                  className="w-100"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Sección"
                name="section"
                rules={[
                  { required: true, message: 'La sección es obligatoria' },
                  { pattern: /^[A-Za-z]$/, message: 'Debe ser una letra (A, B, C, etc.)' }
                ]}
              >
                <Input
                  placeholder="A, B, C..."
                  maxLength={1}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Turno"
                name="shift"
                rules={[
                  { required: true, message: 'El turno es obligatorio' }
                ]}
              >
                <Select placeholder="Seleccione un turno">
                  <Option value={ShiftEnum.MORNING}>{getShiftText(ShiftEnum.MORNING)}</Option>
                  <Option value={ShiftEnum.AFTERNOON}>{getShiftText(ShiftEnum.AFTERNOON)}</Option>
                  <Option value={ShiftEnum.NIGHT}>{getShiftText(ShiftEnum.NIGHT)}</Option>
                </Select>
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

ClassroomFormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  classroomData: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
};

ClassroomFormModal.defaultProps = {
  onSuccess: null,
  classroomData: null,
};

export default ClassroomFormModal;
